const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function toKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return toKey(new Date())
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key: string, n: number): string {
  const d = parseKey(key)
  d.setDate(d.getDate() + n)
  return toKey(d)
}

export function weekday(key: string): string {
  return WEEKDAYS[parseKey(key).getDay()]
}

/** 11月1日 */
export function monthDay(key: string): string {
  const d = parseKey(key)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/** 最近 n 天，从早到晚 */
export function lastDays(n: number, endKey = todayKey()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(endKey, i - n + 1))
}

/** 所在周的周一 */
export function weekStartKey(key = todayKey()): string {
  const d = parseKey(key)
  const day = d.getDay() // 0 是周日
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  return toKey(d)
}

export function isToday(key: string): boolean {
  return key === todayKey()
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜深了，早点休息'
  if (h < 11) return '早上好，新的一天'
  if (h < 14) return '中午好，好好吃饭'
  if (h < 18) return '下午好，慢慢来'
  return '晚上好，今天辛苦啦'
}
