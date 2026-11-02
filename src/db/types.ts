export type PlanType = 'study' | 'sport'
export type TaskTag = 'study' | 'sport' | 'life' | 'work'
export type HabitColor = 'coral' | 'sage' | 'butter' | 'sky' | 'lilac'

export interface Task {
  id?: number
  title: string
  date: string // YYYY-MM-DD
  done: boolean
  tag: TaskTag
  createdAt: number
}

export interface Plan {
  id?: number
  type: PlanType
  title: string
  desc: string
  emoji: string
  target: number // 目标次数
  unit: string // 次/周、次/月
  progress: number // 已完成次数
  week: string // 进度所属周的周一，跨周自动归零
  createdAt: number
}

export interface Habit {
  id?: number
  name: string
  emoji: string
  color: HabitColor
  createdAt: number
}

export interface HabitLog {
  id?: number
  habitId: number
  date: string
  createdAt: number
}

export interface Course {
  id?: number
  name: string
  day: number // 1-7，周一为 1
  startSlot: number // 第几节开始
  slotCount: number // 连上几节
  room: string
  teacher: string
  color: string
  createdAt: number
}

export interface Review {
  id?: number
  date: string
  mood: number // 1-5
  good: string
  bad: string
  reason: string
  next: string
  createdAt: number
}
