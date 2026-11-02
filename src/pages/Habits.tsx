import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Habit, HabitColor } from '../db/types'
import { addDays, isToday, lastDays, todayKey, weekday } from '../lib/date'
import { Empty, PageHead } from '../components/ui'
import Sheet from '../components/Sheet'
import { IconFlame, IconPlus, IconTrash } from '../components/Icons'

const COLORS: HabitColor[] = ['coral', 'sage', 'butter', 'sky', 'lilac']
const EMOJIS = ['💧', '🌙', '📚', '🏃', '🧘', '☀️', '🍎', '✍️', '🧹', '💊']

const colorValue: Record<HabitColor, string> = {
  coral: '#f4886e',
  sage: '#9fc9a8',
  butter: '#ffd98e',
  sky: '#a9cfe6',
  lilac: '#c9bce8',
}

function streakOf(days: Set<string>) {
  const today = todayKey()
  let cursor = days.has(today) ? today : addDays(today, -1)
  let n = 0
  while (days.has(cursor)) {
    n++
    cursor = addDays(cursor, -1)
  }
  return n
}

export default function Habits() {
  const [open, setOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const habits = useLiveQuery(() => db.habits.toArray())
  const week = lastDays(7)
  const logs = useLiveQuery(
    () => db.habitLogs.where('date').between(week[0], week[6], true, true).toArray(),
    [week[0], week[6]],
  )

  const list = habits ?? []
  const logList = logs ?? []
  const doneToday = list.filter((h) =>
    logList.some((l) => l.habitId === h.id && l.date === todayKey()),
  ).length

  async function toggle(habit: Habit, date: string) {
    if (!habit.id) return
    const existing = logList.find((l) => l.habitId === habit.id && l.date === date)
    if (existing?.id) {
      await db.habitLogs.delete(existing.id)
    } else {
      await db.habitLogs.add({ habitId: habit.id, date, createdAt: Date.now() })
    }
  }

  async function remove(habit: Habit) {
    if (!habit.id) return
    if (confirmId !== habit.id) {
      setConfirmId(habit.id)
      window.setTimeout(() => setConfirmId((c) => (c === habit.id ? null : c)), 3000)
      return
    }
    await db.habitLogs.where('habitId').equals(habit.id).delete()
    await db.habits.delete(habit.id)
    setConfirmId(null)
  }

  return (
    <div className="page stagger">
      <PageHead
        eyebrow="每天一点点"
        title="小小习惯"
        sub={list.length ? `今天已完成 ${doneToday} / ${list.length} 个` : '从一件小事开始养成'}
        action={
          <div className="row" style={{ gap: 2 }}>
            <img src="fish/headpat.png" alt="" className="head-fish-sm" />
            <button className="icon-btn" onClick={() => setOpen(true)} aria-label="新建习惯">
              <IconPlus size={20} />
            </button>
          </div>
        }
      />

      {list.length === 0 ? (
        <div className="card">
          <Empty emoji="🌼" text="还没有习惯，先加一个最简单的" />
        </div>
      ) : (
        list.map((habit) => {
          const days = new Set(
            logList.filter((l) => l.habitId === habit.id).map((l) => l.date),
          )
          const streak = streakOf(days)
          return (
            <div className="card habit-card" key={habit.id}>
              <div className="habit-head">
                <div className="habit-emoji" style={{ background: `${colorValue[habit.color]}33` }}>
                  {habit.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="plan-title">{habit.name}</h3>
                  <div className="habit-streak">
                    {streak > 0 ? (
                      <>
                        <IconFlame size={13} />
                        连续 {streak} 天
                      </>
                    ) : (
                      <span className="faint">今天开始吧</span>
                    )}
                  </div>
                </div>
                <button
                  className={`del-btn${confirmId === habit.id ? ' danger' : ''}`}
                  onClick={() => remove(habit)}
                  aria-label="删除习惯"
                >
                  {confirmId === habit.id ? (
                    <span style={{ fontSize: 11, fontWeight: 700 }}>确认删除</span>
                  ) : (
                    <IconTrash size={15} />
                  )}
                </button>
              </div>

              <div className="habit-days">
                {week.map((d) => {
                  const on = days.has(d)
                  return (
                    <button
                      key={d}
                      className={`habit-day${on ? ' on' : ''}${isToday(d) ? ' today' : ''}`}
                      onClick={() => toggle(habit, d)}
                      aria-label={`${weekday(d)} ${on ? '已打卡' : '未打卡'}`}
                    >
                      <span
                        className="dot"
                        style={on ? { background: colorValue[habit.color] } : undefined}
                      />
                      <span className="day-name">{weekday(d).slice(1)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })
      )}

      {list.length > 0 && doneToday === list.length && (
        <div className="done-note">
          <img src="fish/success.webp" alt="" className="done-fish" />
          全部打卡完成，你真的很棒
        </div>
      )}

      <Sheet open={open} title="新建一个小习惯" onClose={() => setOpen(false)}>
        <NewHabitForm onDone={() => setOpen(false)} />
      </Sheet>
    </div>
  )
}

function NewHabitForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [color, setColor] = useState<HabitColor>('sage')

  async function submit() {
    const n = name.trim()
    if (!n) return
    await db.habits.add({ name: n, emoji, color, createdAt: Date.now() })
    onDone()
  }

  return (
    <div>
      <label className="field-label">习惯名称</label>
      <input
        className="field"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="比如：睡前不看手机"
        autoFocus
      />

      <label className="field-label" style={{ marginTop: 14 }}>选个小图标</label>
      <div className="emoji-picker">
        {EMOJIS.map((e) => (
          <button key={e} className={`emoji-opt${emoji === e ? ' on' : ''}`} onClick={() => setEmoji(e)}>
            {e}
          </button>
        ))}
      </div>

      <label className="field-label" style={{ marginTop: 14 }}>标记颜色</label>
      <div className="color-picker">
        {COLORS.map((c) => (
          <button
            key={c}
            className={`color-opt${color === c ? ' on' : ''}`}
            style={{ background: colorValue[c] }}
            onClick={() => setColor(c)}
            aria-label={c}
          />
        ))}
      </div>

      <button className="btn block" style={{ marginTop: 22 }} onClick={submit} disabled={!name.trim()}>
        开始养成
      </button>
    </div>
  )
}
