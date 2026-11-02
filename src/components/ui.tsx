import type { ReactNode } from 'react'
import type { TaskTag } from '../db/types'

export function PageHead({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow?: string
  title: string
  sub?: string
  action?: ReactNode
}) {
  return (
    <header className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        {sub && <div className="page-sub">{sub}</div>}
      </div>
      {action}
    </header>
  )
}

export const TAG_META: Record<TaskTag, { label: string; emoji: string }> = {
  study: { label: '学习', emoji: '📘' },
  sport: { label: '运动', emoji: '🌿' },
  life: { label: '生活', emoji: '🍞' },
  work: { label: '工作', emoji: '💼' },
}

export function Tag({ tag }: { tag: TaskTag }) {
  const m = TAG_META[tag]
  return (
    <span className={`chip ${tag}`}>
      <span style={{ fontSize: 11 }}>{m.emoji}</span>
      {m.label}
    </span>
  )
}

export function Empty({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="empty">
      <span className="empty-face">
        <img src="fish/idle.png" alt="大肥鱼" />
        <span className="empty-badge">{emoji}</span>
      </span>
      {text}
    </div>
  )
}

/** 卡片右上角的手绘小装饰 */
export function Doodle({ kind = 'sparkle', color = '#ffd98e' }: { kind?: 'sparkle' | 'flower' | 'heart'; color?: string }) {
  if (kind === 'flower') {
    return (
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" style={{ opacity: 0.9 }}>
        <g fill={color}>
          <ellipse cx="17" cy="8" rx="4.2" ry="6.4" />
          <ellipse cx="17" cy="26" rx="4.2" ry="6.4" />
          <ellipse cx="8" cy="17" rx="6.4" ry="4.2" />
          <ellipse cx="26" cy="17" rx="6.4" ry="4.2" />
        </g>
        <circle cx="17" cy="17" r="4.4" fill="#fffdf9" />
      </svg>
    )
  }
  if (kind === 'heart') {
    return (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path
          d="M15 25S4.5 18.5 4.5 11.4A5.6 5.6 0 0 1 15 8a5.6 5.6 0 0 1 10.5 3.4C25.5 18.5 15 25 15 25Z"
          fill={color}
        />
      </svg>
    )
  }
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 3c.8 5.4 2.6 7.2 8 8-5.4.8-7.2 2.6-8 8-.8-5.4-2.6-7.2-8-8 5.4-.8 7.2-2.6 8-8Z" fill={color} />
      <path d="M25 21c.4 2.6 1.3 3.5 3.9 3.9-2.6.4-3.5 1.3-3.9 3.9-.4-2.6-1.3-3.5-3.9-3.9 2.6-.4 3.5-1.3 3.9-3.9Z" fill={color} opacity=".7" />
    </svg>
  )
}
