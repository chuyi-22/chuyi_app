type IconProps = {
  size?: number
  className?: string
  strokeWidth?: number
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export function IconHome({ size = 24, className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V19a1 1 0 0 0 1 1h3.5v-4.5h3V20H17a1 1 0 0 0 1-1V9.5" />
    </svg>
  )
}

export function IconToday({ size = 24, className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <rect x="4" y="5.5" width="16" height="15" rx="4" />
      <path d="M8 3.5v3.5M16 3.5v3.5M4 10h16" />
      <path d="m9 14.5 1.6 1.6L15 12.7" />
    </svg>
  )
}

export function IconSprout({ size = 24, className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="M12 20v-7" />
      <path d="M12 13c0-3.3-2.6-5.5-6-5.5 0 3.4 2.4 5.5 6 5.5Z" />
      <path d="M12 11.5c0-2.8 2.2-4.8 5.2-4.8 0 2.9-2 4.8-5.2 4.8Z" />
      <path d="M8.5 20h7" />
    </svg>
  )
}

export function IconLoop({ size = 24, className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3L20 9.4" />
      <path d="M20 4.8v4.6h-4.6" />
      <path d="M19.5 12a7.5 7.5 0 0 1-12.8 5.3L4 14.6" />
      <path d="M4 19.2v-4.6h4.6" />
    </svg>
  )
}

export function IconGrid({ size = 24, className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M4 9.8h16M9.4 9.8V20M14.6 9.8V20" />
    </svg>
  )
}

export function IconBook({ size = 24, className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H18a1 1 0 0 1 1 1v13" />
      <path d="M5 5.5V18a2 2 0 0 0 2 2h12" />
      <path d="M8 8.5h7M8 12h5" />
    </svg>
  )
}

export function IconPlus({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconPlay({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5.2v13.6c0 .8.9 1.3 1.6.9l10.2-6.8c.6-.4.6-1.3 0-1.7L9.6 4.3C8.9 3.9 8 4.4 8 5.2Z" />
    </svg>
  )
}

export function IconCheck({ size = 24, className, strokeWidth = 2.6 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  )
}

export function IconLeft({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="m14 6-6 6 6 6" />
    </svg>
  )
}

export function IconRight({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="m10 6 6 6-6 6" />
    </svg>
  )
}

export function IconTrash({ size = 24, className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="M4.5 7h15M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M6.5 7 7.3 19a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
      <path d="M10.5 11v5.5M13.5 11v5.5" />
    </svg>
  )
}

export function IconX({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export function IconFlame({ size = 24, className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="M12 3s5 4.2 5 8.5a5 5 0 0 1-10 0c0-1.7.7-3 1.6-4.1.3 1 .9 1.8 1.7 2.2C10.1 7.3 11 5 12 3Z" />
    </svg>
  )
}

export function IconSparkle({ size = 24, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="M12 3.5c.6 4 1.9 5.4 6 6-4.1.6-5.4 1.9-6 6-.6-4.1-1.9-5.4-6-6 4.1-.6 5.4-2 6-6Z" />
      <path d="M18.5 15.5c.3 1.7.8 2.2 2.5 2.5-1.7.3-2.2.8-2.5 2.5-.3-1.7-.8-2.2-2.5-2.5 1.7-.3 2.2-.8 2.5-2.5Z" />
    </svg>
  )
}
