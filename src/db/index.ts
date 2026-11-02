import Dexie, { type Table } from 'dexie'
import type { Course, Habit, HabitLog, Plan, Review, Task } from './types'
import { todayKey, weekStartKey } from '../lib/date'

class ChuyiDB extends Dexie {
  tasks!: Table<Task, number>
  plans!: Table<Plan, number>
  habits!: Table<Habit, number>
  habitLogs!: Table<HabitLog, number>
  reviews!: Table<Review, number>
  courses!: Table<Course, number>

  constructor() {
    super('chuyi')
    this.version(1).stores({
      tasks: '++id, date, done, tag',
      plans: '++id, type',
      habits: '++id',
      habitLogs: '++id, habitId, date, [habitId+date]',
      reviews: '++id, date',
    })
    // v2：新增课表
    this.version(2).stores({
      courses: '++id, day',
    })
  }
}

export const db = new ChuyiDB()

/** 首次打开时放一点示例内容，让首页不是空的 */
export async function seedIfEmpty() {
  const count = await db.plans.count()
  if (count > 0) return

  const now = Date.now()
  const today = todayKey()

  await db.plans.bulkAdd([
    {
      type: 'study',
      title: '英语精听',
      desc: '每天 30 分钟，一篇播客精听 + 跟读',
      emoji: '🎧',
      target: 5,
      unit: '次/周',
      week: weekStartKey(),
      progress:2,
      createdAt: now,
    },
    {
      type: 'study',
      title: '专业课阅读',
      desc: '每次一个章节，做一页笔记',
      emoji: '📖',
      target: 3,
      unit: '次/周',
      week: weekStartKey(),
      progress:1,
      createdAt: now + 1,
    },
    {
      type: 'sport',
      title: '慢跑',
      desc: '每次 3 公里，配速随意，跑完拉伸',
      emoji: '🏃',
      target: 3,
      unit: '次/周',
      week: weekStartKey(),
      progress:1,
      createdAt: now + 2,
    },
    {
      type: 'sport',
      title: '力量训练',
      desc: '深蹲 / 俯卧撑 / 平板，各三组',
      emoji: '💪',
      target: 2,
      unit: '次/周',
      week: weekStartKey(),
      progress:0,
      createdAt: now + 3,
    },
  ])

  await db.habits.bulkAdd([
    { name: '喝够水', emoji: '💧', color: 'sky', createdAt: now },
    { name: '早睡', emoji: '🌙', color: 'lilac', createdAt: now + 1 },
    { name: '阅读', emoji: '📚', color: 'sage', createdAt: now + 2 },
  ])

  await db.tasks.bulkAdd([
    { title: '精听一篇播客', date: today, done: false, tag: 'study', createdAt: now },
    { title: '跑步 3 公里', date: today, done: false, tag: 'sport', createdAt: now + 1 },
    { title: '整理明天的待办', date: today, done: true, tag: 'life', createdAt: now + 2 },
  ])
}
