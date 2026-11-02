import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { ambient, playChime, SOUNDS, type SoundKey } from '../lib/audio'
import { todayKey, weekStartKey } from '../lib/date'
import ProgressRing from '../components/ProgressRing'
import { IconLeft } from '../components/Icons'

type Status = 'idle' | 'running' | 'paused' | 'done'

const PRESETS = [25, 45, 60]

const STATUS_TEXT: Record<Status, string> = {
  idle: '准备好了就开始吧',
  running: '专注中，别分心哦',
  paused: '休息一下也没关系',
  done: '完成啦，你真棒',
}

export default function Focus() {
  const { id } = useParams()
  const planId = Number(id)
  const navigate = useNavigate()
  const plan = useLiveQuery(() => db.plans.get(planId), [planId])

  const [status, setStatus] = useState<Status>('idle')
  const [minutes, setMinutes] = useState(25)
  const [remaining, setRemaining] = useState(25 * 60)
  const [sound, setSound] = useState<SoundKey | null>(null)
  const [volume, setVolume] = useState(0.5)
  const [doneSec, setDoneSec] = useState(0)
  const [outcome, setOutcome] = useState<'completed' | 'stopped'>('completed')

  const endAtRef = useRef(0)
  const finishedRef = useRef(false)
  const remainingRef = useRef(remaining)
  remainingRef.current = remaining

  const finish = useCallback(
    async (completed: boolean) => {
      if (finishedRef.current) return
      finishedRef.current = true
      const plannedSec = minutes * 60
      const actualSec = completed ? plannedSec : Math.max(0, plannedSec - remainingRef.current)

      if (plan?.id && actualSec > 0) {
        await db.focusSessions.add({
          planId: plan.id,
          date: todayKey(),
          plannedSec,
          actualSec,
          completed,
          createdAt: Date.now(),
        })
      }

      if (completed && plan?.id) {
        const week = weekStartKey()
        const base = !plan.week || plan.week === week ? plan.progress : 0
        await db.plans.update(plan.id, {
          progress: Math.min(plan.target, base + 1),
          week,
        })
        playChime()
      }

      ambient.stop()
      setSound(null)
      setDoneSec(actualSec)
      setOutcome(completed ? 'completed' : 'stopped')
      setStatus('done')
    },
    [minutes, plan],
  )

  useEffect(() => {
    if (status !== 'running') return
    const tick = () => {
      const left = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000))
      setRemaining(left)
      if (left <= 0) void finish(true)
    }
    tick()
    const timer = window.setInterval(tick, 250)
    return () => window.clearInterval(timer)
  }, [status, finish])

  // 离开页面时停止环境音
  useEffect(() => () => ambient.stop(), [])

  function start() {
    finishedRef.current = false
    endAtRef.current = Date.now() + remaining * 1000
    setStatus('running')
  }

  function pause() {
    setRemaining(Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)))
    setStatus('paused')
  }

  function reset() {
    ambient.stop()
    setSound(null)
    finishedRef.current = false
    setStatus('idle')
    setRemaining(minutes * 60)
  }

  function pickMinutes(m: number) {
    setMinutes(m)
    setRemaining(m * 60)
  }

  async function toggleSound(key: SoundKey) {
    if (sound === key) {
      ambient.stop()
      setSound(null)
    } else {
      ambient.setVolume(volume)
      await ambient.play(key)
      setSound(key)
    }
  }

  function changeVolume(v: number) {
    setVolume(v)
    ambient.setVolume(v)
  }

  if (!plan) {
    return (
      <div className="focus-page">
        <div className="focus-missing">
          <p>这个计划找不到了</p>
          <Link className="btn ghost" to="/plans">
            回到计划
          </Link>
        </div>
      </div>
    )
  }

  const total = minutes * 60
  const displaySec = status === 'done' ? doneSec : remaining
  const progress =
    status === 'done'
      ? Math.min(100, Math.round((doneSec / total) * 100))
      : total > 0
        ? Math.round(((total - remaining) / total) * 100)
        : 0
  const mm = String(Math.floor(displaySec / 60)).padStart(2, '0')
  const ss = String(displaySec % 60).padStart(2, '0')

  const statusText =
    status === 'done'
      ? outcome === 'completed'
        ? '完成啦，你真棒'
        : '这次先到这里，也很棒'
      : STATUS_TEXT[status]

  const fishSrc =
    status === 'done'
      ? outcome === 'completed'
        ? 'fish/success.webp'
        : 'fish/idle.png'
      : status === 'running'
        ? 'fish/thinking.webp'
        : 'fish/idle.webp'

  return (
    <div className="focus-page">
      <div className="focus-top">
        <button className="focus-back" onClick={() => navigate('/plans')} aria-label="返回计划">
          <IconLeft size={20} />
        </button>
        <div className="focus-plan">
          <span className="focus-plan-emoji">{plan.emoji}</span>
          {plan.title}
        </div>
        <span style={{ width: 40 }} />
      </div>

      <div className="focus-stage">
        <img src={fishSrc} alt="" className={`focus-fish${status === 'running' ? ' is-running' : ''}`} />
        <div className="focus-status">{statusText}</div>
      </div>

      <div className="focus-timer">
        <ProgressRing
          value={progress}
          size={252}
          stroke={12}
          from="#c8e4f8"
          to="#4ba3e3"
          track="rgba(255,255,255,0.72)"
        >
          <span className="focus-time">
            {mm}:{ss}
          </span>
          <span className="focus-time-sub">
            {status === 'idle'
              ? `${minutes} 分钟目标`
              : status === 'done'
                ? '本次专注'
                : '剩余时间'}
          </span>
        </ProgressRing>
      </div>

      {status === 'idle' && (
        <div className="focus-presets">
          {PRESETS.map((m) => (
            <button
              key={m}
              className={`focus-preset${minutes === m ? ' on' : ''}`}
              onClick={() => pickMinutes(m)}
            >
              {m} 分
            </button>
          ))}
        </div>
      )}

      <div className="focus-actions">
        {status === 'idle' && (
          <button className="focus-btn primary" onClick={start}>
            开始专注
          </button>
        )}
        {status === 'running' && (
          <button className="focus-btn" onClick={pause}>
            暂停
          </button>
        )}
        {status === 'paused' && (
          <>
            <button className="focus-btn" onClick={() => finish(false)}>
              结束
            </button>
            <button className="focus-btn primary" onClick={start}>
              继续
            </button>
          </>
        )}
        {status === 'done' && (
          <>
            <Link className="focus-btn" to="/plans">
              回到计划
            </Link>
            <button className="focus-btn primary" onClick={reset}>
              再来一次
            </button>
          </>
        )}
        {status === 'running' && (
          <button className="focus-btn ghost" onClick={() => finish(false)}>
            提前结束
          </button>
        )}
      </div>

      <div className="focus-sound">
        <div className="focus-sound-label">学习音效</div>
        <div className="focus-sound-row">
          {SOUNDS.map((s) => (
            <button
              key={s.key}
              className={`sound-chip${sound === s.key ? ' on' : ''}`}
              onClick={() => toggleSound(s.key)}
            >
              <span>{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
        {sound && (
          <div className="focus-volume">
            <span>音量</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => changeVolume(Number(e.target.value) / 100)}
              aria-label="音量"
            />
          </div>
        )}
      </div>
    </div>
  )
}
