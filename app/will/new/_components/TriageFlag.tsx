export default function TriageFlag() {
  return (
    <div className="mt-2 flex gap-2.5 px-3 py-2.5 border border-amber-200 bg-amber-50 rounded text-xs text-amber-800 leading-relaxed">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" style={{ color: '#d97706' }} aria-hidden="true">
        <path d="M8 2L14 13H2L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 7v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="11.5" r="0.6" fill="currentColor"/>
      </svg>
      <span>
        This is worth a professional look. Keep going — we&apos;ll flag this in your Vault and you can request a solicitor review from there for around $150.
      </span>
    </div>
  )
}
