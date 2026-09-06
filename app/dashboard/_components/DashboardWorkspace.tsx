'use client'

import { useState } from 'react'
import AiChat from './AiChat'

function AssistantIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547Z" />
    </svg>
  )
}

export default function DashboardWorkspace({ children }: { children: React.ReactNode }) {
  const [desktopOpen, setDesktopOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const panelVisible = desktopOpen || mobileOpen

  return (
    <div className="flex h-full min-w-0 max-w-full flex-1 overflow-hidden">
      <div className="min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto pb-16 md:pb-0">{children}</div>

      {!desktopOpen && (
        <div className="hidden w-14 shrink-0 border-l border-[var(--line)] bg-white xl:flex xl:justify-center xl:pt-4">
          <button
            type="button"
            onClick={() => setDesktopOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--paper-warm)] text-[var(--teal-deep)] transition-[background,transform] hover:bg-[var(--teal-light)] active:scale-[0.96]"
            aria-label="Open Estate Assistant"
            title="Open Estate Assistant"
          >
            <AssistantIcon />
          </button>
        </div>
      )}

      <aside
        aria-label="Estate Assistant"
        className={`${mobileOpen ? 'fixed inset-0 z-50 flex items-end bg-black/20' : 'hidden'} ${desktopOpen ? 'xl:flex' : 'xl:hidden'} xl:static xl:z-auto xl:items-stretch xl:bg-transparent`}
      >
        <div className="h-[78vh] w-full max-w-full overflow-hidden rounded-t-xl border border-[var(--line)] bg-white shadow-2xl xl:h-full xl:w-[344px] xl:rounded-none xl:border-y-0 xl:border-r-0 xl:shadow-none">
          {panelVisible && <AiChat variant="rail" onClose={() => { setDesktopOpen(false); setMobileOpen(false) }} />}
        </div>
      </aside>

      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-[4.5rem] right-4 z-40 flex h-12 items-center gap-2 rounded-full bg-[var(--ink)] px-4 text-sm font-semibold text-white shadow-lg transition-transform active:scale-[0.96] md:bottom-5 md:right-5 xl:hidden"
          aria-label="Open Estate Assistant"
        >
          <span className="text-[var(--teal)]"><AssistantIcon /></span>
          Estate Assistant
        </button>
      )}
    </div>
  )
}
