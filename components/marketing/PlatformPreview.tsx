'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

function Icon({ d, color = 'currentColor', size = 14, fill = 'none' }: { d: string; color?: string; size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}

type Tab = 'Overview' | 'My Will' | 'Witnessing'

const NAV: { label: string; icon: React.ReactNode; tab: Tab }[] = [
  {
    label: 'Overview',
    tab: 'Overview',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9"/>
      </svg>
    ),
  },
  {
    label: 'My Will',
    tab: 'My Will',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 6.5c-1.5-1.2-3.5-1.8-5.5-1.8-1 0-2 .15-3 .45v13.3c1-.3 2-.45 3-.45 2 0 4 .6 5.5 1.8m0-13.3c1.5-1.2 3.5-1.8 5.5-1.8 1 0 2 .15 3 .45v13.3c-1-.3-2-.45-3-.45-2 0-4 .6-5.5 1.8m0-13.3V19.8"/>
      </svg>
    ),
  },
  {
    label: 'Witnessing',
    tab: 'Witnessing',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10.5l5-3v9l-5-3"/>
      </svg>
    ),
  },
]

const DEMO_PROMPT   = "I just had a baby  -  Oliver Lee born last week"
const DEMO_RESPONSE = "Congratulations! A new child affects your guardianship and distribution clauses. I've drafted 2 amendments for your review."
const DEMO_APPLIED  = "✓ Change saved — your updated Will is awaiting review\n\nYour current Will remains unchanged while we review the new version."

const DEMO_AMENDMENTS = [
  { title: 'Add Oliver Lee as beneficiary', detail: 'Redistribute: Sarah 55% · James 20% · Emma 15% · Oliver 10%' },
  { title: 'Update guardianship clause',    detail: 'Oliver Lee added under the existing arrangement in Clause 2.' },
]

type ChatMsg = { role: 'user' | 'assistant'; text: string }
type Phase   = 'idle' | 'typing' | 'thinking' | 'responded' | 'approving' | 'applied' | 'resetting'

const DEMO_REPLIES: Record<string, string> = {
  default:  "Great question. In the real platform I'd read your Will, flag affected clauses, and draft a specific amendment. Create a free account to try it with your own details.",
  property: "A new property changes your asset register immediately. I'd add it then check your residuary estate clause. Create an account to do this for real.",
  child:    "A new child is an important life event — guardianship and distribution provisions both need reviewing. Create an account to walk through it.",
  executor: "Changing an executor is high-stakes. I'd update the appointment clause and queue solicitor sign-off. Create an account to make the change.",
  married:  "Marriage automatically revokes a prior Will in most Australian states. This is urgent. Create an account to get started.",
}
function demoReply(text: string) {
  const t = text.toLowerCase()
  if (t.includes('property') || t.includes('house'))                   return DEMO_REPLIES.property
  if (t.includes('child') || t.includes('baby') || t.includes('born')) return DEMO_REPLIES.child
  if (t.includes('executor'))                                           return DEMO_REPLIES.executor
  if (t.includes('married') || t.includes('marriage'))                 return DEMO_REPLIES.married
  return DEMO_REPLIES.default
}

function AmendmentPanel({ compact, phase, approvePulse }: { compact?: boolean; phase: Phase; approvePulse: boolean }) {
  return (
    <div style={{ borderRadius: 8, border: '1px solid var(--teal)', background: '#fff', overflow: 'hidden', animation: 'slideUpCard .4s ease' }}>
      <div style={{ padding: compact ? '6px 10px' : '8px 14px', borderBottom: '1px solid var(--line)', background: 'rgba(42,180,174,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: compact ? 10 : 11, fontWeight: 700, color: 'var(--teal-deep)' }}>2 amendments suggested</span>
        {!compact && <span style={{ fontSize: 9, color: 'var(--neutral)' }}>Pending your approval</span>}
      </div>
      {DEMO_AMENDMENTS.map((a, i) => (
        <div key={i} style={{ padding: compact ? '6px 10px' : '8px 14px', borderBottom: i < DEMO_AMENDMENTS.length - 1 ? '1px solid var(--line)' : 'none', animation: `slideUpCard .4s ease ${i * 100 + 100}ms both` }}>
          <div style={{ fontSize: compact ? 10 : 11, fontWeight: 600, color: 'var(--ink)' }}>{a.title}</div>
          <div style={{ fontSize: compact ? 8.5 : 9, color: 'var(--neutral)', marginTop: 2 }}>{a.detail}</div>
        </div>
      ))}
      <div style={{ padding: compact ? '8px 10px' : '10px 14px' }}>
        <button
          onClick={e => e.stopPropagation()}
          style={{ width: '100%', padding: compact ? '6px' : '7px', borderRadius: 6, background: phase === 'applied' ? '#ecfdf5' : 'var(--ink)', color: phase === 'applied' ? '#065f46' : '#fff', fontSize: compact ? 10 : 11, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, animation: approvePulse ? 'pulseGlow 1s ease infinite' : 'none', transition: 'background .4s ease, color .4s ease' }}
        >
          {phase === 'applied'
            ? <><Icon d="M20 6L9 17l-5-5" color="#065f46" size={compact ? 11 : 13}/> Amendments approved</>
            : phase === 'approving' ? 'Approving…'
            : 'Approve all amendments'}
        </button>
      </div>
    </div>
  )
}

export default function PlatformPreview() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')

  const [phase,          setPhase]          = useState<Phase>('idle')
  const [typedText,      setTypedText]      = useState('')
  const [demoMsgs,       setDemoMsgs]       = useState<ChatMsg[]>([])
  const [showAmendments, setShowAmendments] = useState(false)
  const [approvePulse,   setApprovePulse]   = useState(false)
  const [willVersion,    setWillVersion]    = useState(4)
  const [willStatus,     setWillStatus]     = useState<'approved' | 'pending'>('approved')
  const [replayKey,      setReplayKey]      = useState(0)
  const [userMode,       setUserMode]       = useState(false)
  const [chatInput,      setChatInput]      = useState('')
  const [chatMsgs,       setChatMsgs]       = useState<ChatMsg[]>([])
  const [chatLoading,    setChatLoading]    = useState(false)

  const userTookOver     = useRef(false)
  const timers           = useRef<ReturnType<typeof setTimeout>[]>([])
  const chatEndRef       = useRef<HTMLDivElement>(null)
  const inputRef         = useRef<HTMLInputElement>(null)
  const mobileScrollRef  = useRef<HTMLDivElement>(null)
  const mobileChatEndRef = useRef<HTMLDivElement>(null)

  function addTimer(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms)
    timers.current.push(t)
  }
  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const resetDemo = useCallback(() => {
    setPhase('idle'); setTypedText(''); setDemoMsgs([])
    setShowAmendments(false); setApprovePulse(false)
    setWillVersion(4); setWillStatus('approved')
  }, [])

  const runDemo = useCallback(() => {
    if (userTookOver.current) return
    setPhase('typing')
    let i = 0

    function typeNext() {
      if (userTookOver.current) return
      if (i < DEMO_PROMPT.length) {
        i++
        setTypedText(DEMO_PROMPT.slice(0, i))
        addTimer(typeNext, 42 + Math.random() * 28)
      } else {
        addTimer(() => {
          if (userTookOver.current) return
          setPhase('thinking')
          setDemoMsgs([{ role: 'user', text: DEMO_PROMPT }])
          setTypedText('')

          addTimer(() => {
            if (userTookOver.current) return
            setDemoMsgs(prev => [...prev, { role: 'assistant', text: DEMO_RESPONSE }])
            setPhase('responded')

            addTimer(() => {
              if (userTookOver.current) return
              setShowAmendments(true)

              addTimer(() => {
                if (userTookOver.current) return
                setApprovePulse(true)

                addTimer(() => {
                  if (userTookOver.current) return
                  setApprovePulse(false)
                  setPhase('approving')

                  addTimer(() => {
                    if (userTookOver.current) return
                    setPhase('applied')
                    setWillVersion(5)
                    setWillStatus('pending')
                    setDemoMsgs(prev => [...prev, { role: 'assistant', text: DEMO_APPLIED }])

                    addTimer(() => {
                      if (userTookOver.current) return
                      setPhase('resetting')
                      addTimer(() => {
                        if (userTookOver.current) return
                        resetDemo()
                        setReplayKey(key => key + 1)
                      }, 700)
                    }, 4500)
                  }, 700)
                }, 1600)
              }, 2200)
            }, 2000)
          }, 1600)
        }, 350)
      }
    }
    typeNext()
  }, [resetDemo])

  useEffect(() => {
    const t = setTimeout(runDemo, replayKey === 0 ? 2000 : 2500)
    return () => { clearTimeout(t); clearTimers() }
  }, [replayKey, runDemo])

  useEffect(() => {
    if (phase === 'typing' || phase === 'thinking' || phase === 'responded' || phase === 'applied') {
      setTimeout(() => {
        const el = chatEndRef.current
        if (el?.parentElement) el.parentElement.scrollTo({ top: el.parentElement.scrollHeight, behavior: 'smooth' })
      }, 100)
      setTimeout(() => {
        if (mobileScrollRef.current) mobileScrollRef.current.scrollTo({ top: mobileScrollRef.current.scrollHeight, behavior: 'smooth' })
      }, 100)
    }
    if (phase === 'idle') {
      mobileScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [phase, demoMsgs.length])

  function watchDemo() {
    userTookOver.current = false
    setUserMode(false)
    clearTimers()
    setChatInput(''); setChatMsgs([])
    setActiveTab('Overview')
    resetDemo()
    addTimer(runDemo, 400)
  }

  function handlePreviewClick() {
    if (!userTookOver.current) {
      userTookOver.current = true
      setUserMode(true)
      clearTimers()
      setTypedText('')
      setPhase('idle')
      setShowAmendments(false)
      setDemoMsgs([])
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  function handleMobilePreviewClick() {
    if (!userTookOver.current) {
      userTookOver.current = true
      setUserMode(true)
      clearTimers()
      setTypedText('')
      setPhase('idle')
      setShowAmendments(false)
      setDemoMsgs([])
    }
  }

  function sendChat() {
    const text = chatInput.trim()
    if (!text || chatLoading) return
    userTookOver.current = true
    setUserMode(true)
    clearTimers()
    setChatInput('')
    setChatMsgs(prev => [...prev, { role: 'user', text }])
    setChatLoading(true)
    setTimeout(() => {
      setChatMsgs(prev => [...prev, { role: 'assistant', text: demoReply(text) }])
      setChatLoading(false)
      setTimeout(() => {
        const el = chatEndRef.current
        if (el?.parentElement) el.parentElement.scrollTo({ top: el.parentElement.scrollHeight, behavior: 'smooth' })
      }, 50)
      setTimeout(() => {
        if (mobileScrollRef.current) mobileScrollRef.current.scrollTo({ top: mobileScrollRef.current.scrollHeight, behavior: 'smooth' })
      }, 50)
    }, 900)
  }

  const displayMsgs  = userMode ? chatMsgs  : demoMsgs
  const displayInput = userMode ? chatInput : typedText
  const isThinking   = (phase === 'thinking' && !userMode) || chatLoading
  const demoRunning  = !userMode && phase !== 'idle'

  // ─── Shared chat UI (used on both desktop and mobile) ─────────────────────

  function ChatPanel({ compact }: { compact?: boolean }) {
    const fs = compact ? { title: 11, sub: 9, msg: 10, input: 11, footer: 8 } : { title: 11, sub: 9, msg: 9.5, input: 10, footer: 8 }
    return (
      <>
        {/* Messages */}
        <div style={{ flex: 1, minHeight: compact ? 80 : 90, maxHeight: compact ? 120 : 160, overflowY: 'auto', padding: compact ? '8px 14px' : '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {displayMsgs.length === 0 && !isThinking && (
            <div style={{ margin: 'auto', textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: fs.title, fontWeight: 600, color: 'var(--ink)' }}>What has changed?</div>
              <div style={{ marginTop: 3, fontSize: fs.sub, lineHeight: 1.45, color: 'var(--neutral)' }}>Tell me about a new asset, beneficiary, executor, or life event.</div>
            </div>
          )}
          {displayMsgs.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '90%', padding: '6px 9px', borderRadius: 7, fontSize: fs.msg, lineHeight: 1.5, background: m.role === 'user' ? 'var(--teal)' : 'var(--paper-warm)', color: m.role === 'user' ? '#fff' : 'var(--ink)', whiteSpace: 'pre-line' }}>
                {m.text}
                {m.role === 'assistant' && userMode && (
                  <Link href="/auth/signup" onClick={e => e.stopPropagation()} style={{ display: 'block', marginTop: 5, fontSize: fs.sub, fontWeight: 700, color: 'var(--teal-deep)', textDecoration: 'underline' }}>
                    Create a free account →
                  </Link>
                )}
              </div>
            </div>
          ))}
          {isThinking && (
            <div style={{ display: 'flex' }}>
              <div style={{ padding: '6px 10px', borderRadius: 7, background: 'var(--paper-warm)', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 150, 300].map(d => (
                  <span key={d} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--neutral)', display: 'inline-block', animation: 'bounce 1s infinite', animationDelay: `${d}ms`, opacity: 0.7 }}/>
                ))}
              </div>
            </div>
          )}
          {showAmendments && !userMode && (
            <div style={{ marginTop: 2 }}>
              <AmendmentPanel compact={compact} phase={phase} approvePulse={approvePulse}/>
            </div>
          )}
          <div ref={compact ? mobileChatEndRef : chatEndRef}/>
        </div>

        {/* Input */}
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--line)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              ref={compact ? undefined : inputRef}
              type="text"
              value={displayInput}
              readOnly={!userMode}
              onChange={e => { if (userMode) setChatInput(e.target.value) }}
              onFocus={() => {
                if (!userTookOver.current) {
                  userTookOver.current = true
                  setUserMode(true)
                  clearTimers()
                  setTypedText('')
                  setPhase('idle')
                  setShowAmendments(false)
                  setDemoMsgs([])
                }
              }}
              onKeyDown={e => { if (e.key === 'Enter') sendChat() }}
              placeholder="Ask about your estate plan…"
              style={{ flex: 1, minWidth: 0, padding: '6px 9px', border: '1px solid var(--line)', borderRadius: 6, fontSize: fs.input, color: 'var(--ink)', background: 'var(--paper-warm)', outline: 'none', fontFamily: 'inherit', cursor: userMode ? 'text' : 'default' }}
              onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--teal)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)' }}
            />
            <button
              onClick={e => { e.stopPropagation(); sendChat() }}
              disabled={!userMode || !chatInput.trim() || chatLoading}
              style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--teal)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (!userMode || !chatInput.trim() || chatLoading) ? 0.4 : 1, transition: 'opacity .15s' }}
              aria-label="Send"
            >
              <Icon d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" color="#fff" size={11}/>
            </button>
          </div>
          <div style={{ marginTop: 4, fontSize: fs.footer, lineHeight: 1.35, color: 'var(--neutral)' }}>Estate Assistant does not provide personalised legal advice.</div>
        </div>
      </>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>

      {/* ── DESKTOP (sm and up) ─────────────────────────────────────────────── */}
      <div className="hidden sm:block">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', paddingInline: '2px' }}>
          <span style={{ fontSize: '.72rem', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--mkt-stone)' }}>
            {userMode ? 'Use the Estate Assistant to send a message' : demoRunning ? 'Watching demo…' : 'Live platform preview'}
          </span>
          {userMode ? (
            <button
              onClick={watchDemo}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.75rem', fontWeight: 600, padding: '5px 12px', borderRadius: 6, background: 'var(--mkt-ink)', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0, letterSpacing: '.01em' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#2AB4AE" stroke="none" aria-hidden>
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              Watch demo
            </button>
          ) : (
            <span style={{ fontSize: '.72rem', color: 'var(--mkt-stone-soft)', letterSpacing: '.02em' }}>
              {demoRunning ? '' : 'Click anywhere to try it'}
            </span>
          )}
        </div>

        <div
          onClick={handlePreviewClick}
          style={{
            width: '100%', aspectRatio: '17 / 9',
            borderRadius: 12, overflow: 'hidden',
            border: '1px solid var(--line)',
            boxShadow: '0 40px 100px rgba(10,20,18,.16), 0 8px 24px rgba(10,20,18,.08)',
            background: 'var(--paper)', display: 'flex', flexDirection: 'column',
            cursor: userMode ? 'default' : 'pointer',
          }}
        >
          {/* Browser chrome */}
          <div style={{ background: '#f5f5f5', borderBottom: '1px solid #e0e0e0', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }}/>
              ))}
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: 6, border: '1px solid #e0e0e0', padding: '3px 10px', fontSize: 11, color: '#888', textAlign: 'center', maxWidth: 280, marginInline: 'auto' }}>
              heirloomlife.com.au/dashboard
            </div>
          </div>

          {/* App shell */}
          <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

            {/* Sidebar */}
            <aside style={{ width: 184, flexShrink: 0, borderRight: '1px solid var(--line)', background: 'var(--paper)', display: 'flex', flexDirection: 'column', padding: '12px 8px' }}>
              <div style={{ padding: '4px 10px 16px' }}>
                <span style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', fontSize: '1rem', color: 'var(--teal)' }}>Heirloom</span>
              </div>
              <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {NAV.map(item => {
                  const active = item.tab === activeTab
                  return (
                    <button key={item.label}
                      onClick={e => { e.stopPropagation(); setActiveTab(item.tab); if (!userTookOver.current) handlePreviewClick() }}
                      className="platform-nav-btn"
                      style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: active ? 'var(--paper-warm)' : 'transparent', color: active ? 'var(--ink)' : 'var(--neutral)', fontWeight: active ? 500 : 400, border: 'none', width: '100%', textAlign: 'left', transition: 'background .12s, color .12s' }}>
                      <span style={{ color: active ? 'var(--teal)' : 'inherit', flexShrink: 0 }}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  )
                })}
              </nav>
              <div style={{ borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 10px 2px' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>AL</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 }}>Aaron Lee</div>
                  <div style={{ fontSize: 11, color: 'var(--neutral)' }}>Estate plan</div>
                </div>
              </div>
            </aside>

            {/* Main */}
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <header style={{ borderBottom: '1px solid var(--line)', padding: '0 20px', height: 48, display: 'flex', alignItems: 'center', background: 'var(--paper)', flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: '1rem', color: 'var(--ink)', fontStyle: 'italic' }}>Hi, Aaron</span>
              </header>

              <div style={{ flex: 1, minWidth: 0, minHeight: 0, overflowX: 'hidden', overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>

                {/* ── Overview ─────────────────────────────────────────────── */}
                {activeTab === 'Overview' && (
                  <>
                    {/* Your Will card */}
                    <div style={{ borderRadius: 8, border: '1px solid var(--line)', background: '#fff', overflow: 'hidden', flexShrink: 0, transition: 'border-color .5s ease' }}>
                      <div style={{ height: 3, background: 'var(--teal)' }}/>
                      <div style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--neutral)' }}>Your Will</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 4, background: willStatus === 'pending' ? '#fef3c7' : '#ecfdf5', color: willStatus === 'pending' ? '#92400e' : '#065f46', transition: 'all .5s ease' }}>
                            {willStatus === 'pending' ? 'Awaiting review' : 'Ready to sign'}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 1, transition: 'all .4s ease' }}>
                          {willStatus === 'pending' ? "We're checking your Will before it is released." : 'Your Will is ready.'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--neutral)', marginBottom: 1, transition: 'all .4s ease' }}>
                          {willStatus === 'pending'
                            ? 'Our legal team is reviewing your Will.'
                            : 'Download it and follow the signing instructions to make it legally valid.'}
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--neutral)', opacity: 0.6, marginBottom: 8, transition: 'all .4s ease' }}>
                          Last updated {willStatus === 'pending' ? new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : '12 June 2026'}
                        </div>
                        {willStatus === 'pending' && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, borderRadius: 6, padding: '7px 10px', marginBottom: 8, background: '#fffbeb', border: '1px solid #fde68a' }}>
                            <svg className="shrink-0" style={{ marginTop: 1 }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                            </svg>
                            <span style={{ fontSize: 9, color: '#92400e', lineHeight: 1.4 }}>
                              <strong>Update awaiting review</strong> — your current Will is still valid and downloadable.
                            </span>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={e => { e.stopPropagation(); setActiveTab('My Will'); if (!userTookOver.current) handlePreviewClick() }}
                            style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: 'var(--paper-warm)', color: 'var(--ink)', border: '1px solid var(--line)', cursor: 'pointer' }}>
                            View Will
                          </button>
                          {willStatus === 'approved' && (
                            <button
                              onClick={e => e.stopPropagation()}
                              style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" color="#fff" size={11}/>
                              Download PDF
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Estate Assistant */}
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{ borderRadius: 8, border: '1px solid var(--line)', background: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}
                    >
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--paper-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h4" color="var(--teal)" size={11}/>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>Estate Assistant</div>
                          <div style={{ fontSize: 9, color: 'var(--neutral)' }}>Ask questions about your Will, find what&apos;s in it, or make changes when life changes.</div>
                        </div>
                      </div>
                      <ChatPanel />
                    </div>

                    {/* Signing */}
                    <div style={{ borderRadius: 8, border: '1px solid var(--line)', background: '#fff', padding: '10px 14px', flexShrink: 0 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--neutral)', marginBottom: 5 }}>Signing</div>
                      <div style={{ fontSize: 11, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.45 }}>Your Will must be signed in front of two witnesses to be legally valid.</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={e => e.stopPropagation()} style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: 'var(--paper-warm)', color: 'var(--ink)', border: '1px solid var(--line)', cursor: 'pointer' }}>How to sign</button>
                        <button onClick={e => { e.stopPropagation(); setActiveTab('Witnessing'); if (!userTookOver.current) handlePreviewClick() }} style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: 'var(--paper-warm)', color: 'var(--ink)', border: '1px solid var(--line)', cursor: 'pointer' }}>Arrange witnessing</button>
                      </div>
                    </div>
                  </>
                )}

                {/* ── My Will ──────────────────────────────────────────────── */}
                {activeTab === 'My Will' && (
                  <div style={{ borderRadius: 8, border: '1px solid var(--line)', background: '#fff', overflow: 'hidden' }}>
                    <div style={{ height: 3, background: 'var(--teal)' }}/>
                    <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon d="M2 2h8l4 4v8H2V2zM10 2v4h4" color="var(--teal)" size={11}/>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>Sample Last Will &amp; Testament</div>
                        <div style={{ fontSize: 10, color: 'var(--neutral)', marginTop: 1 }}>
                          Version {willVersion} · {willStatus === 'pending' ? 'Awaiting review' : 'Solicitor reviewed 12 Jun 2026'}
                        </div>
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', paddingLeft: 7, borderLeft: `2px solid ${willStatus === 'pending' ? '#f59e0b' : 'var(--teal)'}`, color: willStatus === 'pending' ? '#92400e' : 'var(--teal-deep)', flexShrink: 0 }}>
                        {willStatus === 'pending' ? 'Awaiting review' : 'Solicitor reviewed'}
                      </div>
                    </div>
                    <div style={{ padding: '0 14px' }}>
                      {[
                        { n: '1', title: 'Appointment of Executor', body: 'Michael Chen appointed as primary executor. Julia Wong as alternate.' },
                        { n: '2', title: 'Guardianship of Minor Children', body: willVersion === 5 ? "Emma, James and Oliver Lee to be cared for by Sarah's parents if both parents are deceased." : "Emma and James to be cared for by Sarah's parents if both parents are deceased.", badge: willVersion === 5 ? 'Amended' : 'Review recommended' },
                        { n: '3', title: 'Distribution of Residuary Estate', body: willVersion === 5 ? 'Sarah Lee 55%, James Lee 20%, Emma Lee 15%, Oliver Lee 10%.' : 'Residuary estate: Sarah Lee 60%, James Lee 25%, Emma Lee 15%.', badge: willVersion === 5 ? 'Amended' : undefined },
                        { n: '4', title: 'Testamentary Trust', body: "Children's shares held in trust until each beneficiary reaches age 25." },
                      ].map(c => (
                        <div key={c.n} style={{ display: 'flex', gap: 9, padding: '10px 0', borderBottom: '1px solid var(--line)', animation: c.badge === 'Amended' ? 'flashTeal .8s ease' : 'none' }}>
                          <div style={{ width: 20, height: 20, borderRadius: 5, background: 'var(--paper-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--teal-deep)', flexShrink: 0 }}>{c.n}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>{c.title}</div>
                            <div style={{ fontSize: 10, color: 'var(--neutral)', marginTop: 2, lineHeight: 1.45 }}>{c.body}</div>
                            {c.badge && <div style={{ marginTop: 4, display: 'inline-flex', fontSize: 9, fontWeight: 600, padding: '1px 7px', borderRadius: 99, border: `1px solid ${c.badge === 'Amended' ? 'var(--teal)' : 'var(--ink)'}`, color: c.badge === 'Amended' ? 'var(--teal-deep)' : 'var(--ink)' }}>{c.badge}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '10px 14px 14px' }}>
                      <button onClick={e => e.stopPropagation()} style={{ fontSize: 11, fontWeight: 600, padding: '7px 12px', borderRadius: 6, background: 'var(--paper-warm)', color: 'var(--ink)', border: '1px solid var(--line)', cursor: 'pointer' }}>
                        Download PDF
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Witnessing ───────────────────────────────────────────── */}
                {activeTab === 'Witnessing' && (
                  <>
                    <div style={{ borderRadius: 8, border: '1px solid var(--line)', background: '#fff', overflow: 'hidden' }}>
                      <div style={{ height: 3, background: 'var(--teal)' }}/>
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--neutral)', marginBottom: 6 }}>Witnessing</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 3 }}>Book a witnessing session.</div>
                        <div style={{ fontSize: 11, color: 'var(--neutral)', lineHeight: 1.5, marginBottom: 10 }}>Heirloom coordinates witnessed signing sessions so your Will becomes legally valid. Two independent witnesses are present throughout.</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={e => e.stopPropagation()} style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer' }}>Book a session →</button>
                          <button onClick={e => e.stopPropagation()} style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, background: 'var(--paper-warm)', color: 'var(--ink)', border: '1px solid var(--line)', cursor: 'pointer' }}>How to sign your Will</button>
                        </div>
                      </div>
                    </div>
                    <div style={{ borderRadius: 8, border: '1px solid var(--line)', background: '#fff', padding: '12px 14px' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Signing requirements</div>
                      <div style={{ border: '1px solid var(--line)', borderRadius: 7, overflow: 'hidden' }}>
                        {[
                          ['Format', 'Wet-ink signature in the presence of witnesses'],
                          ['Witnesses required', '2 independent adults (not beneficiaries)'],
                          ['NSW AV witnessing', 'Coordinated by Heirloom — book above'],
                        ].map(([k, v], i, arr) => (
                          <div key={k} style={{ display: 'grid', gridTemplateColumns: '10rem 1fr', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
                            <div style={{ background: 'var(--paper-warm)', padding: '6px 9px', fontSize: 9, fontWeight: 600, color: 'var(--neutral)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{k}</div>
                            <div style={{ padding: '6px 9px', fontSize: 10, color: 'var(--ink)', lineHeight: 1.4 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE (below sm) ───────────────────────────────────────────────── */}
      <div className="sm:hidden">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '.72rem', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--mkt-stone)' }}>
            {userMode ? 'Type to try the assistant' : demoRunning ? 'Watching demo…' : 'Live app preview'}
          </span>
          {userMode && (
            <button
              onClick={watchDemo}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: 'var(--mkt-ink)', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#2AB4AE" stroke="none" aria-hidden>
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              Watch demo
            </button>
          )}
        </div>

        <div style={{
          borderRadius: 12, overflow: 'hidden',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 60px rgba(10,20,18,.12), 0 4px 16px rgba(10,20,18,.06)',
          background: 'var(--paper)',
          display: 'flex',
          flexDirection: 'column',
          height: 520,
        }}>

          {/* App header */}
          <div style={{ background: '#fff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--teal)' }}>Heirloom</span>
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--ink)' }}>Hi, Aaron</span>
          </div>

          {/* Scrollable content */}
          <div ref={mobileScrollRef} onClick={handleMobilePreviewClick} style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

            <div style={{ padding: '12px 14px 0' }}>

              {/* Will status */}
              <div style={{ borderRadius: 9, border: `1px solid ${willStatus === 'pending' ? 'var(--teal)' : 'var(--line)'}`, background: '#fff', overflow: 'hidden', marginBottom: 10, transition: 'border-color .5s ease' }}>
                <div style={{ height: 2, background: 'var(--teal)' }}/>
                <div style={{ padding: '9px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--neutral)' }}>Your Will</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 4, background: willStatus === 'pending' ? '#fef3c7' : '#ecfdf5', color: willStatus === 'pending' ? '#92400e' : '#065f46', transition: 'all .5s ease' }}>
                      {willStatus === 'pending' ? 'Awaiting review' : 'Ready to sign'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', fontStyle: 'italic', fontFamily: 'var(--font-display)', marginBottom: 1 }}>
                    {willStatus === 'pending' ? "We're checking your Will." : 'Your Will is ready.'}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--neutral)' }}>Last updated {willStatus === 'pending' ? new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : '12 Jun 2026'}</div>
                </div>
              </div>

              {/* Estate Assistant heading */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--paper-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h4" color="var(--teal)" size={11}/>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>Estate Assistant</div>
                  <div style={{ fontSize: 9.5, color: 'var(--neutral)' }}>Ask questions or make changes when life changes.</div>
                </div>
              </div>

            </div>

            {/* Chat messages */}
            <div style={{ padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {displayMsgs.length === 0 && !isThinking && (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: 10, color: 'var(--neutral)' }}>What has changed in your life?</div>
                </div>
              )}
              {displayMsgs.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '86%', padding: '7px 10px', borderRadius: 10, fontSize: 11, lineHeight: 1.5, background: m.role === 'user' ? 'var(--teal)' : 'var(--paper-warm)', color: m.role === 'user' ? '#fff' : 'var(--ink)', whiteSpace: 'pre-line' }}>
                    {m.text}
                    {m.role === 'assistant' && userMode && (
                      <Link href="/auth/signup" onClick={e => e.stopPropagation()} style={{ display: 'block', marginTop: 4, fontSize: 10, fontWeight: 700, color: 'var(--teal-deep)', textDecoration: 'underline' }}>
                        Create a free account →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div style={{ display: 'flex' }}>
                  <div style={{ padding: '7px 10px', borderRadius: 10, background: 'var(--paper-warm)', display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 150, 300].map(d => (
                      <span key={d} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--neutral)', display: 'inline-block', animation: 'bounce 1s infinite', animationDelay: `${d}ms`, opacity: 0.7 }}/>
                    ))}
                  </div>
                </div>
              )}
              {showAmendments && !userMode && (
                <div style={{ marginTop: 2 }}>
                  <AmendmentPanel compact phase={phase} approvePulse={approvePulse}/>
                </div>
              )}
              <div ref={mobileChatEndRef}/>
            </div>
          </div>

          {/* Sticky input */}
          <div onClick={e => e.stopPropagation()} style={{ padding: '10px 14px', borderTop: '1px solid var(--line)', background: '#fff', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 7 }}>
              <input
                type="text"
                value={displayInput}
                readOnly={!userMode}
                onChange={e => { if (userMode) setChatInput(e.target.value) }}
                onFocus={() => {
                  if (!userTookOver.current) {
                    userTookOver.current = true
                    setUserMode(true)
                    clearTimers()
                    setTypedText('')
                    setPhase('idle')
                    setShowAmendments(false)
                    setDemoMsgs([])
                  }
                }}
                onKeyDown={e => { if (e.key === 'Enter') sendChat() }}
                placeholder="Ask about your estate plan…"
                style={{ flex: 1, minWidth: 0, padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 20, fontSize: 12, color: 'var(--ink)', background: 'var(--paper-warm)', outline: 'none', fontFamily: 'inherit' }}
              />
              <button
                onClick={sendChat}
                disabled={!userMode || !chatInput.trim() || chatLoading}
                style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--teal)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (!userMode || !chatInput.trim() || chatLoading) ? 0.35 : 1, transition: 'opacity .15s' }}
                aria-label="Send"
              >
                <Icon d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" color="#fff" size={13}/>
              </button>
            </div>
          </div>

          {/* Bottom tab bar */}
          <div style={{ display: 'flex', height: 52, background: '#fff', borderTop: '1px solid var(--line)', flexShrink: 0 }}>
            {([
              { label: 'Overview', active: true, icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9"/>
                </svg>
              )},
              { label: 'My Will', active: false, icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 6.5c-1.5-1.2-3.5-1.8-5.5-1.8-1 0-2 .15-3 .45v13.3c1-.3 2-.45 3-.45 2 0 4 .6 5.5 1.8m0-13.3c1.5-1.2 3.5-1.8 5.5-1.8 1 0 2 .15 3 .45v13.3c-1-.3-2-.45-3-.45-2 0-4 .6-5.5 1.8m0-13.3V19.8"/>
                </svg>
              )},
              { label: 'Witnessing', active: false, icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10.5l5-3v9l-5-3"/>
                </svg>
              )},
              { label: 'More', active: false, icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/>
                </svg>
              )},
            ] as const).map(tab => (
              <div key={tab.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, color: tab.active ? 'var(--teal-deep)' : 'var(--neutral)' }}>
                <span style={{ color: 'inherit' }}>{tab.icon}</span>
                <span style={{ fontSize: 9, fontWeight: tab.active ? 600 : 400 }}>{tab.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  )
}
