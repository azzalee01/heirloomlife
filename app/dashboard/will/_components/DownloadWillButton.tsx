'use client'

import { useState } from 'react'
import { markWillDownloaded } from '../_actions'

interface Props {
  willId: string
  documentText: string
  hasDownloaded: boolean
}

export default function DownloadWillButton({ willId, documentText, hasDownloaded }: Props) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      await markWillDownloaded(willId)

      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      doc.setProperties({ title: 'Last Will and Testament' })

      const pageW = doc.internal.pageSize.getWidth()   // 210
      const pageH = doc.internal.pageSize.getHeight()  // 297

      // ─────────────────────────────────────────────────────────────────
      // PAGE 1: Cover sheet
      // ─────────────────────────────────────────────────────────────────

      // Teal header band
      doc.setFillColor(42, 180, 174)
      doc.rect(0, 0, pageW, 26, 'F')

      // "H" mark — white serif
      doc.setFont('times', 'bold')
      doc.setFontSize(17)
      doc.setTextColor(255, 255, 255)
      doc.text('H', 14, 18)

      // Wordmark
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      doc.text('heirloom life', 24, 18)

      // URL right-aligned
      doc.setFontSize(8.5)
      doc.text('heirloomlife.com.au', pageW - 14, 18, { align: 'right' })

      // Title
      doc.setTextColor(14, 21, 20)
      doc.setFont('times', 'bold')
      doc.setFontSize(18)
      doc.text('Instructions for signing your Will', 14, 42)

      // Teal rule
      doc.setDrawColor(42, 180, 174)
      doc.setLineWidth(0.6)
      doc.line(14, 46, pageW - 14, 46)

      // Steps — distinguish required steps from recommended practices
      const steps: Array<{ title: string; required: string[]; recommended?: string[] }> = [
        {
          title: 'Print and review',
          required: [
            'Print your Will and read every page carefully. Confirm that all names, addresses, gifts and other details are correct.',
            'If anything needs updating, log in to your Vault at heirloomlife.com.au and make corrections before printing.',
          ],
        },
        {
          title: 'Assemble the Will',
          required: [
            'Remove this cover sheet — it does not form part of your Will.',
            'Keep all pages of the Will together in the correct order and securely staple them.',
          ],
        },
        {
          title: 'Choose two witnesses',
          required: [
            'Your witnesses must be adults (18 or over) who are not beneficiaries under this Will.',
          ],
          recommended: [
            'Heirloom also recommends that a witness not be the spouse or de facto partner of a beneficiary, to minimise any future challenge to the Will.',
          ],
        },
        {
          title: 'Sign your Will',
          required: [
            'Both witnesses should be with you when you sign (or acknowledge your existing signature).',
          ],
          recommended: [
            'For Heirloom\'s recommended procedure, all three of you should stay together for the whole signing:',
            '     •   sign each Will page where indicated',
            '     •   both witnesses sign each Will page where indicated',
            '     •   complete the Execution & Attestation section at the end',
            '     •   use a blue or black pen throughout',
            '     •   do not sign any page in advance',
          ],
        },
        {
          title: 'Store the original',
          required: [
            'Keep the original signed Will somewhere secure and tell your Executor(s) exactly where it is located.',
          ],
        },
      ]

      const bodyWidth = pageW - 27 - 14  // 169mm

      let y = 54

      for (let i = 0; i < steps.length; i++) {
        const { title, required, recommended } = steps[i]
        const num = String(i + 1)

        // Numbered circle
        doc.setFillColor(42, 180, 174)
        doc.circle(18.5, y + 2.5, 4.5, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(255, 255, 255)
        doc.text(num, 18.5, y + 4.2, { align: 'center' })

        // Step title
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10.5)
        doc.setTextColor(14, 21, 20)
        doc.text(`Step ${num} — ${title}`, 27, y + 4.2)

        y += 11

        // Required lines
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9.5)
        doc.setTextColor(55, 65, 64)
        for (const line of required) {
          const wrapped = doc.splitTextToSize(line, bodyWidth)
          doc.text(wrapped, 27, y)
          y += wrapped.length * 5.5
        }

        // Recommended lines (slightly muted)
        if (recommended && recommended.length > 0) {
          y += 2
          doc.setFont('helvetica', 'italic')
          doc.setFontSize(9)
          doc.setTextColor(100, 110, 108)
          for (const line of recommended) {
            const wrapped = doc.splitTextToSize(line, bodyWidth)
            doc.text(wrapped, 27, y)
            y += wrapped.length * 5.2
          }
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(9.5)
          doc.setTextColor(55, 65, 64)
        }

        y += 6
      }

      // AV witnessing — short note only; full AV procedure is a separate workflow
      // APPROVED_AVL_EXECUTION_TEXT_REQUIRED — do not inline AV instructions here
      const avNoteBoxH = 16
      doc.setFillColor(237, 248, 248)
      doc.roundedRect(14, y, pageW - 28, avNoteBoxH, 2, 2, 'F')
      doc.setDrawColor(42, 180, 174)
      doc.setLineWidth(0.35)
      doc.roundedRect(14, y, pageW - 28, avNoteBoxH, 2, 2, 'S')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(26, 125, 121)
      doc.text('Signing remotely?', 20, y + 7)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(55, 65, 64)
      const avNote = 'Audiovisual witnessing uses a different procedure. Do not use these instructions for a remote signing. Contact Heirloom through your Vault.'
      doc.text(doc.splitTextToSize(avNote, pageW - 42), 20, y + 13)

      // Footer bar
      const footerY = pageH - 22
      doc.setFillColor(14, 21, 20)
      doc.rect(0, footerY, pageW, 22, 'F')

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(138, 155, 153)
      const disclaimer =
        'This Will has been prepared using solicitor-reviewed drafting standards. Heirloom Life Pty Ltd is not a law firm and this document is not legal advice. Contact us through your Vault if your circumstances require bespoke legal advice.'
      const dLines = doc.splitTextToSize(disclaimer, pageW - 30)
      doc.text(dLines, pageW / 2, footerY + 7, { align: 'center' })

      doc.setTextColor(180, 200, 198)
      doc.setFontSize(8)
      doc.text('heirloomlife.com.au', pageW / 2, footerY + 7 + dLines.length * 4.5 + 2, { align: 'center' })

      // ─────────────────────────────────────────────────────────────────
      // PAGE 2+: Will content
      // ─────────────────────────────────────────────────────────────────
      doc.addPage()

      // Reset colour to black — cover page footer left it light grey
      doc.setTextColor(0, 0, 0)

      // mB is increased to 52mm to reserve space for the per-page signature block.
      // ensureSpace() uses this to trigger page breaks before content overruns the footer.
      const mL = 25, mT = 30, mB = 52
      const cW = pageW - mL - 25

      // Extract testator name from the document header line for the signature block
      const titleLine = documentText.split('\n').find((l) => l.startsWith('LAST WILL AND TESTAMENT OF '))
      const testatorSigName = titleLine ? titleLine.replace('LAST WILL AND TESTAMENT OF ', '').trim() : 'TESTATOR'
      let willY = mT
      let titleSeen = false

      function ensureSpace(h: number) {
        if (willY + h > pageH - mB) { doc.addPage(); willY = mT }
      }

      // Strip inline **bold** and *italic* markers from body text
      function stripInline(text: string): string {
        return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*([^*]+?)\*/g, '$1')
      }

      for (const raw of documentText.split('\n')) {
        const line = raw.trim()

        if (!line) { willY += 4; continue }

        // First non-empty line is the document title
        if (!titleSeen) {
          titleSeen = true
          doc.setFont('times', 'bold')
          doc.setFontSize(13)
          doc.setTextColor(0, 0, 0)
          const wrapped = doc.splitTextToSize(line, cW)
          ensureSpace(wrapped.length * 8 + 8)
          doc.text(wrapped, pageW / 2, willY, { align: 'center' })
          willY += wrapped.length * 8 + 8
          continue
        }

        // Blockquote warning (escalation clauses: "> ⚠ Solicitor review...")
        if (line.startsWith('> ')) {
          const text = stripInline(line.slice(2))
          doc.setFont('times', 'italic')
          doc.setFontSize(9.5)
          doc.setTextColor(100, 100, 100)
          const wrapped = doc.splitTextToSize(text, cW - 8)
          ensureSpace(wrapped.length * 6 + 3)
          doc.text(wrapped, mL + 6, willY)
          doc.setTextColor(0, 0, 0)
          willY += wrapped.length * 6 + 3
          continue
        }

        // Standalone bold heading: **Survivorship**, **Effect of marriage**, etc.
        if (/^\*\*.+\*\*$/.test(line)) {
          const heading = line.replace(/\*\*/g, '')
          doc.setFont('times', 'bold')
          doc.setFontSize(10.5)
          doc.setTextColor(0, 0, 0)
          const wrapped = doc.splitTextToSize(heading, cW)
          ensureSpace(wrapped.length * 6.5 + 3)
          doc.text(wrapped, mL, willY)
          willY += wrapped.length * 6.5 + 3
          continue
        }

        // Numbered section header: "1. REVOCATION"
        if (/^\d+\.\s/.test(line)) {
          doc.setFont('times', 'bold')
          doc.setFontSize(11)
          doc.setTextColor(0, 0, 0)
          const wrapped = doc.splitTextToSize(line, cW)
          ensureSpace(wrapped.length * 6.5 + 4)
          doc.text(wrapped, mL, willY)
          willY += wrapped.length * 6.5 + 4
          continue
        }

        // All-caps standalone heading (e.g. "IMPORTANT NOTICE")
        if (/^[A-Z][A-Z\s]+$/.test(line)) {
          doc.setFont('times', 'bold')
          doc.setFontSize(11)
          doc.setTextColor(0, 0, 0)
          const wrapped = doc.splitTextToSize(line, cW)
          ensureSpace(wrapped.length * 6.5 + 4)
          doc.text(wrapped, mL, willY)
          willY += wrapped.length * 6.5 + 4
          continue
        }

        // List item
        if (line.startsWith('- ')) {
          doc.setFont('times', 'normal')
          doc.setFontSize(11)
          doc.setTextColor(0, 0, 0)
          const wrapped = doc.splitTextToSize(stripInline(line.slice(2)), cW - 10)
          ensureSpace(wrapped.length * 6.5 + 1)
          doc.text('•', mL + 2, willY)
          doc.text(wrapped, mL + 8, willY)
          willY += wrapped.length * 6.5 + 1
          continue
        }

        // Body paragraph — strip inline markdown markers
        doc.setFont('times', 'normal')
        doc.setFontSize(11)
        doc.setTextColor(0, 0, 0)
        const wrapped = doc.splitTextToSize(stripInline(line), cW)
        ensureSpace(wrapped.length * 6.5)
        doc.text(wrapped, mL, willY)
        willY += wrapped.length * 6.5
      }

      // ── Footer pass — runs after all content is rendered ─────────────────
      // Page 1  = cover/instructions (no Will footer)
      // Pages 2..N-1 = substantive Will pages (signature block + wordmark)
      // Page N  = last Will page / execution page (wordmark only — full signing section already there)
      const totalPages = doc.getNumberOfPages()
      const totalWillPages = totalPages - 1  // excluding cover
      const lastWillPage = totalPages         // execution clause lands on last page

      for (let p = 2; p <= totalPages; p++) {
        doc.setPage(p)
        const willPageNo = p - 1  // 1-based Will page number

        // ── Wordmark + page number (all Will pages) ───────────────────────
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(160)
        doc.text('Heirloom Life', mL, pageH - 10)
        doc.text(`${willPageNo} of ${totalWillPages}`, pageW - mL, pageH - 10, { align: 'right' })

        // ── Per-page signature block (intermediate pages only, not execution page) ──
        if (p < lastWillPage) {
          const sigTop = pageH - mB + 2      // top of the signature area
          const lineY = sigTop + 16           // y of the actual signature underlines
          const slotW = (pageW - mL - 25) / 3 // three equal slots across the content width

          // Separator line above signature block
          doc.setDrawColor(180)
          doc.setLineWidth(0.25)
          doc.line(mL, sigTop, pageW - 25, sigTop)

          // Column positions (left edge of each slot)
          const cols = [mL, mL + slotW, mL + slotW * 2]
          const labels = [testatorSigName, 'Witness 1', 'Witness 2']

          doc.setFont('helvetica', 'normal')
          doc.setFontSize(7)
          doc.setTextColor(130)

          for (let s = 0; s < 3; s++) {
            const x = cols[s]
            const lineEnd = x + slotW - 6

            // Label
            doc.text(labels[s], x, sigTop + 6)

            // Signature underline (drawn as a line)
            doc.setDrawColor(130)
            doc.setLineWidth(0.3)
            doc.line(x, lineY, lineEnd, lineY)
          }

          // Separator line below
          doc.setDrawColor(180)
          doc.setLineWidth(0.25)
          doc.line(mL, lineY + 4, pageW - 25, lineY + 4)
        }

        doc.setTextColor(0)
      }

      const blob = doc.output('blob')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'my-will.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-60"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        {downloading ? 'Downloading…' : 'Download Will'}
      </button>
      {hasDownloaded && (
        <p className="text-xs" style={{ color: 'var(--neutral)' }}>
          Your completed Will remains available to download. Changing it requires unlimited updates ($25/year).
        </p>
      )}
    </div>
  )
}
