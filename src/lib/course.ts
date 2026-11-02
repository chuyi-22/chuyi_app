export type CourseColor = {
  key: string
  bg: string
  line: string
}

export const COURSE_COLORS: CourseColor[] = [
  { key: 'blue', bg: '#4BA3E3', line: '#3A8BC7' },
  { key: 'coral', bg: '#F26B5B', line: '#D9584A' },
  { key: 'green', bg: '#1DB97A', line: '#16A066' },
  { key: 'brown', bg: '#B57A2F', line: '#9A6624' },
  { key: 'violet', bg: '#7C8BE8', line: '#6675D0' },
  { key: 'pink', bg: '#EE8FA8', line: '#D97A93' },
  { key: 'teal', bg: '#2BB3C0', line: '#229AA6' },
  { key: 'amber', bg: '#E5A93C', line: '#C98F28' },
]

/** 旧版浅色 key 的兼容映射 */
const LEGACY_COLORS: Record<string, string> = {
  peach: '#F26B5B',
  sage: '#1DB97A',
  sky: '#4BA3E3',
  butter: '#E5A93C',
  lilac: '#7C8BE8',
  rose: '#EE8FA8',
}

export function courseColor(key: string): CourseColor {
  const found = COURSE_COLORS.find((c) => c.key === key)
  if (found) return found
  const legacy = LEGACY_COLORS[key]
  if (legacy) return { key, bg: legacy, line: legacy }
  return COURSE_COLORS[0]
}

export const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
export const DAY_SHORT = ['一', '二', '三', '四', '五', '六', '日']

export const SLOT_TIMES = [
  { start: '08:30', end: '09:15' },
  { start: '09:20', end: '10:05' },
  { start: '10:25', end: '11:10' },
  { start: '11:15', end: '12:00' },
  { start: '14:00', end: '14:45' },
  { start: '14:50', end: '15:35' },
  { start: '15:55', end: '16:40' },
  { start: '16:45', end: '17:30' },
  { start: '19:00', end: '19:45' },
  { start: '19:50', end: '20:35' },
  { start: '20:40', end: '21:25' },
]

export const SLOT_COUNT = SLOT_TIMES.length

/** 节次起止文字，比如「第 3-4 节」 */
export function slotLabel(start: number, count: number): string {
  return count > 1 ? `第 ${start}-${start + count - 1} 节` : `第 ${start} 节`
}

/** 两门课时间是否重叠 */
export function isOverlap(
  a: { day: number; startSlot: number; slotCount: number },
  b: { day: number; startSlot: number; slotCount: number },
): boolean {
  return (
    a.day === b.day &&
    a.startSlot < b.startSlot + b.slotCount &&
    b.startSlot < a.startSlot + a.slotCount
  )
}
