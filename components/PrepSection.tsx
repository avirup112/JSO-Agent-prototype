import { useState } from 'react'
import styles from './PrepSection.module.css'

type Props = {
  icon: string
  label: string
  items: string[]
  colorClass: 'blue' | 'green' | 'amber'
  defaultOpen?: boolean
  animationDelay?: number
}

export default function PrepSection({
  icon,
  label,
  items,
  colorClass,
  defaultOpen = true,
  animationDelay = 0,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  const toggle = (i: number) =>
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }))

  const doneCount = Object.values(checked).filter(Boolean).length

  return (
    <div
      className={styles.section}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <button
        className={styles.header}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className={`${styles.iconWrap} ${styles[colorClass]}`}>
          {icon}
        </span>
        <span className={styles.label}>{label}</span>
        <span className={styles.count}>
          {doneCount}/{items.length}
        </span>
        <span className={`${styles.chevron} ${open ? styles.open : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className={styles.body}>
          {items.map((item, i) => (
            <div
              key={i}
              className={`${styles.item} ${checked[i] ? styles.done : ''}`}
              onClick={() => toggle(i)}
            >
              <span className={`${styles.check} ${checked[i] ? styles.checked : ''}`}>
                {checked[i] && '✓'}
              </span>
              <span className={styles.itemText}>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
