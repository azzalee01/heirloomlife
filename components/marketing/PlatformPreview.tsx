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

type Tab = 'Overview' | 'The Will' | 'Vault'

const NAV: { label: string; d: string; tab: Tab | null }[] = [
  { label: 'Overview',     d: 'M3 11.5L12 4l9 7.5M5 10v9h5v-5h4v5h5v-9', tab: 'Overview' },
  { label: 'The Will',     d: 'M12 6.5c-1.5-1.2-3.5-1.8-5.5-1.8-1 0-2 .15-3 .45v13.3c1-.3 2-.45 3-.45 2 0 4 .6 5.5 1.8m0-13.3c1.5-1.2 3.5-1.8 5.5-1.8 1 0 2 .15 3 .45v13.3c-1-.3-2-.45-3-.45-2 0-4 .6-5.5 1.8m0-13.3V19.8', tab: 'The Will' },
  { label: 'Living Vault', d: 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4', tab: 'Vault' },
  { label: 'Your Will',    d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h4', tab: null },
  { label: 'Documents',    d: 'M3 7h7l2 2h9v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 7V6a2 2 0 012-2h6l2 2', tab: null },
]

const ASSETS = [
  { label: 'Family home, Mosman',  type: 'Real Estate',    value: '$2,400,000', color: 'var(--teal)',  bg: 'var(--paper-warm)', d: 'M3 12l9-8 9 8v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8zM9 21V12h6v9' },
  { label: '2023 Tesla Model 3',   type: 'Vehicle',        value: '$58,000',    color: '#3b82f6',     bg: '#eff6ff',           d: 'M7 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4zM5 17H3v-4l2-5h14l2 5v4h-2M5 17h14' },
  { label: 'CommBank offset',      type: 'Bank Account',   value: '$184,000',   color: '#10b981',     bg: '#f0fdf4',           d: 'M3 10h18M3 14h18M5 6l7-3 7 3M4 10v10M20 10v10' },
  { label: 'ASX share portfolio',  type: 'Shares',         value: '$93,500',    color: '#8b5cf6',     bg: '#f5f3ff',           d: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { label: 'AustralianSuper',      type: 'Superannuation', value: '$312,000',   color: '#f59e0b',     bg: '#fffbeb',           d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
]

const EXECUTOR = { name: 'Michael Chen', rel: 'Brother-in-law', initials: 'MC' }

type Beneficiary = { name: string; rel: string; pct: number; initials: string; changed?: boolean; isNew?: boolean }

const BASE_BENEFICIARIES: Beneficiary[] = [
  { name: 'Sarah Lee',  rel: 'Spouse',   pct: 60, initials: 'SL' },
  { name: 'James Lee',  rel: 'Son',      pct: 25, initials: 'JL' },
  { name: 'Emma Lee',   rel: 'Daughter', pct: 15, initials: 'EL' },
]
const UPDATED_BENEFICIARIES: Beneficiary[] = [
  { name: 'Sarah Lee',  rel: 'Spouse',   pct: 55, initials: 'SL', changed: true  },
  { name: 'James Lee',  rel: 'Son',      pct: 20, initials: 'JL', changed: true  },
  { name: 'Emma Lee',   rel: 'Daughter', pct: 15, initials: 'EL'                 },
  { name: 'Oliver Lee', rel: 'Son',      pct: 10, initials: 'OL', isNew: true    },
]

const DEMO_PROMPT   = "I just had a baby  -  Oliver Lee born last week"
const DEMO_RESPONSE = "Congratulations! A new child affects your guardianship and distribution clauses. I've drafted 2 amendments for your review."
const DEMO_APPLIED  = "✓ 2 amendments applied  -  Will v5 drafted and sent for solicitor review."

const DEMO_AMENDMENTS = [
  { title: 'Add Oliver Lee as beneficiary', detail: 'Redistribute: Sarah 55% · James 20% · Emma 15% · Oliver 10%' },
  { title: 'Update guardianship clause',    detail: 'Oliver Lee added under the existing arrangement in Clause 2.' },
]

type ChatMsg = { role: 'user' | 'assistant'; text: string }
type Phase   = 'idle' | 'typing' | 'thinking' | 'responded' | 'approving' | 'applied' | 'resetting'

const DEMO_REPLIES: Record<string, string> = {
  default:  "Great question. In the real platform I'd read your will, flag affected clauses, and draft a specific amendment. Create a free account to try it with your own details.",
  property: "A new property changes your asset register immediately. I'd add it then check your residuary estate clause. Create an account to do this for real.",
  child:    "A new child is a high-severity event  -  guardianship and distribution provisions both need reviewing. Create an account to walk through it.",
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

export default function PlatformPreview() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')

  const [phase,          setPhase]          = useState<Phase>('idle')
  const [typedText,      setTypedText]      = useState('')
  const [demoMsgs,       setDemoMsgs]       = useState<ChatMsg[]>([])
  const [showAmendments, setShowAmendments] = useState(false)
  const [approvePulse,   setApprovePulse]   = useState(false)
  const [beneficiaries,  setBeneficiaries]  = useState<Beneficiary[]>(BASE_BENEFICIARIES)
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
    setBeneficiaries(BASE_BENEFICIARIES)
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
                    setBeneficiaries(UPDATED_BENEFICIARIES)
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

  // Auto-scroll mobile chat when demo progresses
  useEffect(() => {
    if (phase === 'typing' || phase === 'thinking' || phase === 'responded' || phase === 'applied') {
      setTimeout(() => mobileChatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100)
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
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      setTimeout(() => mobileChatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
    }, 900)
  }

  const displayMsgs  = userMode ? chatMsgs  : demoMsgs
  const displayInput = userMode ? chatInput : typedText
  const isThinking   = (phase === 'thinking' && !userMode) || chatLoading
  const demoRunning  = !userMode && phase !== 'idle'

  // ─── Shared sub-components ──────────────────────────────────────────────────

  function BeneficiaryRow({ b }: { b: Beneficiary }) {
    return (
      <div style={{ borderRadius: 6, border: `1px solid ${b.isNew ? 'var(--teal)' : 'var(--line)'}`, background: '#fff', padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 6, animation: b.isNew ? 'slideInRow .5s ease' : b.changed ? 'flashTeal .9s ease' : 'none', transition: 'border-color .4s ease' }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: b.isNew ? 'var(--teal-deep)' : 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7.5, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{b.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 4 }}>
            {b.name}
            {b.isNew && <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 4px', borderRadius: 99, background: 'var(--teal)', color: '#fff' }}>New</span>}
          </div>
          <div style={{ fontSize: 8.5, color: 'var(--neutral)' }}>{b.rel}</div>
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: b.changed ? 'var(--teal-deep)' : 'var(--teal)', padding: '1px 5px', borderRadius: 4, flexShrink: 0, transition: 'background .4s ease' }}>{b.pct}%</div>
      </div>
    )
  }

  function AmendmentPanel({ compact }: { compact?: boolean }) {
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

  // ─── Desktop assistant panel ─────────────────────────────────────────────────

  const assistantPanel = (
    <aside
      onClick={e => e.stopPropagation()}
      style={{ width: 248, flexShrink: 0, borderLeft: '1px solid var(--line)', background: '#fff', display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}
      aria-label="Estate Assistant demo"
    >
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--paper-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" color="var(--teal)" size={12}/>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>Estate Assistant</div>
          <div style={{ fontSize: 9, color: 'var(--neutral)', lineHeight: 1.35 }}>Ask about your Will or share a life change</div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {displayMsgs.length === 0 && !isThinking && (
          <div style={{ margin: 'auto', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink)' }}>What has changed?</div>
            <div style={{ marginTop: 3, fontSize: 9, lineHeight: 1.45, color: 'var(--neutral)' }}>Tell me about a new asset, beneficiary, executor, or life event.</div>
          </div>
        )}
        {displayMsgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '88%', padding: '7px 9px', borderRadius: 7, fontSize: 9.5, lineHeight: 1.5, background: m.role === 'user' ? 'var(--teal)' : 'var(--paper-warm)', color: m.role === 'user' ? '#fff' : 'var(--ink)' }}>
              {m.text}
              {m.role === 'assistant' && userMode && (
                <Link href="/auth/signup" onClick={e => e.stopPropagation()} style={{ display: 'block', marginTop: 5, fontSize: 9, fontWeight: 700, color: 'var(--teal-deep)', textDecoration: 'underline' }}>
                  Create a free account →
                </Link>
              )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div style={{ display: 'flex' }}>
            <div style={{ padding: '7px 10px', borderRadius: 7, background: 'var(--paper-warm)', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 150, 300].map(d => (
                <span key={d} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--neutral)', display: 'inline-block', animation: 'bounce 1s infinite', animationDelay: `${d}ms`, opacity: 0.7 }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef}/>
      </div>

      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--line-soft)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 7 }}>
          <input
            ref={inputRef}
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
            style={{ flex: 1, minWidth: 0, padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 10, color: 'var(--ink)', background: 'var(--paper-warm)', outline: 'none', fontFamily: 'inherit', cursor: userMode ? 'text' : 'default' }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--teal)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)' }}
          />
          <button
            onClick={e => { e.stopPropagation(); sendChat() }}
            disabled={!userMode || !chatInput.trim() || chatLoading}
            style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--teal)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (!userMode || !chatInput.trim() || chatLoading) ? 0.4 : 1, transition: 'opacity .15s' }}
            aria-label="Send"
          >
            <Icon d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" color="#fff" size={12}/>
          </button>
        </div>
        <div style={{ marginTop: 5, fontSize: 8, lineHeight: 1.35, color: 'var(--neutral)' }}>Review every proposed change before confirming.</div>
      </div>
    </aside>
  )

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>

      {/* ── DESKTOP (sm and up) ─────────────────────────────────────────────── */}
      <div className="hidden sm:block">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', paddingInline: '2px' }}>
          <span style={{ fontSize: '.72rem', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--mkt-stone)' }}>
            {userMode ? 'Use the assistant panel to send a message' : demoRunning ? 'Watching demo…' : 'Live platform preview'}
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
              app.heirloomlife.com.au/dashboard
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
                      onClick={e => { e.stopPropagation(); if (item.tab) { setActiveTab(item.tab); if (!userTookOver.current) handlePreviewClick() } }}
                      disabled={!item.tab}
                      className="platform-nav-btn"
                      style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 8, fontSize: 13, cursor: item.tab ? 'pointer' : 'default', background: active ? 'var(--paper-warm)' : 'transparent', color: active ? 'var(--ink)' : 'var(--neutral)', fontWeight: active ? 500 : 400, border: 'none', width: '100%', textAlign: 'left', opacity: !item.tab ? 0.45 : 1, transition: 'background .12s, color .12s' }}>
                      <span style={{ color: active ? 'var(--teal)' : 'inherit', flexShrink: 0 }}>
                        <Icon d={item.d} size={15} color="currentColor"/>
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
              <header style={{ borderBottom: '1px solid var(--line)', padding: '0 20px', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--paper)', flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: '1rem', color: 'var(--ink)' }}>Hi, Aaron</span>
                <Link href="/will/new"
                  onClick={e => e.stopPropagation()}
                  style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 6, background: 'var(--teal)', color: '#fff', textDecoration: 'none' }}>
                  Start your Will →
                </Link>
              </header>

              <div style={{ flex: 1, minWidth: 0, minHeight: 0, overflowX: 'hidden', overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>

                {activeTab === 'Overview' && (
                  <>
                    <div style={{ borderRadius: 8, border: `1px solid ${willStatus === 'pending' ? 'var(--teal)' : 'var(--line)'}`, background: '#fff', overflow: 'hidden', flexShrink: 0, transition: 'border-color .5s ease' }}>
                      <div style={{ height: 3, background: 'var(--teal)' }}/>
                      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--paper-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" color="var(--teal)" size={13}/>
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>Your Will</span>
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 4, background: willStatus === 'pending' ? '#fef3c7' : '#ecfdf5', color: willStatus === 'pending' ? '#92400e' : '#065f46', transition: 'all .5s ease' }}>
                                {willStatus === 'pending' ? 'Pending review' : 'Approved'}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--neutral)', marginTop: 1, transition: 'all .4s ease' }}>
                              {willStatus === 'pending'
                                ? `Amended ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })} · Version ${willVersion}`
                                : `Last updated 12 Jun 2026 · Version ${willVersion}`}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setActiveTab('The Will'); if (!userTookOver.current) handlePreviewClick() }}
                          style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal-deep)', background: 'rgba(42,180,174,.08)', border: '1px solid var(--teal)', padding: '3px 10px', borderRadius: 6, cursor: 'pointer', flexShrink: 0 }}>
                          View Will →
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flexShrink: 0 }}>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--neutral)', display: 'block', marginBottom: 7 }}>Your Estate</span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
                          {ASSETS.map(a => (
                            <div key={a.label} style={{ borderRadius: 7, border: '1px solid var(--line)', background: '#fff', padding: '9px 10px' }}>
                              <div style={{ width: 24, height: 24, borderRadius: 6, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                                <Icon d={a.d} color={a.color} size={11}/>
                              </div>
                              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: a.color }}>{a.type}</div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink)', marginTop: 2, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.label}</div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink)', marginTop: 1 }}>{a.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--neutral)', display: 'block', marginBottom: 7 }}>Your People</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {beneficiaries.map(b => (
                            <div key={b.name} style={{ borderRadius: 6, border: `1px solid ${b.isNew ? 'var(--teal)' : 'var(--line)'}`, background: '#fff', padding: '6px 9px', display: 'flex', alignItems: 'center', gap: 7, animation: b.isNew ? 'slideInRow .5s ease' : b.changed ? 'flashTeal .9s ease' : 'none', transition: 'border-color .4s ease' }}>
                              <div style={{ width: 22, height: 22, borderRadius: '50%', background: b.isNew ? 'var(--teal-deep)' : 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{b.initials}</div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  {b.name}
                                  {b.isNew && <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 99, background: 'var(--teal)', color: '#fff' }}>New</span>}
                                </div>
                                <div style={{ fontSize: 9, color: 'var(--neutral)' }}>{b.rel}</div>
                              </div>
                              <div style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: b.changed ? 'var(--teal-deep)' : 'var(--teal)', padding: '1px 5px', borderRadius: 4, flexShrink: 0, transition: 'background .4s ease' }}>{b.pct}%</div>
                            </div>
                          ))}
                          <div style={{ borderRadius: 6, border: '1px solid var(--line)', background: '#fff', padding: '6px 9px', display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--teal-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{EXECUTOR.initials}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink)' }}>{EXECUTOR.name}</div>
                              <div style={{ fontSize: 9, color: 'var(--neutral)' }}>Executor</div>
                            </div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--teal-deep)', background: 'rgba(42,180,174,.1)', border: '1px solid var(--teal)', padding: '1px 5px', borderRadius: 4, flexShrink: 0 }}>Primary</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {showAmendments && !userMode && (
                      <div style={{ flexShrink: 0 }}>
                        <AmendmentPanel />
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'The Will' && (
                  <div style={{ borderRadius: 8, border: '1px solid var(--line)', background: '#fff', overflow: 'hidden' }}>
                    <div style={{ height: 3, background: 'var(--teal)' }}/>
                    <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon d="M2 2h8l4 4v8H2V2zM10 2v4h4" color="var(--teal)" size={11}/>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>Sample Last Will &amp; Testament</div>
                        <div style={{ fontSize: 10, color: 'var(--neutral)', marginTop: 1 }}>
                          Version {willVersion} · {willStatus === 'pending' ? 'Pending solicitor review' : 'Solicitor reviewed 12 Jun 2026'}
                        </div>
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', paddingLeft: 7, borderLeft: '2px solid var(--teal)', color: 'var(--teal-deep)', flexShrink: 0 }}>
                        {willStatus === 'pending' ? 'Pending review' : 'Solicitor reviewed'}
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
                    <Link href="/the-will#solicitor-review" style={{ margin: '10px 14px 14px', borderRadius: 7, background: 'var(--ink)', padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>Request solicitor review</span>
                      <Icon d="M3 8h10M9 4l4 4-4 4" color="var(--teal)" size={12}/>
                    </Link>
                  </div>
                )}

                {activeTab === 'Vault' && (
                  <>
                    <div style={{ borderRadius: 8, border: '1px solid var(--line)', background: '#fff', overflow: 'hidden' }}>
                      <div style={{ height: 3, background: 'var(--teal)' }}/>
                      <div style={{ padding: '11px 14px' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 9 }}>Life events</div>
                        {[
                          { label: 'Marriage automatically revokes a prior Will in most Australian states', badge: 'Action needed', teal: false },
                          { label: 'New asset added: Investment property, Bondi', badge: 'Synced', teal: true },
                          { label: 'Second child registered as beneficiary', badge: 'Review suggested', teal: false },
                        ].map(e => (
                          <div key={e.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '7px 9px', borderRadius: 7, background: 'var(--paper-warm)', border: '1px solid var(--line)', marginBottom: 5, fontSize: 10 }}>
                            <span style={{ color: 'var(--ink)', flex: 1, lineHeight: 1.4 }}>{e.label}</span>
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99, border: `1px solid ${e.teal ? 'var(--teal)' : 'var(--ink)'}`, color: e.teal ? 'var(--teal-deep)' : 'var(--ink)', flexShrink: 0 }}>{e.badge}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ borderRadius: 8, border: '1px solid var(--line)', background: '#fff', padding: '11px 14px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>Executor Access</div>
                      <div style={{ fontSize: 11, color: 'var(--neutral)', marginBottom: 9 }}>Access granted after death certificate lodgement and identity verification.</div>
                      <div style={{ border: '1px solid var(--line)', borderRadius: 7, overflow: 'hidden' }}>
                        {[
                          ['Executor', 'Michael Chen'],
                          ['Access trigger', 'Death certificate + identity verification'],
                        ].map(([k, v], i, arr) => (
                          <div key={k} style={{ display: 'grid', gridTemplateColumns: '9rem 1fr', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
                            <div style={{ background: 'var(--paper-warm)', padding: '6px 9px', fontSize: 9, fontWeight: 600, color: 'var(--neutral)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{k}</div>
                            <div style={{ padding: '6px 9px', fontSize: 10, color: 'var(--ink)' }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>
            {assistantPanel}
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

        {/* App UI — no phone frame */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--neutral)' }}>Aaron Lee</span>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>AL</div>
            </div>
          </div>

          {/* Scrollable content */}
          <div ref={mobileScrollRef} onClick={handleMobilePreviewClick} style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

            {/* Dashboard */}
            <div style={{ padding: '12px 14px 0' }}>

              {/* Will status */}
              <div style={{ borderRadius: 9, border: `1px solid ${willStatus === 'pending' ? 'var(--teal)' : 'var(--line)'}`, background: '#fff', overflow: 'hidden', marginBottom: 12, transition: 'border-color .5s ease' }}>
                <div style={{ height: 2, background: 'var(--teal)' }}/>
                <div style={{ padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>Your Will</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 4, background: willStatus === 'pending' ? '#fef3c7' : '#ecfdf5', color: willStatus === 'pending' ? '#92400e' : '#065f46', transition: 'all .5s ease' }}>
                        {willStatus === 'pending' ? 'Pending review' : 'Approved'}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--neutral)', marginTop: 1 }}>Version {willVersion} · Solicitor reviewed</div>
                  </div>
                  <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" color="var(--teal)" size={20}/>
                </div>
              </div>

              {/* Beneficiaries */}
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--neutral)', display: 'block', marginBottom: 6 }}>Your People</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {beneficiaries.map(b => <BeneficiaryRow key={b.name} b={b}/>)}
                  <div style={{ borderRadius: 6, border: '1px solid var(--line)', background: '#fff', padding: '6px 9px', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--teal-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{EXECUTOR.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>{EXECUTOR.name}</div>
                      <div style={{ fontSize: 9, color: 'var(--neutral)' }}>Executor</div>
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--teal-deep)', background: 'rgba(42,180,174,.1)', border: '1px solid var(--teal)', padding: '1px 6px', borderRadius: 4 }}>Primary</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estate Assistant */}
            <div style={{ borderTop: '1px solid var(--line)', margin: '0 14px', paddingTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--line-soft)' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--paper-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" color="var(--teal)" size={13}/>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>Estate Assistant</div>
                  <div style={{ fontSize: 9.5, color: 'var(--neutral)' }}>Ask about your Will or share a life change</div>
                </div>
              </div>

              {/* Chat messages */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingBottom: 12 }}>
                {displayMsgs.length === 0 && !isThinking && (
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div style={{ fontSize: 10, color: 'var(--neutral)' }}>What has changed in your life?</div>
                  </div>
                )}
                {displayMsgs.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '86%', padding: '7px 10px', borderRadius: 10, fontSize: 11, lineHeight: 1.5, background: m.role === 'user' ? 'var(--teal)' : 'var(--paper-warm)', color: m.role === 'user' ? '#fff' : 'var(--ink)' }}>
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
                    <AmendmentPanel compact />
                  </div>
                )}
                <div ref={mobileChatEndRef}/>
              </div>
            </div>

          </div>

          {/* Sticky input */}
          <div onClick={e => e.stopPropagation()} style={{ padding: '10px 14px 10px', borderTop: '1px solid var(--line)', background: '#fff', flexShrink: 0 }}>
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
              { label: 'Will', active: false, icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              )},
              { label: 'Vault', active: false, icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
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
