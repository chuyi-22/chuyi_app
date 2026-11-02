import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Plan, PlanType } from '../db/types'
import { weekStartKey } from '../lib/date'
import { Empty, PageHead } from '../components/ui'
import ProgressRing from '../components/ProgressRing'
import Sheet from '../components/Sheet'
import { IconCheck, IconPlus, IconTrash } from '../components/Icons'

const PLAN_EMOJIS: Record<PlanType, string[]> = {
  study: ['📘', '🎧', '✍️', '📖', '🧠', '🔬', '🗂️'],
  sport: ['🏃', '💪', '🧘', '🚴', '🏊', '🏸', '🤸'],
}

const THEME = {
  study: { from: '#cfe6f5', to: '#8bb9d6', label: '学习', tip: '一点点积累，就会长成大树' },
  sport: { from: '#d8ecd3', to: '#9fc9a8', label: '运动', tip: '动起来，身体会记得' },
} as const

export default function Plans() {
  const [type, setType] = useState<PlanType>('study')
  const [open, setOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const plans = useLiveQuery(() => db.plans.where('type').equals(type).toArray(), [type])
  const list = plans ?? []
  const week = weekStartKey()

  // 进度只属于当周，跨周自动从 0 开始
  const current = (p: Plan) => (!p.week || p.week === week ? p.progress : 0)

  const totalDone = list.reduce((s, p) => s + Math.min(current(p), p.target), 0)
  const totalTarget = list.reduce((s, p) => s + p.target, 0)
  const percent = totalTarget ? Math.round((totalDone / totalTarget) * 100) : 0

  async function step(plan: Plan, delta: number) {
    if (!plan.id) return
    const next = Math.max(0, Math.min(plan.target, current(plan) + delta))
    await db.plans.update(plan.id, { progress: next, week })
  }

  async function remove(plan: Plan) {
    if (!plan.id) return
    if (confirmId !== plan.id) {
      setConfirmId(plan.id)
      window.setTimeout(() => setConfirmId((c) => (c === plan.id ? null : c)), 3000)
      return
    }
    await db.plans.delete(plan.id)
    setConfirmId(null)
  }

  return (
    <div className="page stagger">
      <PageHead
        eyebrow="慢慢来，比较快"
        title="我的计划"
        sub={THEME[type].tip}
        action={
          <div className="row" style={{ gap: 2 }}>
            <img src="fish/working.png" alt="" className="head-fish-sm" />
            <button className="icon-btn" onClick={() => setOpen(true)} aria-label="新建计划">
              <IconPlus size={20} />
            </button>
          </div>
        }
      />

      <div className="seg" style={{ marginBottom: 16 }}>
        {(['study', 'sport'] as PlanType[]).map((t) => (
          <button key={t} className={type === t ? 'on' : ''} onClick={() => setType(t)}>
            {THEME[t].label}
          </button>
        ))}
      </div>

      <div className="card card-tight plan-summary">
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>本周进度</div>
          <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
            <span className="num" style={{ fontSize: 34, lineHeight: 1 }}>
              {totalDone}
            </span>
            <span className="muted" style={{ fontSize: 13 }}>
              / {totalTarget} 次
            </span>
          </div>
          <div className="bar sky" style={{ marginTop: 12, width: 150 }}>
            <i style={{ width: `${percent}%` }} />
          </div>
        </div>
        <ProgressRing
          value={percent}
          size={82}
          stroke={9}
          from={THEME[type].from}
          to={THEME[type].to}
        >
          <span className="num" style={{ fontSize: 18 }}>{percent}%</span>
        </ProgressRing>
      </div>

      {list.length === 0 ? (
        <div className="card">
          <Empty emoji={type === 'study' ? '📚' : '🌿'} text="还没有计划，加一个想坚持的目标吧" />
        </div>
      ) : (
        list.map((plan) => {
          const progress = current(plan)
          const pct = Math.round((Math.min(progress, plan.target) / plan.target) * 100)
          const finished = progress >= plan.target
          return (
            <div className="card plan-card" key={plan.id}>
              <div className="plan-emoji">{plan.emoji}</div>
              <div className="plan-main">
                <div className="between">
                  <h3 className="plan-title">{plan.title}</h3>
                  <button
                    className={`del-btn${confirmId === plan.id ? ' danger' : ''}`}
                    onClick={() => remove(plan)}
                    aria-label="删除计划"
                  >
                    {confirmId === plan.id ? (
                      <span style={{ fontSize: 11, fontWeight: 700 }}>确认删除</span>
                    ) : (
                      <IconTrash size={15} />
                    )}
                  </button>
                </div>
                <p className="plan-desc">{plan.desc}</p>
                <div className="between" style={{ marginTop: 10 }}>
                  <div className="bar sky" style={{ flex: 1, marginRight: 12 }}>
                    <i style={{ width: `${pct}%` }} />
                  </div>
                  <span className="num" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                    {progress} / {plan.target} {plan.unit}
                  </span>
                </div>
              </div>
              <button
                className={`step-btn${finished ? ' done' : ''}`}
                onClick={() => step(plan, 1)}
                disabled={finished}
                aria-label="完成一次"
              >
                {finished ? <IconCheck size={18} strokeWidth={2.6} /> : <IconPlus size={19} strokeWidth={2.4} />}
              </button>
            </div>
          )
        })
      )}

      <Sheet open={open} title={`新建${THEME[type].label}计划`} onClose={() => setOpen(false)}>
        <NewPlanForm type={type} onDone={() => setOpen(false)} />
      </Sheet>
    </div>
  )
}

function NewPlanForm({ type, onDone }: { type: PlanType; onDone: () => void }) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [emoji, setEmoji] = useState(PLAN_EMOJIS[type][0])
  const [target, setTarget] = useState(3)

  async function submit() {
    const t = title.trim()
    if (!t) return
    await db.plans.add({
      type,
      title: t,
      desc: desc.trim(),
      emoji,
      target,
      unit: '次/周',
      progress: 0,
      week: weekStartKey(),
      createdAt: Date.now(),
    })
    onDone()
  }

  return (
    <div>
      <label className="field-label">计划名称</label>
      <input
        className="field"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={type === 'study' ? '比如：每天背 20 个单词' : '比如：每周跑三次步'}
        autoFocus
      />

      <label className="field-label" style={{ marginTop: 14 }}>想做成什么样</label>
      <textarea
        className="field"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="写一句给自己的提醒…"
      />

      <label className="field-label" style={{ marginTop: 14 }}>选个小图标</label>
      <div className="emoji-picker">
        {PLAN_EMOJIS[type].map((e) => (
          <button key={e} className={`emoji-opt${emoji === e ? ' on' : ''}`} onClick={() => setEmoji(e)}>
            {e}
          </button>
        ))}
      </div>

      <label className="field-label" style={{ marginTop: 14 }}>每周目标次数</label>
      <div className="stepper">
        <button onClick={() => setTarget((v) => Math.max(1, v - 1))}>−</button>
        <span className="num">{target}</span>
        <button onClick={() => setTarget((v) => Math.min(21, v + 1))}>＋</button>
      </div>

      <button className="btn block" style={{ marginTop: 22 }} onClick={submit} disabled={!title.trim()}>
        种下这个计划
      </button>
    </div>
  )
}
