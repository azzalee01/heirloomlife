export default function PoaPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <header
        className="sticky top-0 z-20 border-b px-6 h-14 flex items-center"
        style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}
      >
        <h1
          className="text-base font-medium"
          style={{ color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Power of Attorney
        </h1>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div
          className="rounded-lg border-2 border-dashed p-12 text-center"
          style={{ borderColor: 'var(--line)' }}
        >
          <div
            className="mx-auto mb-5 w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--paper-warm)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ink)' }}>
            Power of Attorney coming soon
          </h2>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--neutral)' }}>
            Appoint someone you trust to make decisions on your behalf  -  financial, medical, or both.
          </p>
        </div>
      </main>
    </div>
  );
}
