import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Review as ReviewType } from '../db/types'
import { monthDay, todayKey, weekday } from '../lib/date'
import { Empty, PageHead } from '../components/ui'
import { IconCheck, IconSparkle } from '../components/Icons'

const MOODS = [
  { value: 1, emoji: '😔', label: '有点难' },
  { value: 2, emoji: '😕', label: '一般般' },
  { value: 3, emoji: '😌', label: '还平静' },
  { value: 4, emoji: '🙂', label: '还不错' },
  { value: 5, emoji: '😄', label: '很开心' },
]

export default function Review() {
  const today = todayKey()
  const todayReview = useLiveQuery(() => db.reviews.where('date').equals(today).first(), [today])
  const history = useLiveQuery(() => db.reviews.orderBy('date').reverse().toArray(), [])
  const [saved, setSaved] = useState(false)

  const past = (history ?? []).filter((r) => r.date !== today)

  return (
    <div className="page stagger">
      <PageHead
        eyebrow={`${monthDay(today)} · ${weekday(today)}`}
        title="轻轻复盘"
        sub={todayReview ? '今天已经写过啦，可以再改改' : '给自己五分钟，和今天聊聊天'}
        action={<img src="fish/thinking.webp" alt="" className="head-fish" />}
      />

      <div className="card">
        <ReviewForm
          key={todayReview?.id ?? 'new'}
          today={today}
          initial={todayReview}
          onSaved={() => {
            setSaved(true)
            window.setTimeout(() => setSaved(false), 2200)
          }}
        />
      </div>

      {saved && (
        <div className="toast-inline">
          <IconCheck size={16} strokeWidth={3} /> 记下来了
        </div>
      )}

      <div className="section-title">
        <span style={{ color: '#f4b860', display: 'flex' }}>
          <IconSparkle size={17} />
        </span>
        以前的复盘
      </div>

      {past.length === 0 ? (
        <div className="card">
          <Empty emoji="📔" text="还没有过去的记录，从今天开始吧" />
        </div>
      ) : (
        past.map((r) => <ReviewCard key={r.id} review={r} />)
      )}
    </div>
  )
}

function ReviewForm({
  today,
  initial,
  onSaved,
}: {
  today: string
  initial?: ReviewType
  onSaved: () => void
}) {
  const [mood, setMood] = useState(initial?.mood ?? 4)
  const [good, setGood] = useState(initial?.good ?? '')
  const [bad, setBad] = useState(initial?.bad ?? '')
  const [reason, setReason] = useState(initial?.reason ?? '')
  const [next, setNext] = useState(initial?.next ?? '')

  async function save() {
    const data = {
      date: today,
      mood,
      good: good.trim(),
      bad: bad.trim(),
      reason: reason.trim(),
      next: next.trim(),
      createdAt: initial?.createdAt ?? Date.now(),
    }
    if (initial?.id) {
      await db.reviews.update(initial.id, data)
    } else {
      await db.reviews.add(data)
    }
    onSaved()
  }

  return (
    <div>
      <label className="field-label">今天心情怎么样</label>
      <div className="mood-row">
        {MOODS.map((m) => (
          <button
            key={m.value}
            className={`mood-opt${mood === m.value ? ' on' : ''}`}
            onClick={() => setMood(m.value)}
          >
            <span>{m.emoji}</span>
            <small>{m.label}</small>
          </button>
        ))}
      </div>

      <label className="field-label" style={{ marginTop: 16 }}>今天做得不错的三件事</label>
      <textarea
        className="field"
        value={good}
        onChange={(e) => setGood(e.target.value)}
        placeholder="哪怕只是好好吃了一顿饭…"
      />

      <label className="field-label" style={{ marginTop: 14 }}>没做到的事</label>
      <textarea
        className="field"
        value={bad}
        onChange={(e) => setBad(e.target.value)}
        placeholder="不用苛责，写下来就好"
        style={{ minHeight: 66 }}
      />

      <label className="field-label" style={{ marginTop: 14 }}>为什么会这样</label>
      <textarea
        className="field"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="是时间不够，还是状态不好？"
        style={{ minHeight: 66 }}
      />

      <label className="field-label" style={{ marginTop: 14 }}>明天可以怎么调整</label>
      <textarea
        className="field"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        placeholder="只写一件具体的小事"
        style={{ minHeight: 66 }}
      />

      <button className="btn block" style={{ marginTop: 20 }} onClick={save}>
        {initial ? '更新今天的复盘' : '保存今天的复盘'}
      </button>
    </div>
  )
}

function ReviewCard({ review }: { review: ReviewType }) {
  const mood = MOODS.find((m) => m.value === review.mood) ?? MOODS[3]
  return (
    <div className="card review-card">
      <div className="between">
        <div className="row" style={{ gap: 8 }}>
          <span style={{ fontSize: 24 }}>{mood.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {monthDay(review.date)} <span className="faint" style={{ fontWeight: 400 }}>{weekday(review.date)}</span>
            </div>
            <div className="faint" style={{ fontSize: 12 }}>{mood.label}</div>
          </div>
        </div>
      </div>

      {review.good && (
        <div className="review-block">
          <span className="review-label">做得好的</span>
          <p>{review.good}</p>
        </div>
      )}
      {review.bad && (
        <div className="review-block">
          <span className="review-label">没做到</span>
          <p>{review.bad}</p>
        </div>
      )}
      {review.next && (
        <div className="review-block">
          <span className="review-label">下一步</span>
          <p>{review.next}</p>
        </div>
      )}
    </div>
  )
}
