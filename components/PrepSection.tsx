import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import styles from './PrepSection.module.css'

type Props = {
  icon: string
  label: string
  items: string[]
  colorClass: 'blue' | 'green' | 'amber'
  defaultOpen?: boolean
  animationDelay?: number
  packId?: string
  sectionKey: string
  savedChecks?: string[]
}

export default function PrepSection({
  icon,
  label,
  items,
  colorClass,
  defaultOpen = true,
  animationDelay = 0,
  packId,
  sectionKey,
  savedChecks = [],
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [checked, setChecked] = useState<Record<number, boolean>>(
    savedChecks.reduce((acc, key) => {
      const idx = parseInt(key.split('_')[1])
      if (!isNaN(idx)) acc[idx] = true
      return acc
    }, {} as Record<number, boolean>)
  )

  const toggle = async (i: number) => {
    const newChecked = { ...checked, [i]: !checked[i] }
    setChecked(newChecked)

    if (!packId) return

    // Build full checked_items list from all sections
    const itemKey = `${sectionKey}_${i}`
    const { data } = await supabase
      .from('prep_packs')
      .select('checked_items')
      .eq('id', packId)
      .single()

    const existing: string[] = data?.checked_items || []
    let updated: string[]

    if (!checked[i]) {
      updated = [...existing.filter(k => k !== itemKey), itemKey]
    } else {
      updated = existing.filter(k => k !== itemKey)
    }

    await supabase
      .from('prep_packs')
      .update({ checked_items: updated })
      .eq('id', packId)
  }

  const doneCount = Object.values(checked).filter(Boolean).length

  return (
    <div
      className={styles.section}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <button
        className={styles.header}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className={`${styles.iconWrap} ${styles[colorClass]}`}>
          {icon}
        </span>
        <span className={styles.label}>{label}</span>
        <span className={styles.count}>{doneCount}/{items.length}</span>
        <span className={`${styles.chevron} ${open ? styles.open : ''}`}>▾</span>
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
          {doneCount === items.length && items.length > 0 && (
            <div className={styles.allDone}>
              ✓ All reviewed — you are ready!
            </div>
          )}
        </div>
      )}
    </div>
  )
}