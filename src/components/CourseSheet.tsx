import { useState } from 'react'
import { db } from '../db'
import type { Course } from '../db/types'
import { COURSE_COLORS, DAY_LABELS, DAY_SHORT } from '../lib/course'
import Sheet from './Sheet'
import { IconTrash } from './Icons'

const MAX_SLOT = 12

type Props = {
  open: boolean
  initial?: Course | null
  preset?: { day: number; startSlot: number } | null
  onClose: () => void
}

export default function CourseSheet({ open, initial, preset, onClose }: Props) {
  return (
    <Sheet open={open} title={initial ? '编辑这门课' : '添加课程'} onClose={onClose}>
      <CourseForm
        key={initial?.id ?? `new-${preset?.day ?? ''}-${preset?.startSlot ?? ''}`}
        initial={initial}
        preset={preset}
        onDone={onClose}
      />
    </Sheet>
  )
}

function CourseForm({
  initial,
  preset,
  onDone,
}: {
  initial?: Course | null
  preset?: { day: number; startSlot: number } | null
  onDone: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [day, setDay] = useState(initial?.day ?? preset?.day ?? 1)
  const [startSlot, setStartSlot] = useState(initial?.startSlot ?? preset?.startSlot ?? 1)
  const [slotCount, setSlotCount] = useState(initial?.slotCount ?? 1)
  const [room, setRoom] = useState(initial?.room ?? '')
  const [teacher, setTeacher] = useState(initial?.teacher ?? '')
  const [color, setColor] = useState(initial?.color ?? COURSE_COLORS[0].key)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const maxCount = MAX_SLOT - startSlot + 1

  async function save() {
    const n = name.trim()
    if (!n) return
    const data = {
      name: n,
      day,
      startSlot,
      slotCount: Math.min(slotCount, maxCount),
      room: room.trim(),
      teacher: teacher.trim(),
      color,
      createdAt: initial?.createdAt ?? Date.now(),
    }
    if (initial?.id) {
      await db.courses.update(initial.id, data)
    } else {
      await db.courses.add(data)
    }
    onDone()
  }

  async function remove() {
    if (!initial?.id) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    await db.courses.delete(initial.id)
    onDone()
  }

  return (
    <div>
      <label className="field-label">课程名</label>
      <input
        className="field"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="比如：高等数学"
        autoFocus
      />

      <label className="field-label" style={{ marginTop: 14 }}>周几</label>
      <div className="day-picker">
        {DAY_LABELS.map((label, i) => (
          <button
            key={label}
            className={`day-opt${day === i + 1 ? ' on' : ''}`}
            onClick={() => setDay(i + 1)}
          >
            {DAY_SHORT[i]}
          </button>
        ))}
      </div>

      <div className="form-row">
        <div>
          <label className="field-label">从第几节开始</label>
          <div className="stepper compact">
            <button onClick={() => setStartSlot((v) => Math.max(1, v - 1))}>−</button>
            <span className="num">{startSlot}</span>
            <button onClick={() => setStartSlot((v) => Math.min(MAX_SLOT, v + 1))}>＋</button>
          </div>
        </div>
        <div>
          <label className="field-label">连上几节</label>
          <div className="stepper compact">
            <button onClick={() => setSlotCount((v) => Math.max(1, v - 1))}>−</button>
            <span className="num">{slotCount}</span>
            <button onClick={() => setSlotCount((v) => Math.min(maxCount, v + 1))}>＋</button>
          </div>
        </div>
      </div>

      <div className="form-row" style={{ marginTop: 14 }}>
        <div>
          <label className="field-label">教室（可不填）</label>
          <input
            className="field"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="A301"
          />
        </div>
        <div>
          <label className="field-label">老师（可不填）</label>
          <input
            className="field"
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
            placeholder="王老师"
          />
        </div>
      </div>

      <label className="field-label" style={{ marginTop: 14 }}>标记颜色</label>
      <div className="color-picker">
        {COURSE_COLORS.map((c) => (
          <button
            key={c.key}
            className={`color-opt${color === c.key ? ' on' : ''}`}
            style={{
              background: c.bg,
              boxShadow:
                color === c.key
                  ? '0 0 0 2px var(--paper), 0 0 0 4px var(--ink)'
                  : 'inset 0 0 0 1px rgba(74, 56, 48, 0.1)',
            }}
            onClick={() => setColor(c.key)}
            aria-label={c.key}
          />
        ))}
      </div>

      <button className="btn block" style={{ marginTop: 22 }} onClick={save} disabled={!name.trim()}>
        保存课程
      </button>

      {initial?.id && (
        <button
          className={`btn ghost block${confirmDelete ? ' danger-text' : ''}`}
          style={{ marginTop: 10 }}
          onClick={remove}
        >
          <IconTrash size={16} />
          {confirmDelete ? '再点一次，确定删除' : '删除这门课'}
        </button>
      )}
    </div>
  )
}
