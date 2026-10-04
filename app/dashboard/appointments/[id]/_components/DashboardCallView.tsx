'use client'

import { useState } from 'react'
import Link from 'next/link'
import JoinPanel from '@/app/appointments/_components/JoinPanel'
import type { AppointmentView } from '@/src/lib/appointments/types'

export default function DashboardCallView({
  id,
  initial,
  supportPhone,
}: {
  id: string
  initial: AppointmentView
  supportPhone?: string
}) {
  const [isInCall, setIsInCall] = useState(false)

  return (
    <div
      className={isInCall ? 'flex h-full flex-col overflow-hidden' : 'min-h-screen overflow-x-hidden'}
      style={{ background: isInCall ? '#0d0d0d' : 'var(--paper)' }}
    >
      <header
        className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b px-6"
        style={{
          background: isInCall ? 'rgba(13,13,13,0.95)' : 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(16px)',
          borderColor: isInCall ? 'rgba(255,255,255,0.08)' : 'var(--line)',
        }}
      >
        <Link
          href="/dashboard/appointments"
          className="text-sm"
          style={{ color: isInCall ? 'rgba(255,255,255,0.45)' : 'var(--neutral)' }}
        >
          ← Appointments
        </Link>
        {isInCall && (
          <span className="ml-auto flex items-center gap-2 text-sm font-medium" style={{ color: '#f87171' }}>
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" aria-hidden="true" />
            Live
          </span>
        )}
      </header>

      <div className={isInCall ? 'flex-1 overflow-hidden' : 'mx-auto w-full max-w-2xl px-4 py-8 pb-28 sm:px-6 md:pb-8'}>
        <JoinPanel
          access={{ appointmentId: id }}
          initial={initial}
          supportPhone={supportPhone}
          bookHref="/dashboard/appointments"
          onInCallChange={setIsInCall}
          videoStyle={isInCall ? { height: 'calc(100vh - 3.5rem)', border: 'none' } : undefined}
        />
      </div>
    </div>
  )
}
