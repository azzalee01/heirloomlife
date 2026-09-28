'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadChatHistory, sendChatMessage, applyAmendment, type AmendmentProposal } from '../_actions'

type ProposalState = AmendmentProposal & {
  status: 'pending' | 'applying' | 'applied' | 'review_pending' | 'dismissed' | 'error'
}
type Message = { id: string; role: 'user' | 'assistant'; text: string; proposals?: ProposalState[] }

const SUGGESTED_PROMPTS = [
  'Who is my executor?',
  'Who inherits my estate?',
  'I want to update my Will.',
]

export default function AiChat({
  variant = 'card',
  onClose,
}: {
  variant?: 'card' | 'rail'
  onClose?: () => void
}) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [loadedCount, setLoadedCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChatHistory()
      .then((history) => {
        const msgs = history.map((h) => ({ id: h.id, role: h.role, text: h.content }))
        setLoadedCount(msgs.length)
        setMessages(msgs)
      })
      .catch(() => {
        // No will yet, or not authenticated — chat starts empty
      })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'nearest' })
  }, [messages, loading])

  async function send(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    const historyForApi = messages.map((m) => ({ id: m.id, role: m.role, content: m.text }))
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text: msg }])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const { reply, proposals } = await sendChatMessage(historyForApi, msg)
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
      const msg = e instanceof Error ? e.message : 'Something went wrong. Please try again.'
      setError(msg === 'MEMBERSHIP_REQUIRED' ? '__MEMBERSHIP_REQUIRED__' : msg)
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
      const { requiresReview } = await applyAmendment(proposal)
      updateProposal(messageId, proposal.id, requiresReview ? 'review_pending' : 'applied')
      router.refresh()
    } catch {
      updateProposal(messageId, proposal.id, 'error')
    }
  }

  const isEmpty = messages.length === 0 && !loading

  return (
    <div
      className={
        variant === 'rail'
          ? 'flex h-full flex-col overflow-hidden bg-white'
          : 'overflow-hidden rounded-xl border border-[var(--line)] bg-white'
      }
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--line)] px-5 py-4">
        <div className="w-8 h-8 flex items-center justify-center shrink-0">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--teal)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            Estate Assistant
          </p>
          <p className="text-xs leading-snug" style={{ color: 'var(--neutral)' }}>
            Ask questions about your Will, find what&apos;s in it, or make changes when life changes.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[var(--paper-warm)]"
            style={{ color: 'var(--neutral)' }}
            aria-label="Close Estate Assistant"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        className={`${variant === 'rail' ? 'min-h-0 flex-1' : 'max-h-[420px]'} space-y-3 overflow-y-auto border-b border-[var(--line)] px-5 py-4`}
      >
        {isEmpty && (
          <div className="flex h-full min-h-36 flex-col items-center justify-center px-4 text-center">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>
              Ask about your Will or make a change.
            </p>
            {variant === 'card' && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => send(prompt)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors hover:bg-[var(--paper-warm)]"
                    style={{
                      borderColor: 'var(--line)',
                      color: 'var(--ink)',
                      background: 'var(--paper)',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'} ${i >= loadedCount ? 'msg-in' : ''}`}
          >
            {m.role === 'assistant' && (
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'var(--paper-warm)' }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--teal)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            )}
            <div className="min-w-0 max-w-[82%] space-y-2">
              {m.text && (
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
              )}

              {m.proposals?.map((p) => {
                // Solicitor referral — special card, no confirm action
                if (p.toolName === 'refer_to_solicitor') {
                  return (
                    <div
                      key={p.id}
                      className="border rounded-lg px-4 py-3 space-y-2.5"
                      style={{ borderColor: 'var(--line)', background: 'var(--paper-warm)' }}
                    >
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
                        That question requires personalised legal advice. The Estate Assistant can
                        explain what&apos;s currently recorded in your Will and help make changes
                        you&apos;ve already decided on, but it can&apos;t recommend what you should
                        do in this situation.
                      </p>
                      <a
                        href="mailto:support@heirloomlife.com.au?subject=Legal advice enquiry"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors hover:bg-white"
                        style={{
                          borderColor: 'var(--line)',
                          color: 'var(--ink)',
                          background: 'transparent',
                        }}
                      >
                        Speak with a solicitor
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                      </a>
                    </div>
                  )
                }

                // Standard amendment proposal
                return (
                  <div
                    key={p.id}
                    className="border bg-white rounded-lg px-4 py-3 space-y-2"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                      {p.summary}
                    </p>
                    {p.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => confirmProposal(m.id, p)}
                          className="text-xs font-semibold px-3 py-1.5 text-white rounded transition-transform duration-[80ms] ease-out active:scale-[0.96]"
                          style={{ backgroundColor: 'var(--teal)' }}
                        >
                          Confirm change
                        </button>
                        <button
                          type="button"
                          onClick={() => updateProposal(m.id, p.id, 'dismissed')}
                          className="text-xs font-medium px-3 py-1.5 border border-[var(--line)] text-[var(--neutral)] rounded transition-transform duration-[80ms] ease-out active:scale-[0.96]"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {p.status === 'applying' && (
                      <p className="text-xs" style={{ color: 'var(--neutral)' }}>
                        Applying…
                      </p>
                    )}
                    {p.status === 'applied' && (
                      <p className="text-xs font-medium" style={{ color: 'var(--teal)' }}>
                        ✓ Saved to your Will
                      </p>
                    )}
                    {p.status === 'review_pending' && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium" style={{ color: 'var(--teal)' }}>
                          ✓ Change saved — your updated Will is awaiting review
                        </p>
                        <p className="text-xs" style={{ color: 'var(--neutral)' }}>
                          Your current Will remains unchanged while we review the new version.
                        </p>
                      </div>
                    )}
                    {p.status === 'dismissed' && (
                      <p className="text-xs" style={{ color: 'var(--neutral)' }}>
                        Cancelled
                      </p>
                    )}
                    {p.status === 'error' && (
                      <p className="text-xs text-red-600">
                        Couldn&apos;t apply this change. Please try again.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: 'var(--paper-warm)' }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--teal)"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div
              className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1"
              style={{ background: 'var(--paper-warm)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-[var(--neutral)] animate-bounce opacity-60"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-[var(--neutral)] animate-bounce opacity-60"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-[var(--neutral)] animate-bounce opacity-60"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error banners */}
      {error && error !== '__MEMBERSHIP_REQUIRED__' && (
        <div className="px-5 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">
          {error}
        </div>
      )}
      {error === '__MEMBERSHIP_REQUIRED__' && (
        <div
          className="px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3"
          style={{ background: '#fffbeb', borderColor: '#fde68a' }}
        >
          <p className="text-xs" style={{ color: '#92400e' }}>
            <span className="font-semibold">Unlimited updates required.</span>{' '}
            Your Will is complete and yours to keep. Add unlimited updates to change it.
          </p>
          <a
            href="/pricing"
            className="text-xs font-semibold underline hover:no-underline shrink-0"
            style={{ color: '#78350f' }}
          >
            Add unlimited updates — $25/year
          </a>
        </div>
      )}

      {/* Input */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
            placeholder="Ask about your Will or make a change…"
            className="min-w-0 flex-1 px-4 py-2.5 border text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-[var(--paper-warm)]"
            style={{ borderColor: 'var(--line)' }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-[opacity,transform] duration-[80ms] ease-out active:scale-[0.92] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            style={{ backgroundColor: 'var(--teal)' }}
            aria-label="Send"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed" style={{ color: 'var(--neutral)' }}>
          Estate Assistant can help you navigate and update your Heirloom documents. It does not
          provide personalised legal advice.
        </p>
      </div>
    </div>
  )
}
