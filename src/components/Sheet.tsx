import { useEffect, type ReactNode } from 'react'
import { IconX } from './Icons'

type Props = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export default function Sheet({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="sheet-mask" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="between" style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, margin: 0 }}>
            {title}
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="关闭" style={{ width: 34, height: 34 }}>
            <IconX size={17} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
