import { notFound } from 'next/navigation'
import { getInviteDetails } from '@/app/witnessing/_actions'
import InviteScheduleForm from './_components/InviteScheduleForm'

export default async function WitnessInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  let invite
  try {
    invite = await getInviteDetails(token)
  } catch {
    notFound()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--paper)' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <span
            className="text-lg"
            style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', color: 'var(--teal)' }}
          >
            Heirloom
          </span>
        </div>

        <div className="bg-white border border-[var(--line)] overflow-hidden">
          <div className="h-[3px] w-full" style={{ backgroundColor: 'var(--teal)' }} />
          <div className="px-6 py-6 space-y-4">
            <h1 className="text-lg" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>
              Hi {invite.witnessName}, you&apos;ve been asked to witness a will signing
            </h1>
            <p className="text-sm" style={{ color: 'var(--neutral)' }}>
              You&apos;ll join a short video call and watch the will-maker sign their document in real time, in
              line with Part 2B of the Electronic Transactions Act 2000 (NSW).
            </p>

            <InviteScheduleForm token={token} scheduledAt={invite.scheduledAt} status={invite.status} />
          </div>
        </div>
      </div>
    </div>
  )
}
