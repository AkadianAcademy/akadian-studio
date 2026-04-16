'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const LOGO = "https://cdn.prod.website-files.com/67ec5d3b9fe28b1225c054c2/69cbd2f11214dfc14b33eadb_logo%20akadian.png"
const DISCIPLINES = ['Languages', 'Mathematics', 'Technology', 'Sciences', 'Business', 'History', 'Music', 'Art']

export default function AuthPage() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [mounted, setMounted] = useState(false)
  const [disciplineIdx, setDisciplineIdx] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Always show the form — even on back navigation
    setMounted(true)
    setGoogleLoading(false)

    const interval = setInterval(() => {
      setDisciplineIdx(i => (i + 1) % DISCIPLINES.length)
    }, 2000)

    // Handle browser back button
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setGoogleLoading(false)
        setLoading(false)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pageshow', () => {
      setGoogleLoading(false)
      setLoading(false)
      setMounted(true)
    })

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    if (tab === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      window.location.href = '/dashboard'
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
      if (error) { setError(error.message); setLoading(false); return }
      setSuccess('Account created! Check your email to confirm.')
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #0b172b; overflow-x: hidden; }
        .page {
          min-height: 100vh; background: #0b172b;
          display: flex; align-items: center; justify-content: center;
          padding: clamp(24px,5vw,60px) clamp(16px,4vw,40px);
          font-family: 'DM Sans', sans-serif; position: relative; overflow: hidden;
        }
        .bg-orb { position: fixed; border-radius: 50%; pointer-events: none; }
        .orb-a {
          width: min(800px,120vw); height: min(800px,120vw);
          background: radial-gradient(circle, rgba(255,75,85,0.13) 0%, transparent 65%);
          top: -30vh; left: -20vw;
        }
        .orb-b {
          width: min(600px,90vw); height: min(600px,90vw);
          background: radial-gradient(circle, rgba(0,188,124,0.09) 0%, transparent 65%);
          bottom: -20vh; right: -15vw;
        }
        .bg-grid {
          position: fixed; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .card {
          width: 100%; max-width: 460px; position: relative; z-index: 1;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .card.visible { opacity: 1; transform: translateY(0); }
        .logo-area { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: clamp(28px,5vw,44px); }
        .logo-ring {
          width: 56px; height: 56px; border-radius: 50%;
          border: 1.5px solid rgba(255,75,85,0.35);
          box-shadow: 0 0 0 6px rgba(255,75,85,0.06), 0 0 40px rgba(255,75,85,0.18);
          overflow: hidden; animation: logoPulse 3s ease-in-out infinite;
        }
        @keyframes logoPulse {
          0%,100% { box-shadow: 0 0 0 6px rgba(255,75,85,0.06), 0 0 30px rgba(255,75,85,0.15); }
          50% { box-shadow: 0 0 0 10px rgba(255,75,85,0.04), 0 0 50px rgba(255,75,85,0.28); }
        }
        .logo-ring img { width: 100%; height: 100%; object-fit: cover; }
        .logo-name { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.5); letter-spacing: 0.04em; }
        .ai-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(0,188,124,0.1); border: 1px solid rgba(0,188,124,0.25);
          color: #00bc7c; padding: 5px 13px; border-radius: 100px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase;
        }
        .ai-dot { width: 6px; height: 6px; border-radius: 50%; background: #00bc7c; animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .heading {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(28px,6vw,40px); color: #fff;
          line-height: 1.12; letter-spacing: -0.025em;
          margin-bottom: 10px; text-align: center;
        }
        .heading em { color: #ff4b55; font-style: italic; }
        .discipline-wrap { text-align: center; margin-bottom: 10px; font-size: clamp(13px,2.5vw,15px); color: rgba(255,255,255,0.35); line-height: 1.6; }
        .discipline-tag { display: inline-block; color: #ff4b55; font-weight: 500; transition: opacity 0.4s ease; min-width: 100px; }
        .subheading {
          text-align: center; color: rgba(255,255,255,0.33);
          font-size: clamp(13px,2.5vw,14px); line-height: 1.7;
          margin-bottom: clamp(24px,4vw,36px); max-width: 380px; margin-left: auto; margin-right: auto;
        }
        .tabs {
          display: flex; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07); border-radius: 14px;
          padding: 4px; margin-bottom: clamp(20px,3vw,28px); gap: 3px;
        }
        .tab-btn {
          flex: 1; padding: 11px 8px; border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: clamp(13px,2.5vw,14px); font-weight: 500;
          cursor: pointer; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .tab-on { background: #ff4b55; color: #fff; transform: scale(1.01); }
        .tab-off { background: transparent; color: rgba(255,255,255,0.3); }
        .tab-off:hover { color: rgba(255,255,255,0.65); }
        .google-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 13px; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
          color: rgba(255,255,255,0.8); font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500; cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          margin-bottom: clamp(18px,3vw,24px);
        }
        .google-btn:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); transform: translateY(-1px); }
        .google-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .divider { display: flex; align-items: center; gap: 12px; margin-bottom: clamp(18px,3vw,24px); }
        .div-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .div-text { font-size: 11px; color: rgba(255,255,255,0.2); letter-spacing: 0.1em; text-transform: uppercase; }
        .form { display: flex; flex-direction: column; gap: clamp(10px,2vw,13px); }
        .field { position: relative; }
        .field-ico {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.22); pointer-events: none; display: flex; align-items: center; transition: color 0.2s;
        }
        .field:focus-within .field-ico { color: rgba(255,75,85,0.6); }
        .field input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: clamp(12px,2vw,14px) 14px clamp(12px,2vw,14px) 42px;
          color: #fff; font-size: clamp(13px,2.5vw,14px); font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .field input:focus { border-color: rgba(255,75,85,0.45); background: rgba(255,75,85,0.04); box-shadow: 0 0 0 3px rgba(255,75,85,0.07); }
        .field input::placeholder { color: rgba(255,255,255,0.2); }
        .eye-btn {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.2);
          padding: 4px; transition: color 0.2s; display: flex; align-items: center;
        }
        .eye-btn:hover { color: rgba(255,255,255,0.6); }
        .forgot { text-align: right; font-size: 12px; color: #ff4b55; cursor: pointer; opacity: 0.85; transition: opacity 0.2s; margin-top: -4px; }
        .forgot:hover { opacity: 1; }
        .info-box { background: rgba(0,188,124,0.07); border: 1px solid rgba(0,188,124,0.18); border-radius: 12px; padding: 13px 16px; font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.65; }
        .msg-err { color: #ff4b55; font-size: 13px; }
        .msg-ok  { color: #00bc7c; font-size: 13px; }
        .submit-btn {
          width: 100%; padding: clamp(13px,2vw,15px); background: #ff4b55;
          border: none; border-radius: 12px; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: clamp(14px,2.5vw,15px); font-weight: 600;
          cursor: pointer; transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(255,75,85,0.28); margin-top: 4px;
        }
        .submit-btn:hover { opacity: 0.91; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(255,75,85,0.38); }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.42; cursor: not-allowed; transform: none; box-shadow: none; }
        .legal { text-align: center; font-size: 11px; color: rgba(255,255,255,0.15); line-height: 1.8; margin-top: clamp(20px,3vw,28px); }
        .form-enter { animation: formIn 0.3s ease both; }
        @keyframes formIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 480px) { .page { align-items: flex-start; padding-top: 40px; } }
      `}</style>

      <div className="page">
        <div className="bg-orb orb-a" />
        <div className="bg-orb orb-b" />
        <div className="bg-grid" />

        <div className={`card ${mounted ? 'visible' : ''}`}>
          <div className="logo-area">
            <div className="logo-ring">
              <img src={LOGO} alt="Akadian" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
            </div>
            <span className="logo-name">Akadian Academy Studio</span>
          </div>

          <div style={{ display:'flex', justifyContent:'center', marginBottom:'18px' }}>
            <div className="ai-badge">
              <span className="ai-dot" />
              Experimenting with AI
            </div>
          </div>

          <h1 className="heading">
            {tab === 'signin' ? <>Welcome back<br />to <em>Akadian.</em></> : <>Join Akadian<br /><em>before the crowd.</em></>}
          </h1>

          <div className="discipline-wrap">
            AI-powered lessons for{' '}
            <span className="discipline-tag">{DISCIPLINES[disciplineIdx]}</span>
            {' '}and more
          </div>

          <p className="subheading">
            {tab === 'signin'
              ? "We're using AI to help teachers create complete lesson presentations faster than ever — for any subject, any level."
              : "Create presentations, stories, exercises and live canvases in minutes. We're just getting started."}
          </p>

          <div className="tabs">
            <button className={`tab-btn ${tab === 'signin' ? 'tab-on' : 'tab-off'}`}
              onClick={() => { setTab('signin'); setError(''); setSuccess('') }}>
              Sign in
            </button>
            <button className={`tab-btn ${tab === 'signup' ? 'tab-on' : 'tab-off'}`}
              onClick={() => { setTab('signup'); setError(''); setSuccess('') }}>
              Create account
            </button>
          </div>

          <button className="google-btn" onClick={handleGoogle} disabled={googleLoading}>
            {googleLoading ? (
              <span style={{ opacity: 0.7 }}>Redirecting to Google...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {tab === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
              </>
            )}
          </button>

          <div className="divider">
            <div className="div-line" />
            <span className="div-text">or with email</span>
            <div className="div-line" />
          </div>

          <form className="form form-enter" onSubmit={handleSubmit} key={tab}>
            {tab === 'signup' && (
              <div className="field">
                <span className="field-ico"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div className="field">
              <span className="field-ico"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg></span>
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <span className="field-ico"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
              <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="eye-btn" onClick={() => setShowPass(p => !p)}>
                {showPass
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {tab === 'signin' && <div className="forgot">Forgot password?</div>}
            {tab === 'signup' && (
              <div className="info-box">
                Full access to Akadian's AI lesson builder — vocabulary, stories, exercises, live canvases, and shareable lesson links. We're experimenting fast.
              </div>
            )}
            {error && <p className="msg-err">{error}</p>}
            {success && <p className="msg-ok">{success}</p>}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Please wait...' : tab === 'signin' ? 'Enter Akadian →' : 'Create my Akadian account →'}
            </button>
          </form>

          <p className="legal">By continuing, you agree to Akadian's Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </>
  )
}
