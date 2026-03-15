import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import styles from './login.module.css'

type Step = 'auth' | 'username'

export default function Login() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else if (data.user) {
        setStep('username')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/')
    }
    setLoading(false)
  }

  const handleUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check if username already taken
    const { data: existing } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase().trim())
      .single()

    if (existing) {
      setError('Username already taken. Please choose another.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      username: username.toLowerCase().trim(),
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>🧠</div>
        <h1 className={styles.title}>JSO Prep Agent</h1>

        {step === 'auth' && (
          <>
            <p className={styles.sub}>{isSignUp ? 'Create your account' : 'Sign in to continue'}</p>
            <form onSubmit={handleAuth} className={styles.form}>
              <div className={styles.field}>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}
              {message && <p className={styles.success}>{message}</p>}

              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? 'Please wait...' : isSignUp ? 'Continue' : 'Sign in'}
              </button>
            </form>

            <p className={styles.toggle}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => { setIsSignUp(!isSignUp); setError('') }} className={styles.toggleBtn}>
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </>
        )}

        {step === 'username' && (
          <>
            <p className={styles.sub}>Choose a unique username</p>
            <form onSubmit={handleUsername} className={styles.form}>
              <div className={styles.field}>
                <label>Username</label>
                <div className={styles.usernameWrap}>
                  <span className={styles.usernameAt}>@</span>
                  <input
                    type="text"
                    placeholder="yourname"
                    value={username}
                    onChange={e => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, ''))}
                    minLength={3}
                    maxLength={20}
                    required
                    className={styles.usernameInput}
                  />
                </div>
                <p className={styles.hint}>3–20 characters. Letters, numbers, underscores only.</p>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? 'Checking...' : 'Create account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}