import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { TaskTag } from '../db/types'
import { isToday, parseKey, toKey, todayKey } from '../lib/date'
import Sheet from './Sheet'
import { IconLeft, IconRight } from './Icons'

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日']

const DOT_COLORS: Record<TaskTag, string> = {
  study: '#8bb9d6',
  sport: '#9fc9a8',
  life: '#f0c564',
  work: '#b3a4d8',
}

type Cell = { key: string; day: number; inMonth: boolean }

/** 以周一开头，固定 6 行 x 7 列 */
function buildGrid(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - offset)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return { key: toKey(d), day: d.getDate(), inMonth: d.getMonth() === month }
  })
}

type Props = {
  open: boolean
  value: string
  onPick: (date: string) => void
  onClose: () => void
}

export default function CalendarSheet({ open, value, onPick, onClose }: Props) {
  const selected = parseKey(value || todayKey())
  const [viewYear, setViewYear] = useState(selected.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected.getMonth())

  // 每次打开都回到当前选中日期所在的月份
  useEffect(() => {
    if (!open) return
    const d = parseKey(value || todayKey())
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }, [open, value])

  const grid = useMemo(() => buildGrid(viewYear, viewMonth), [viewYear, viewMonth])
  const firstKey = grid[0].key
  const lastKey = grid[grid.length - 1].key

  const tasks = useLiveQuery(
    () => db.tasks.where('date').between(firstKey, lastKey, true, true).toArray(),
    [firstKey, lastKey],
  )

  const dotsByDate = useMemo(() => {
    const map = new Map<string, TaskTag[]>()
    for (const t of tasks ?? []) {
      const tags = map.get(t.date)
      if (!tags) map.set(t.date, [t.tag])
      else if (!tags.includes(t.tag)) tags.push(t.tag)
    }
    return map
  }, [tasks])

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  return (
    <Sheet open={open} title="选个日子" onClose={onClose}>
      <div className="cal-head">
        <button className="icon-btn" onClick={() => shiftMonth(-1)} aria-label="上个月">
          <IconLeft size={17} />
        </button>
        <span className="cal-title">
          {viewYear}年{viewMonth + 1}月
        </span>
        <button className="icon-btn" onClick={() => shiftMonth(1)} aria-label="下个月">
          <IconRight size={17} />
        </button>
      </div>

      <div className="cal-week">
        {WEEK_LABELS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="cal-grid">
        {grid.map((cell) => {
          const tags = dotsByDate.get(cell.key) ?? []
          const isSel = cell.key === value
          const today = isToday(cell.key)
          return (
            <button
              key={cell.key}
              className={`cal-day${cell.inMonth ? '' : ' out'}${today ? ' today' : ''}${isSel ? ' sel' : ''}`}
              onClick={() => onPick(cell.key)}
              aria-label={`${cell.key}${tags.length ? '，有安排' : ''}`}
            >
              <span className="cal-num">{cell.day}</span>
              <span className="cal-dots">
                {tags.slice(0, 3).map((t) => (
                  <i key={t} style={{ background: isSel ? 'rgba(255,255,255,0.9)' : DOT_COLORS[t] }} />
                ))}
              </span>
            </button>
          )
        })}
      </div>

      <div className="cal-legend">
        <span><i style={{ background: DOT_COLORS.study }} />学习</span>
        <span><i style={{ background: DOT_COLORS.sport }} />运动</span>
        <span><i style={{ background: DOT_COLORS.life }} />生活</span>
        <span><i style={{ background: DOT_COLORS.work }} />工作</span>
      </div>

      <button className="btn ghost block" style={{ marginTop: 14 }} onClick={() => onPick(todayKey())}>
        回到今天
      </button>
    </Sheet>
  )
}
