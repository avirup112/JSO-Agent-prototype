import { useState } from 'react'
import styles from './PrepForm.module.css'

export type FormData = {
  name: string
  years: string
  currentRole: string
  targetRole: string
  goals: string
  application: string
}

type Props = {
  onSubmit: (data: FormData) => void
  loading: boolean
}

export default function PrepForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<FormData>({
    name: '',
    years: '',
    currentRole: '',
    targetRole: '',
    goals: '',
    application: '',
  })

  const set = (key: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formTitle}>
        <span className={styles.formIcon}>👤</span>
        Your profile
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Your name</label>
          <input
            type="text"
            placeholder="e.g. Priya Sharma"
            value={form.name}
            onChange={set('name')}
          />
        </div>
        <div className={styles.field}>
          <label>Years of experience</label>
          <input
            type="number"
            placeholder="e.g. 4"
            min={0}
            max={50}
            value={form.years}
            onChange={set('years')}
          />
        </div>
        <div className={styles.field}>
          <label>Current role <span className={styles.required}>*</span></label>
          <input
            type="text"
            placeholder="e.g. Software Engineer"
            value={form.currentRole}
            onChange={set('currentRole')}
            required
          />
        </div>
        <div className={styles.field}>
          <label>Target role <span className={styles.required}>*</span></label>
          <input
            type="text"
            placeholder="e.g. Product Manager"
            value={form.targetRole}
            onChange={set('targetRole')}
            required
          />
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label>Career goals & context <span className={styles.optional}>(optional)</span></label>
          <textarea
            placeholder="e.g. I want to transition from engineering into product. I've led internal tools projects but never held a formal PM title."
            value={form.goals}
            onChange={set('goals')}
            rows={3}
          />
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label>Active job application or upcoming interview <span className={styles.optional}>(optional)</span></label>
          <input
            type="text"
            placeholder="e.g. PM role at a fintech startup, interview next week"
            value={form.application}
            onChange={set('application')}
          />
        </div>
      </div>

      <div className={styles.footer}>
        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? (
            <>
              <span className={styles.spinner} /> Generating...
            </>
          ) : (
            <>✦ Generate prep pack</>
          )}
        </button>
      </div>
    </form>
  )
}
