import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Task, TaskTag } from '../db/types'
import { addDays, isToday, monthDay, todayKey, weekday } from '../lib/date'
import { Empty, PageHead, TAG_META, Tag } from '../components/ui'
import { IconCheck, IconLeft, IconPlus, IconRight, IconTrash } from '../components/Icons'
import CalendarSheet from '../components/CalendarSheet'

const TAGS: TaskTag[] = ['study', 'sport', 'life', 'work']

export default function Today() {
  const [date, setDate] = useState(todayKey())
  const [calOpen, setCalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState<TaskTag>('study')
  const [popId, setPopId] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const tasks = useLiveQuery(
    () => db.tasks.where('date').equals(date).sortBy('createdAt'),
    [date],
  )

  const list = tasks ?? []
  const doneCount = list.filter((t) => t.done).length
  const total = list.length
  const percent = total ? Math.round((doneCount / total) * 100) : 0

  const dateLabel = useMemo(
    () => (isToday(date) ? '今天' : monthDay(date)),
    [date],
  )

  async function addTask() {
    const text = title.trim()
    if (!text) return
    await db.tasks.add({ title: text, date, done: false, tag, createdAt: Date.now() })
    setTitle('')
  }

  async function toggle(task: Task) {
    if (!task.id) return
    if (!task.done) {
      setPopId(task.id)
      window.setTimeout(() => setPopId(null), 420)
    }
    await db.tasks.update(task.id, { done: !task.done })
  }

  async function remove(task: Task) {
    if (!task.id) return
    if (confirmId !== task.id) {
      setConfirmId(task.id)
      window.setTimeout(() => setConfirmId((c) => (c === task.id ? null : c)), 3000)
      return
    }
    await db.tasks.delete(task.id)
    setConfirmId(null)
  }

  return (
    <div className="page stagger">
      <PageHead
        eyebrow={`${monthDay(date)} · ${weekday(date)}`}
        title={isToday(date) ? '今天的小事' : '那天的小事'}
        sub={total ? `已完成 ${doneCount} / ${total} 件` : '还没安排，先记一件吧'}
      />

      <div className="date-bar">
        <button className="icon-btn" onClick={() => setDate(addDays(date, -1))} aria-label="前一天">
          <IconLeft size={18} />
        </button>
        <button className="date-pill" onClick={() => setCalOpen(true)} aria-label="打开日历选日期">
          <span className="num" style={{ fontSize: 17 }}>{dateLabel}</span>
          <span className="date-caret" />
        </button>
        <button className="icon-btn" onClick={() => setDate(addDays(date, 1))} aria-label="后一天">
          <IconRight size={18} />
        </button>
      </div>

      {total > 0 && (
        <div className="card card-tight" style={{ marginBottom: 14, padding: '16px 18px' }}>
          <div className="between" style={{ marginBottom: 9 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 700 }}>今日进度</span>
            <span className="num" style={{ fontSize: 15, color: 'var(--coral-deep)' }}>{percent}%</span>
          </div>
          <div className="bar">
            <i style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}

      <div className="card card-tight">
        <div className="row" style={{ gap: 8 }}>
          <input
            className="field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="记一件想做的事…"
            style={{ background: 'var(--cream)' }}
          />
          <button className="add-btn" onClick={addTask} aria-label="添加任务" disabled={!title.trim()}>
            <IconPlus size={21} />
          </button>
        </div>
        <div className="tag-picker">
          {TAGS.map((t) => (
            <button
              key={t}
              className={`tag-pick${tag === t ? ' on' : ''} ${t}`}
              onClick={() => setTag(t)}
            >
              <span>{TAG_META[t].emoji}</span>
              {TAG_META[t].label}
            </button>
          ))}
        </div>
      </div>

      <div className="card tasks-card">
        {list.length === 0 ? (
          <Empty emoji="🌱" text="这一天还是空白，慢慢来就好" />
        ) : (
          list.map((task) => (
            <div className={`task-row${task.done ? ' is-done' : ''}`} key={task.id}>
              <button
                className={`check${task.done ? ' on' : ''}${popId === task.id ? ' pop' : ''}`}
                onClick={() => toggle(task)}
                aria-label={task.done ? '标记未完成' : '标记完成'}
              >
                <IconCheck size={15} strokeWidth={3} />
              </button>
              <div className="task-body">
                <div className={`task-title${task.done ? ' done' : ''}`}>{task.title}</div>
                <Tag tag={task.tag} />
              </div>
              <button
                className={`del-btn${confirmId === task.id ? ' danger' : ''}`}
                onClick={() => remove(task)}
                aria-label="删除"
              >
                {confirmId === task.id ? <span style={{ fontSize: 12, fontWeight: 700 }}>再点一次</span> : <IconTrash size={17} />}
              </button>
            </div>
          ))
        )}
      </div>

      {total > 0 && doneCount === total && (
        <div className="done-note">
          <img src="fish/success.webp" alt="" className="done-fish" />
          今天的事情都做完啦，给自己倒杯水吧
        </div>
      )}

      <CalendarSheet
        open={calOpen}
        value={date}
        onPick={(d) => {
          setDate(d)
          setCalOpen(false)
        }}
        onClose={() => setCalOpen(false)}
      />
    </div>
  )
}
