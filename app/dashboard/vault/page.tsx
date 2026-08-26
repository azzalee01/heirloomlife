export default function VaultPage() {
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
          Living Vault
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
              <path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
              <circle cx="12" cy="16" r="1" fill="var(--teal)" stroke="none" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ink)' }}>
            Living Vault coming soon
          </h2>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--neutral)' }}>
            Store important documents, passwords, and messages for your loved ones  -  all in one secure place.
          </p>
        </div>
      </main>
    </div>
  );
}
