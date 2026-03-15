import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import PrepForm, { FormData } from '../components/PrepForm'
import PrepSection from '../components/PrepSection'
import type { PrepPack } from './api/generate'
import styles from './index.module.css'

type Status = 'idle' | 'loading' | 'done' | 'error'

type HistoryItem = {
  id: string
  role_current: string
  role_target: string
  created_at: string
  discussion_topics: string[]
  career_questions: string[]
  interview_tips: string[]
  checked_items: string[]
}

export default function Home() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<PrepPack | null>(null)
  const [meta, setMeta] = useState<FormData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [step, setStep] = useState(0)
  const [username, setUsername] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [currentPackId, setCurrentPackId] = useState<string | null>(null)
  const [savedChecks, setSavedChecks] = useState<string[]>([])

  const stepLabels = [
    'Analysing your profile...',
    'Calling AI model...',
    'Building your prep pack...',
  ]

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      router.push('/login')
      return
    }

    setUsername(profile.username)
    fetchHistory(session.user.id)
  }

  const fetchHistory = async (userId: string) => {
    const { data } = await supabase
      .from('prep_packs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) setHistory(data)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleSubmit = async (data: FormData) => {
    setStatus('loading')
    setStep(0)
    setResult(null)
    setErrorMsg('')
    setMeta(data)
    setCurrentPackId(null)
    setSavedChecks([])

    const t1 = setTimeout(() => setStep(1), 1200)
    const t2 = setTimeout(() => setStep(2), 2800)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, accessToken: session.access_token }),
      })

      clearTimeout(t1)
      clearTimeout(t2)

      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Something went wrong.')

      setResult(json.data)
      setStatus('done')

      // Fetch the just-saved pack to get its id
      const { data: savedPack } = await supabase
        .from('prep_packs')
        .select('id, checked_items')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (savedPack) {
        setCurrentPackId(savedPack.id)
        setSavedChecks(savedPack.checked_items || [])
      }

      fetchHistory(session.user.id)
    } catch (err) {
      clearTimeout(t1)
      clearTimeout(t2)
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }

  const loadFromHistory = (item: HistoryItem) => {
    setResult({
      discussion_topics: item.discussion_topics,
      career_questions: item.career_questions,
      interview_tips: item.interview_tips,
    })
    setMeta({
      name: '',
      years: '',
      currentRole: item.role_current,
      targetRole: item.role_target,
      goals: '',
      application: '',
    })
    setCurrentPackId(item.id)
    setSavedChecks(item.checked_items || [])
    setStatus('done')
    setShowHistory(false)
  }

  const reset = () => {
    setStatus('idle')
    setResult(null)
    setMeta(null)
    setErrorMsg('')
    setStep(0)
    setCurrentPackId(null)
    setSavedChecks([])
  }

  return (
    <>
      <Head>
        <title>JSO Prep Agent</title>
        <meta name="description" content="AI-powered consultation preparation for JSO users" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.page}>
        <div className={styles.container}>

          <header className={styles.header}>
            <div className={styles.logoWrap}>
              <div className={styles.logo}>🧠</div>
              <div>
                <h1 className={styles.logoTitle}>JSO Prep Agent</h1>
                <p className={styles.logoSub}>Consultation Intelligence</p>
              </div>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.liveBadge}>
                <span className={styles.liveDot} />
                Live
              </div>
              {history.length > 0 && (
                <button className={styles.historyBtn} onClick={() => setShowHistory(!showHistory)}>
                  History ({history.length})
                </button>
              )}
              <span className={styles.userEmail}>@{username}</span>
              <button className={styles.signOutBtn} onClick={handleSignOut}>Sign out</button>
            </div>
          </header>

          {showHistory && (
            <div className={styles.historyPanel}>
              <p className={styles.historyTitle}>Recent prep packs</p>
              {history.map(item => (
                <button key={item.id} className={styles.historyItem} onClick={() => loadFromHistory(item)}>
                  <span className={styles.historyRole}>{item.role_current} → {item.role_target}</span>
                  <span className={styles.historyDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          )}

          {status === 'error' && (
            <div className={styles.errorBox}>⚠ {errorMsg}</div>
          )}

          {(status === 'idle' || status === 'error') && (
            <PrepForm onSubmit={handleSubmit} loading={false} />
          )}

          {status === 'loading' && (
            <div className={styles.loadingCard}>
              <div className={styles.spinnerLg} />
              <div className={styles.stepLabels}>
                {stepLabels.map((label, i) => (
                  <span key={i} className={`${styles.stepLabel} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
                    {i < step ? '✓' : i === step ? '→' : '·'} {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {status === 'done' && result && (
            <div className={styles.results}>
              <div className={styles.metaBar}>
                <span className={styles.metaPill}>llama-3.3-70b</span>
                {meta?.currentRole && meta?.targetRole && (
                  <span className={styles.metaPill}>{meta.currentRole} → {meta.targetRole}</span>
                )}
                <span className={styles.metaPill}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className={styles.savedBadge}>✓ Saved</span>
              </div>

              <div className={styles.sections}>
                <PrepSection
                  icon="💬"
                  label="Discussion topics for your session"
                  items={result.discussion_topics}
                  colorClass="blue"
                  animationDelay={0}
                  packId={currentPackId || undefined}
                  sectionKey="topics"
                  savedChecks={savedChecks.filter(k => k.startsWith('topics_'))}
                />
                <PrepSection
                  icon="❓"
                  label="Career questions to ask your consultant"
                  items={result.career_questions}
                  colorClass="green"
                  animationDelay={100}
                  packId={currentPackId || undefined}
                  sectionKey="questions"
                  savedChecks={savedChecks.filter(k => k.startsWith('questions_'))}
                />
                <PrepSection
                  icon="✦"
                  label="Interview preparation tips"
                  items={result.interview_tips}
                  colorClass="amber"
                  animationDelay={200}
                  packId={currentPackId || undefined}
                  sectionKey="tips"
                  savedChecks={savedChecks.filter(k => k.startsWith('tips_'))}
                />
              </div>

              <div className={styles.resultFooter}>
                <p className={styles.aiNote}>✦ AI-generated · Not a substitute for professional advice</p>
                <button className={styles.resetBtn} onClick={reset}>← New prep pack</button>
              </div>
            </div>
          )}

          <footer className={styles.footer}>
            <p>JSO Agent Prototype · Built by Avirup Dasgupta</p>
          </footer>
        </div>
      </div>
    </>
  )
}