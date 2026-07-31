export default function DocumentsPage() {
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
          Documents
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
              <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              <path d="M16 3v4M8 3v4M3 11h18" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ink)' }}>
            Documents coming soon
          </h2>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--neutral)' }}>
            All your signed estate documents in one place — ready to download, share, or store securely.
          </p>
        </div>
      </main>
    </div>
  );
}
