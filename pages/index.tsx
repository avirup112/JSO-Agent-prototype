import { useState } from 'react'
import Head from 'next/head'
import PrepForm, { FormData } from '../components/PrepForm'
import PrepSection from '../components/PrepSection'
import type { PrepPack } from './api/generate'
import styles from './index.module.css'

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function Home() {
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<PrepPack | null>(null)
  const [meta, setMeta] = useState<FormData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [step, setStep] = useState(0)

  const stepLabels = [
    'Analysing your profile...',
    'Calling Claude...',
    'Building your prep pack...',
  ]

  const handleSubmit = async (data: FormData) => {
    setStatus('loading')
    setStep(0)
    setResult(null)
    setErrorMsg('')
    setMeta(data)

    const t1 = setTimeout(() => setStep(1), 1200)
    const t2 = setTimeout(() => setStep(2), 2800)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      clearTimeout(t1)
      clearTimeout(t2)

      const json = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || 'Something went wrong.')
      }

      setResult(json.data)
      setStatus('done')
    } catch (err) {
      clearTimeout(t1)
      clearTimeout(t2)
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }

  const reset = () => {
    setStatus('idle')
    setResult(null)
    setMeta(null)
    setErrorMsg('')
    setStep(0)
  }

  return (
    <>
      <Head>
        <title>JSO Consultation Prep Agent</title>
        <meta name="description" content="AI-powered consultation preparation for JSO users — powered by Avirup Dasgupta" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.page}>
        <div className={styles.container}>

          {/* Header */}
          <header className={styles.header}>
            <div className={styles.logoWrap}>
              <div className={styles.logo}>🧠</div>
              <div>
                <h1 className={styles.logoTitle}>JSO Prep Agent</h1>
                <p className={styles.logoSub}>Consultation Intelligence</p>
              </div>
            </div>
            <div className={styles.liveBadge}>
              <span className={styles.liveDot} />
              Live
            </div>
          </header>

          {/* Idle / Form state */}
          {(status === 'idle' || status === 'error') && (
            <>
              {status === 'error' && (
                <div className={styles.errorBox}>
                  ⚠ {errorMsg}
                </div>
              )}
              <PrepForm onSubmit={handleSubmit} loading={false} />
            </>
          )}

          {/* Loading state */}
          {status === 'loading' && (
            <div className={styles.loadingCard}>
              <div className={styles.spinnerLg} />
              <div className={styles.stepLabels}>
                {stepLabels.map((label, i) => (
                  <span
                    key={i}
                    className={`${styles.stepLabel} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}
                  >
                    {i < step ? '✓' : i === step ? '→' : '·'} {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Results state */}
          {status === 'done' && result && (
            <div className={styles.results}>
              {/* Meta bar */}
              <div className={styles.metaBar}>
                {meta?.name && <span className={styles.metaPill}>{meta.name}</span>}
                {meta?.currentRole && meta?.targetRole && (
                  <span className={styles.metaPill}>
                    {meta.currentRole} → {meta.targetRole}
                  </span>
                )}
                <span className={styles.metaPill}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Sections */}
              <div className={styles.sections}>
                <PrepSection
                  icon="💬"
                  label="Discussion topics for your session"
                  items={result.discussion_topics}
                  colorClass="blue"
                  animationDelay={0}
                />
                <PrepSection
                  icon="❓"
                  label="Career questions to ask your consultant"
                  items={result.career_questions}
                  colorClass="green"
                  animationDelay={100}
                />
                <PrepSection
                  icon="✦"
                  label="Interview preparation tips"
                  items={result.interview_tips}
                  colorClass="amber"
                  animationDelay={200}
                />
              </div>

              {/* Footer actions */}
              <div className={styles.resultFooter}>
                <p className={styles.aiNote}>
                  ✦ Generated by Anthropic Claude · AI-assisted, not a substitute for professional advice
                </p>
                <button className={styles.resetBtn} onClick={reset}>
                  ← New prep pack
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className={styles.footer}>
            <p>JSO Agent Prototype · Powered by Avirup Dasgupta</p>
            <p>Built with Love ❤️</p>
          </footer>

        </div>
      </div>
    </>
  )
}
