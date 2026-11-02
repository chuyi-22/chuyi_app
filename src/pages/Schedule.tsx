import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Course } from '../db/types'
import {
  courseColor,
  DAY_LABELS,
  isOverlap,
  SLOT_COUNT,
  SLOT_TIMES,
  slotLabel,
} from '../lib/course'
import { addDays, todayKey, weekStartKey } from '../lib/date'
import { Empty, PageHead } from '../components/ui'
import CourseSheet from '../components/CourseSheet'
import { IconPlus } from '../components/Icons'

const ROW_H = 58
const COL_W = 64
const GUTTER = 38

export default function Schedule() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [preset, setPreset] = useState<{ day: number; startSlot: number } | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const courses = useLiveQuery(() => db.courses.toArray(), [])
  const list = (courses ?? [])
    .slice()
    .sort((a, b) => a.day - b.day || a.startSlot - b.startSlot)

  const today = todayKey()
  const weekStart = weekStartKey()
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const conflictIds = useMemo(() => {
    const ids = new Set<number>()
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]
        const b = list[j]
        if (isOverlap(a, b)) {
          if (a.id) ids.add(a.id)
          if (b.id) ids.add(b.id)
        }
      }
    }
    return ids
  }, [list])

  function openNew(day?: number, startSlot?: number) {
    setEditing(null)
    setPreset(day ? { day, startSlot: startSlot ?? 1 } : null)
    setSheetOpen(true)
  }

  function openEdit(course: Course) {
    setEditing(course)
    setPreset(null)
    setSheetOpen(true)
  }

  async function requestDelete(course: Course) {
    if (!course.id) return
    if (confirmId === course.id) {
      await db.courses.delete(course.id)
      setConfirmId(null)
      return
    }
    setConfirmId(course.id)
    window.setTimeout(() => setConfirmId((c) => (c === course.id ? null : c)), 3000)
  }

  return (
    <div className="page stagger">
      <PageHead
        eyebrow="一周的节奏"
        title="我的课表"
        sub={list.length ? `共 ${list.length} 门课` : '还没有课程，来录入第一门'}
        action={
          <button className="icon-btn" onClick={() => openNew()} aria-label="添加课程">
            <IconPlus size={20} />
          </button>
        }
      />

      <div className="seg" style={{ marginBottom: 14 }}>
        <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')}>
          网格
        </button>
        <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>
          列表
        </button>
      </div>

      {list.length === 0 ? (
        <div className="card">
          <Empty emoji="📅" text="课表还是空的，点右上角加第一门课吧" />
          <button className="btn block" onClick={() => openNew()}>
            <IconPlus size={18} />
            录入第一门课
          </button>
        </div>
      ) : view === 'grid' ? (
        <>
          <p className="tt-hint">点空白格子直接添加 · 左右滑动看完整一周</p>

          <div className="tt-scroll">
            <div className="tt" style={{ width: GUTTER + 7 * COL_W }}>
              <div className="tt-head">
                <div className="tt-corner" style={{ width: GUTTER }} />
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={label}
                    className={`tt-dayhead${weekDates[i] === today ? ' today' : ''}`}
                    style={{ width: COL_W }}
                  >
                    <span className="tt-dayname">{label}</span>
                    <span className="tt-daydate">{weekDates[i].slice(5)}</span>
                  </div>
                ))}
              </div>

              <div className="tt-body" style={{ height: SLOT_COUNT * ROW_H }}>
                <div className="tt-slots" style={{ width: GUTTER }}>
                  {SLOT_TIMES.map((t, i) => (
                    <div className="tt-slot" key={i} style={{ height: ROW_H }}>
                      <span className="tt-slot-num">{i + 1}</span>
                      <span className="tt-slot-time">{t.start}</span>
                      <span className="tt-slot-time">{t.end}</span>
                    </div>
                  ))}
                </div>

                <div className="tt-cols" style={{ width: 7 * COL_W, height: SLOT_COUNT * ROW_H }}>
                  {Array.from({ length: SLOT_COUNT }, (_, s) =>
                    Array.from({ length: 7 }, (_, d) => (
                      <button
                        key={`${s}-${d}`}
                        className="tt-cell"
                        style={{ top: s * ROW_H, left: d * COL_W, width: COL_W, height: ROW_H }}
                        onClick={() => openNew(d + 1, s + 1)}
                        aria-label={`${DAY_LABELS[d]} 第 ${s + 1} 节，添加课程`}
                      />
                    )),
                  )}

                  {list.map((c) => {
                    const col = courseColor(c.color)
                    const conflict = c.id ? conflictIds.has(c.id) : false
                    return (
                      <div
                        key={c.id}
                        className={`tt-course${conflict ? ' has-conflict' : ''}`}
                        style={{
                          top: (c.startSlot - 1) * ROW_H + 2,
                          left: (c.day - 1) * COL_W + 2,
                          width: COL_W - 4,
                          height: c.slotCount * ROW_H - 4,
                          background: col.bg,
                          borderColor: col.line,
                        }}
                        onClick={() => openEdit(c)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') openEdit(c)
                        }}
                      >
                        {conflict && <span className="tt-conflict">冲突</span>}
                        <span className="tt-course-name">{c.name}</span>
                        {c.room && <span className="tt-course-meta">@{c.room}</span>}
                        {c.teacher && <span className="tt-course-meta">@{c.teacher}</span>}
                        <button
                          className={`tt-course-del${confirmId === c.id ? ' confirm' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            requestDelete(c)
                          }}
                          aria-label="删除课程"
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="course-list">
          {DAY_LABELS.map((label, i) => {
            const items = list.filter((c) => c.day === i + 1)
            if (items.length === 0) return null
            return (
              <div key={label} className="course-day-group">
                <div className="course-day-head">
                  <span>
                    {label} <em>{weekDates[i].slice(5)}</em>
                  </span>
                  <span className="faint">{items.length} 门</span>
                </div>
                {items.map((c) => {
                  const col = courseColor(c.color)
                  const conflict = c.id ? conflictIds.has(c.id) : false
                  return (
                    <button key={c.id} className="course-row" onClick={() => openEdit(c)}>
                      <span className="course-bar" style={{ background: col.bg }} />
                      <div className="course-info">
                        <div className="course-name">{c.name}</div>
                        <div className="course-meta">
                          {slotLabel(c.startSlot, c.slotCount)}
                          {c.room ? ` · ${c.room}` : ''}
                        </div>
                      </div>
                      {conflict && <span className="tt-conflict">冲突</span>}
                      {c.teacher && <span className="chip">{c.teacher}</span>}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      <CourseSheet
        open={sheetOpen}
        initial={editing}
        preset={preset}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  )
}
