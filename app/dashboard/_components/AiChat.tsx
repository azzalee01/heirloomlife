'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadChatHistory, sendChatMessage, applyAmendment, type AmendmentProposal } from '../_actions'

type ProposalState = AmendmentProposal & { status: 'pending' | 'applying' | 'applied' | 'dismissed' | 'error' }
type Message = { id: string; role: 'user' | 'assistant'; text: string; proposals?: ProposalState[] }

export default function AiChat() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const loadedCountRef = useRef(0)

  useEffect(() => {
    loadChatHistory()
      .then((history) => {
        const msgs = history.map((h) => ({ id: h.id, role: h.role, text: h.content }))
        loadedCountRef.current = msgs.length
        setMessages(msgs)
      })
      .catch(() => {
        // No will yet, or not authenticated — chat starts empty; the input
        // will surface the real error on first send attempt.
      })
  }, [])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const historyForApi = messages.map((m) => ({ id: m.id, role: m.role, content: m.text }))
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text }])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const { reply, proposals } = await sendChatMessage(historyForApi, text)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: reply || "I've noted that.",
          proposals: proposals.map((p) => ({ ...p, status: 'pending' as const })),
        },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function updateProposal(messageId: string, proposalId: string, status: ProposalState['status']) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, proposals: m.proposals?.map((p) => (p.id === proposalId ? { ...p, status } : p)) }
          : m
      )
    )
  }

  async function confirmProposal(messageId: string, proposal: ProposalState) {
    updateProposal(messageId, proposal.id, 'applying')
    try {
      await applyAmendment(proposal)
      updateProposal(messageId, proposal.id, 'applied')
      router.refresh()
    } catch {
      updateProposal(messageId, proposal.id, 'error')
    }
  }

  return (
    <div className="bg-white border border-[var(--line)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--line-soft)] flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-[var(--paper-warm)]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">Estate Assistant</p>
          <p className="text-xs text-[var(--neutral)]">Tell me about life changes and I&apos;ll help keep your will up to date</p>
        </div>
      </div>

      {/* Messages */}
      {(messages.length > 0 || loading) && (
        <div className="px-6 py-4 space-y-3 border-b border-[var(--line-soft)] max-h-[420px] overflow-y-auto">
          {messages.map((m, i) => (
            <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'} ${i >= loadedCountRef.current ? 'msg-in' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 bg-[var(--paper-warm)]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              )}
              <div className="max-w-[76%] space-y-2">
                <div
                  className={`px-4 py-2.5 text-sm leading-relaxed rounded-2xl ${
                    m.role === 'user'
                      ? 'text-white rounded-tr-sm'
                      : 'text-[var(--ink)] bg-[var(--paper-warm)] rounded-tl-sm'
                  }`}
                  style={m.role === 'user' ? { backgroundColor: 'var(--teal)' } : {}}
                >
                  {m.text}
                </div>

                {m.proposals?.map((p) => (
                  <div key={p.id} className="border border-[var(--line)] bg-white rounded-lg px-4 py-3 space-y-2">
                    <p className="text-sm font-medium text-[var(--ink)]">{p.summary}</p>
                    {p.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => confirmProposal(m.id, p)}
                          className="text-xs font-semibold px-3 py-1.5 text-white rounded transition-transform duration-[80ms] ease-out active:scale-[0.96]"
                          style={{ backgroundColor: 'var(--teal)' }}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => updateProposal(m.id, p.id, 'dismissed')}
                          className="text-xs font-medium px-3 py-1.5 border border-[var(--line)] text-[var(--neutral)] rounded transition-transform duration-[80ms] ease-out active:scale-[0.96]"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                    {p.status === 'applying' && <p className="text-xs text-[var(--neutral)]">Applying…</p>}
                    {p.status === 'applied' && <p className="text-xs font-medium" style={{ color: 'var(--teal)' }}>✓ Added to your will</p>}
                    {p.status === 'dismissed' && <p className="text-xs text-[var(--neutral)]">Dismissed</p>}
                    {p.status === 'error' && <p className="text-xs text-red-600">Couldn&apos;t apply this change. Please try again.</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-6 h-6 flex items-center justify-center shrink-0 bg-[var(--paper-warm)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="bg-[var(--paper-warm)] px-4 py-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[var(--neutral)] animate-bounce opacity-60" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[var(--neutral)] animate-bounce opacity-60" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[var(--neutral)] animate-bounce opacity-60" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="px-6 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">{error}</div>
      )}

      {/* Input */}
      <div className="px-6 py-4">
        <div className="flex gap-3 items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send() }}
            placeholder="Tell me about a life update… e.g. I bought a new house"
            className="flex-1 px-4 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-[var(--paper-warm)]"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-[opacity,transform] duration-[80ms] ease-out active:scale-[0.92] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            style={{ backgroundColor: 'var(--teal)' }}
            aria-label="Send"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
