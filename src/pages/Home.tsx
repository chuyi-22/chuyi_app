import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Task } from '../db/types'
import { greeting, monthDay, todayKey, weekStartKey, weekday } from '../lib/date'
import ProgressRing from '../components/ProgressRing'
import { IconCheck, IconRight } from '../components/Icons'
import { Doodle, Tag } from '../components/ui'

export default function Home() {
  const today = todayKey()

  const tasks = useLiveQuery(() => db.tasks.where('date').equals(today).toArray(), [today])
  const plans = useLiveQuery(() => db.plans.toArray(), [])
  const habits = useLiveQuery(() => db.habits.toArray(), [])
  const logs = useLiveQuery(() => db.habitLogs.where('date').equals(today).toArray(), [today])
  const lastReview = useLiveQuery(() => db.reviews.orderBy('date').reverse().first(), [])

  const taskList = tasks ?? []
  const planList = plans ?? []
  const habitList = habits ?? []
  const logList = logs ?? []

  const done = taskList.filter((t) => t.done).length
  const total = taskList.length
  const percent = total ? Math.round((done / total) * 100) : 0

  const study = planList.filter((p) => p.type === 'study')
  const sport = planList.filter((p) => p.type === 'sport')
  const week = weekStartKey()
  const sumOf = (arr: typeof planList) => ({
    done: arr.reduce((s, p) => s + Math.min(!p.week || p.week === week ? p.progress : 0, p.target), 0),
    target: arr.reduce((s, p) => s + p.target, 0),
  })
  const studySum = sumOf(study)
  const sportSum = sumOf(sport)
  const habitDone = habitList.filter((h) => logList.some((l) => l.habitId === h.id)).length

  const cheer =
    total === 0
      ? '今天还没有安排，先记一件小事吧'
      : percent === 100
        ? '全部完成啦，今天过得很扎实'
        : percent >= 50
          ? '已经动起来了，保持这个节奏'
          : '刚刚开始，做完一件就很好'

  async function toggle(task: Task) {
    if (!task.id) return
    await db.tasks.update(task.id, { done: !task.done })
  }

  return (
    <div className="page stagger">
      <header className="home-head">
        <div>
          <div className="eyebrow">
            {monthDay(today)} · {weekday(today)}
          </div>
          <h1 className="page-title" style={{ fontSize: 27 }}>
            {greeting()}
          </h1>
        </div>
        <img src="fish/idle.webp" alt="大肥鱼" className="home-fish" />
      </header>

      <section className="card hero-card">
        <div className="tape" />
        <ProgressRing value={percent} size={116} stroke={11}>
          <span className="num" style={{ fontSize: 27, lineHeight: 1 }}>{percent}<small style={{ fontSize: 13 }}>%</small></span>
          <span className="faint" style={{ fontSize: 11, marginTop: 2 }}>今日完成</span>
        </ProgressRing>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow" style={{ color: 'var(--coral-deep)' }}>今天的小目标</div>
          <div className="hero-count">
            <span className="num">{done}</span>
            <span className="muted"> / {total} 件</span>
          </div>
          <p className="hero-cheer">{cheer}</p>
        </div>
        <Doodle kind="flower" color="#ffd0bd" />
      </section>

      <div className="quick-grid">
        <Link to="/plans" className="quick-card q-study">
          <span className="quick-emoji">📘</span>
          <span className="quick-label">学习</span>
          <span className="quick-num">
            {studySum.done}<i>/{studySum.target}</i>
          </span>
          <span className="quick-bar"><i style={{ width: `${studySum.target ? Math.min(100, (studySum.done / studySum.target) * 100) : 0}%` }} /></span>
        </Link>

        <Link to="/plans" className="quick-card q-sport">
          <span className="quick-emoji">🌿</span>
          <span className="quick-label">运动</span>
          <span className="quick-num">
            {sportSum.done}<i>/{sportSum.target}</i>
          </span>
          <span className="quick-bar"><i style={{ width: `${sportSum.target ? Math.min(100, (sportSum.done / sportSum.target) * 100) : 0}%` }} /></span>
        </Link>

        <Link to="/habits" className="quick-card q-habit">
          <span className="quick-emoji">🌼</span>
          <span className="quick-label">习惯</span>
          <span className="quick-num">
            {habitDone}<i>/{habitList.length}</i>
          </span>
          <span className="quick-bar"><i style={{ width: `${habitList.length ? (habitDone / habitList.length) * 100 : 0}%` }} /></span>
        </Link>
      </div>

      <div className="section-title">
        今天要做
        <Link to="/today" className="section-more">
          全部 <IconRight size={14} />
        </Link>
      </div>

      <div className="card tasks-card">
        {taskList.length === 0 ? (
          <div className="empty" style={{ padding: '26px 10px' }}>
            <span className="empty-emoji">🌱</span>
            今天还是空白，去记一件小事吧
          </div>
        ) : (
          taskList.slice(0, 4).map((task) => (
            <div className={`task-row${task.done ? ' is-done' : ''}`} key={task.id}>
              <button
                className={`check${task.done ? ' on' : ''}`}
                onClick={() => toggle(task)}
                aria-label={task.done ? '标记未完成' : '标记完成'}
              >
                <IconCheck size={15} strokeWidth={3} />
              </button>
              <div className="task-body">
                <div className={`task-title${task.done ? ' done' : ''}`}>{task.title}</div>
                <Tag tag={task.tag} />
              </div>
            </div>
          ))
        )}
      </div>

      <Link to="/review" className="card review-teaser card-link">
        <div className="row">
          <span style={{ fontSize: 22 }}>📔</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>最近一次复盘</div>
            <div className="faint" style={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {lastReview
                ? `${monthDay(lastReview.date)} · ${lastReview.good || lastReview.next || '写了一点心里话'}`
                : '还没写过，去和今天聊聊天'}
            </div>
          </div>
          <IconRight size={17} className="faint" />
        </div>
      </Link>
    </div>
  )
}

/* 大肥鱼头像在 .home-fish 里，见 pages.css */
