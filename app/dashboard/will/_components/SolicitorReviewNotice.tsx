// Shown on /dashboard/will in place of the paywall when the Will is SOLICITOR_REQUIRED.
// We can't auto-issue it, so we don't offer checkout — the primary action is to request
// a solicitor review. Keeps the promise: never take money for a Will we won't deliver.
export default function SolicitorReviewNotice() {
  return (
    <div className="bg-white border border-amber-200 overflow-hidden">
      <div className="h-[3px] w-full" style={{ backgroundColor: '#f59e0b' }} />
      <div className="px-6 py-5 space-y-4">
        <div>
          <p className="text-base font-semibold" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
            This Will needs a solicitor review before it can be issued
          </p>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--neutral)' }}>
            Based on what you’ve told us — for example an asset held by a trust, company or
            SMSF, or assets held overseas — this estate needs a solicitor to prepare your
            Will. We can’t issue it automatically, so it isn’t available to buy online yet.
            We don’t charge for a Will we can’t deliver.
          </p>
        </div>
        <a
          href="mailto:hello@heirloomlife.com.au?subject=Solicitor%20review%20request"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--teal)' }}
        >
          Request a solicitor review
        </a>
        <p className="text-xs" style={{ color: 'var(--neutral)' }}>
          You can see the specific items flagged on your{' '}
          <a href="/dashboard/notifications" className="underline">review page</a>.
        </p>
      </div>
    </div>
  )
}
