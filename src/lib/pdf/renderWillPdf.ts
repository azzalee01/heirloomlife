export interface FuneralWishes {
  funeralType?: string
  funeralRestingPlace?: string
  funeralAdditionalWishes?: string
  hasFuneralPlan?: boolean
  funeralPlanDetails?: string
}

function toTitleCase(s: string): string {
  return s.replace(/\w\S*/g, (txt) => txt[0].toUpperCase() + txt.slice(1).toLowerCase())
}

function stripInline(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*([^*]+?)\*/g, '$1')
}

export async function renderWillPdf(
  documentText: string,
  options?: { testatorName?: string; funeralWishes?: FuneralWishes },
): Promise<ArrayBuffer> {
  // Normalise Unicode to ASCII-safe equivalents so jsPDF never emits WinAnsi
  // control-range bytes (0x80-0x9F) that Adobe Acrobat rejects as invalid.
  const processedText = documentText
    .replace(/\{\{[^}]+\}\}/g, '_______________')
    .replace(/—/g, '--')
    .replace(/–/g, '-')
    .replace(/‘|’/g, "'")
    .replace(/“|”/g, '"')
    .replace(/ /g, ' ')

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  doc.setProperties({ title: 'Last Will and Testament' })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  // ─── PAGE 1: Signing Instructions ────────────────────────────────────

  doc.setFillColor(42, 180, 174)
  doc.rect(0, 0, pageW, 26, 'F')

  doc.setFont('times', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(255, 255, 255)
  doc.text('H', 14, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text('heirloom life', 24, 18)

  doc.setFontSize(8.5)
  doc.text('heirloomlife.com.au', pageW - 14, 18, { align: 'right' })

  doc.setTextColor(14, 21, 20)
  doc.setFont('times', 'bold')
  doc.setFontSize(18)
  doc.text('Instructions for signing your Will', 14, 42)

  doc.setDrawColor(42, 180, 174)
  doc.setLineWidth(0.6)
  doc.line(14, 49, pageW - 14, 49)

  type CoverStep = { title: string; body?: string; bullets?: string[]; note?: string }

  const coverSteps: CoverStep[] = [
    {
      title: 'Print and review your Will',
      body: 'Print your Will and read through it carefully. Make sure all names, addresses, gifts and other details are correct. If anything needs updating, log in to your Vault at heirloomlife.com.au and make changes before printing.',
    },
    {
      title: 'Assemble your Will  --  DO NOT INCLUDE THE FUNERAL WISHES PAGE',
      bullets: [
        'Remove this cover sheet and the Funeral Wishes page -- they do not form part of your Will.',
        'Keep all Will pages together in the correct order.',
      ],
    },
    {
      title: 'Find two independent adult witnesses',
      body: 'Each witness must:',
      bullets: [
        'be 18 years of age or older;',
        'not be a beneficiary under this Will; and',
        'be capable of witnessing the signing and be present to see you sign.',
      ],
    },
    {
      title: 'Sign your Will in the presence of both witnesses',
      body: 'With both witnesses present and watching at the same time:',
      bullets: [
        'sign in the space at the bottom of each page of the Will; and',
        'sign and complete the Execution & Attestation section on the last page.',
      ],
      note: 'Both witnesses must then sign in the same spaces while you are present. Do not sign any page before both witnesses are present.',
    },
    {
      title: 'Store your Will safely',
      body: 'Keep the original signed Will somewhere secure and tell your Executor(s) exactly where it is located. Keep a copy in a separate safe location.',
    },
  ]

  const bW = pageW - 27 - 14
  let y = 54

  for (let i = 0; i < coverSteps.length; i++) {
    const { title, body, bullets, note } = coverSteps[i]
    const num = String(i + 1)

    doc.setFillColor(42, 180, 174)
    doc.circle(18.5, y + 2.5, 4.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text(num, 18.5, y + 2.5, { align: 'center', baseline: 'middle' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(14, 21, 20)
    const titleLines = doc.splitTextToSize(title, bW)
    doc.text(titleLines, 27, y + 4.2)
    y += 4.2 + titleLines.length * 5.5

    if (body) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(55, 65, 64)
      const bodyLines = doc.splitTextToSize(body, bW)
      doc.text(bodyLines, 27, y)
      y += bodyLines.length * 5 + 1
    }

    if (bullets && bullets.length > 0) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(55, 65, 64)
      for (const bullet of bullets) {
        const bLines = doc.splitTextToSize(bullet, bW - 7)
        doc.text('-', 30, y)
        doc.text(bLines, 36, y)
        y += bLines.length * 5
      }
      y += 1
    }

    if (note) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8.5)
      doc.setTextColor(100, 110, 108)
      const nLines = doc.splitTextToSize(note, bW)
      doc.text(nLines, 27, y)
      y += nLines.length * 5 + 1
    }

    y += 5
  }

  // Heirloom recommended practice
  y += 2
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(42, 180, 174)
  doc.text('Heirloom recommended practice', 14, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(55, 65, 64)
  const recLines = doc.splitTextToSize(
    'As a risk-management practice, Heirloom recommends: (1) neither witness should be the spouse or de facto partner of a beneficiary; (2) use a single blue or black ballpoint pen throughout.',
    pageW - 28,
  )
  doc.text(recLines, 14, y)
  y += recLines.length * 5 + 6

  // AV note
  const avNote =
    'Signing remotely via audiovisual link? Do not use these instructions -- contact Heirloom through your Vault for the separate AV witnessing procedure.'
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  const avWrapped = doc.splitTextToSize(avNote, pageW - 38)
  const avBoxH = 13 + avWrapped.length * 4.5
  doc.setFillColor(237, 248, 248)
  doc.roundedRect(14, y, pageW - 28, avBoxH, 2, 2, 'F')
  doc.setDrawColor(42, 180, 174)
  doc.setLineWidth(0.35)
  doc.roundedRect(14, y, pageW - 28, avBoxH, 2, 2, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(26, 125, 121)
  doc.text('Remote signing?', 20, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(55, 65, 64)
  doc.text(avWrapped, 20, y + 12)

  // Footer bar
  const footerY = pageH - 22
  doc.setFillColor(14, 21, 20)
  doc.rect(0, footerY, pageW, 22, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(138, 155, 153)
  const disclaimer =
    'This Will was prepared using Heirloom Life\'s guided platform and reviewed against a solicitor-written drafting checklist before issue. Heirloom Life Pty Ltd is not a law firm and this document does not constitute legal advice.'
  const dLines = doc.splitTextToSize(disclaimer, pageW - 30)
  doc.text(dLines, pageW / 2, footerY + 7, { align: 'center' })
  doc.setTextColor(180, 200, 198)
  doc.setFontSize(8)
  doc.text('heirloomlife.com.au', pageW / 2, footerY + 7 + dLines.length * 4.5 + 2, { align: 'center' })

  // ─── PAGES 2+: Will content ───────────────────────────────────────────
  doc.addPage()
  doc.setTextColor(0, 0, 0)

  const mL = 25, mT = 30, mB = 58
  const cW = pageW - mL - 25

  const titleLine = processedText.split('\n').find((l) => l.startsWith('LAST WILL AND TESTAMENT OF '))
  const extractedName = titleLine ? titleLine.replace('LAST WILL AND TESTAMENT OF ', '').trim() : ''
  const testatorSigName = options?.testatorName || toTitleCase(extractedName) || 'Testator'

  let willY = mT
  let titleSeen = false

  function ensureSpace(h: number) {
    if (willY + h > pageH - mB) { doc.addPage(); willY = mT }
  }

  for (const raw of processedText.split('\n')) {
    const line = raw.trim()
    if (!line) { willY += 4; continue }
    if (line.startsWith('IN WITNESS WHEREOF')) continue

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

    if (/^[A-Z][A-Z\s\-—]+$/.test(line)) {
      doc.setFont('times', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      const wrapped = doc.splitTextToSize(line, cW)
      ensureSpace(wrapped.length * 6.5 + 4)
      doc.text(wrapped, mL, willY)
      willY += wrapped.length * 6.5 + 4
      continue
    }

    if (line.startsWith('- ')) {
      doc.setFont('times', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      const wrapped = doc.splitTextToSize(stripInline(line.slice(2)), cW - 10)
      ensureSpace(wrapped.length * 6.5 + 1)
      doc.text('-', mL + 2, willY)
      doc.text(wrapped, mL + 8, willY)
      willY += wrapped.length * 6.5 + 1
      continue
    }

    if (/^\([a-z]\)\s/.test(line)) {
      doc.setFont('times', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      const wrapped = doc.splitTextToSize(stripInline(line), cW - 6)
      ensureSpace(wrapped.length * 6.5 + 1)
      doc.text(wrapped, mL + 6, willY)
      willY += wrapped.length * 6.5 + 1
      continue
    }

    doc.setFont('times', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    const wrapped = doc.splitTextToSize(stripInline(line), cW)
    ensureSpace(wrapped.length * 6.5)
    doc.text(wrapped, mL, willY)
    willY += wrapped.length * 6.5
  }

  // ─── Execution & Attestation block ────────────────────────────────────
  ensureSpace(145)
  willY += 10

  doc.setFont('times', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(0, 0, 0)
  doc.text('Execution & Attestation', mL, willY)
  willY += 7
  doc.setDrawColor(42, 180, 174)
  doc.setLineWidth(0.5)
  doc.line(mL, willY, mL + cW, willY)
  willY += 9

  doc.setFont('times', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text(testatorSigName, mL, willY)
  willY += 10

  doc.setDrawColor(60)
  doc.setLineWidth(0.4)
  doc.line(mL, willY, mL + cW, willY)
  willY += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Signature', mL, willY)
  willY += 10

  doc.setDrawColor(60)
  doc.setLineWidth(0.4)
  doc.line(mL, willY, mL + cW, willY)
  willY += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('Date', mL, willY)
  willY += 12

  const attText = `We the undersigned were both present at the same time and saw the willmaker, ${testatorSigName}, sign this Will and then we signed it ourselves in the willmaker's presence:`
  doc.setFont('times', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  const attWrapped = doc.splitTextToSize(attText, cW)
  doc.text(attWrapped, mL, willY)
  willY += attWrapped.length * 5.5 + 8

  const wColW = (cW - 10) / 2
  const wC = [mL, mL + wColW + 10]

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text('Witness 1', wC[0], willY)
  doc.text('Witness 2', wC[1], willY)
  willY += 9

  for (const fieldLabel of ['Signature', 'Name (Print Name)', 'Address', 'Occupation']) {
    doc.setDrawColor(60)
    doc.setLineWidth(0.4)
    doc.line(wC[0], willY, wC[0] + wColW, willY)
    doc.line(wC[1], willY, wC[1] + wColW, willY)
    willY += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100)
    doc.text(`Witness 1 ${fieldLabel}`, wC[0], willY)
    doc.text(`Witness 2 ${fieldLabel}`, wC[1], willY)
    doc.setTextColor(0)
    willY += 13
  }

  // ─── Footer + header pass (Will pages only) ────────────────────────────
  const willLastPage = doc.getNumberOfPages()
  const totalWillPages = willLastPage - 1

  for (let p = 2; p <= willLastPage; p++) {
    doc.setPage(p)
    const willPageNo = p - 1

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(140)
    doc.text(`Last Will & Testament of ${testatorSigName}`, mL, 12)
    doc.text(`Page ${willPageNo} of ${totalWillPages}`, pageW - mL, 12, { align: 'right' })
    doc.setDrawColor(200)
    doc.setLineWidth(0.25)
    doc.line(mL, 15, pageW - mL, 15)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(160)
    doc.text('Heirloom Life', mL, pageH - 10)
    doc.text('heirloomlife.com.au', pageW - mL, pageH - 10, { align: 'right' })

    if (p < willLastPage) {
      const sigTop = pageH - 52 + 2
      const lineY = sigTop + 16
      const slotW = cW / 3

      doc.setDrawColor(180)
      doc.setLineWidth(0.25)
      doc.line(mL, sigTop, pageW - 25, sigTop)

      const cols = [mL, mL + slotW, mL + slotW * 2]
      const sigLabels = [`${testatorSigName} Signature`, 'Witness 1 Signature', 'Witness 2 Signature']

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(130)

      for (let s = 0; s < 3; s++) {
        const x = cols[s]
        doc.text(sigLabels[s], x, sigTop + 6)
        doc.setDrawColor(130)
        doc.setLineWidth(0.3)
        doc.line(x, lineY, x + slotW - 6, lineY)
      }

      doc.setDrawColor(180)
      doc.setLineWidth(0.25)
      doc.line(mL, lineY + 4, pageW - 25, lineY + 4)
    }

    doc.setTextColor(0)
  }

  // ─── Funeral Wishes page (separate — not part of Will) ─────────────────
  const funeralWishes = options?.funeralWishes
  const hasFuneralContent =
    funeralWishes &&
    (funeralWishes.funeralType ||
      funeralWishes.funeralRestingPlace ||
      funeralWishes.funeralAdditionalWishes ||
      funeralWishes.hasFuneralPlan)

  if (hasFuneralContent && funeralWishes) {
    doc.addPage()

    doc.setFillColor(42, 180, 174)
    doc.rect(0, 0, pageW, 22, 'F')

    doc.setFont('times', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(255, 255, 255)
    doc.text('H', 14, 16)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('heirloom life', 23, 16)

    doc.setTextColor(14, 21, 20)
    doc.setFont('times', 'bold')
    doc.setFontSize(15)
    doc.text(`Funeral Wishes of ${testatorSigName}`, 14, 36)

    doc.setDrawColor(42, 180, 174)
    doc.setLineWidth(0.5)
    doc.line(14, 39, pageW - 14, 39)

    const discl =
      'This document is not a testamentary document and does not form part of the Will. It records personal wishes only and is not legally binding on any person.'
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const disclWrapped = doc.splitTextToSize(discl, pageW - 36)
    const disclBoxH = 10 + disclWrapped.length * 5
    doc.setFillColor(255, 249, 228)
    doc.roundedRect(14, 44, pageW - 28, disclBoxH, 2, 2, 'F')
    doc.setDrawColor(200, 160, 60)
    doc.setLineWidth(0.3)
    doc.roundedRect(14, 44, pageW - 28, disclBoxH, 2, 2, 'S')
    doc.setTextColor(90, 70, 20)
    doc.text(disclWrapped, 20, 51)

    let fy = 44 + disclBoxH + 10

    doc.setFont('times', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Funeral Wishes', 14, fy)
    fy += 3
    doc.setDrawColor(200)
    doc.setLineWidth(0.3)
    doc.line(14, fy, pageW - 14, fy)
    fy += 9

    function funeralRow(label: string, value: string) {
      if (!value) return
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(80)
      doc.text(label, 14, fy)
      fy += 5
      doc.setFont('times', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      const wrapped = doc.splitTextToSize(value, pageW - 28)
      doc.text(wrapped, 14, fy)
      fy += wrapped.length * 6 + 7
    }

    const funeralTypeLabels: Record<string, string> = {
      burial: 'Burial',
      cremation: 'Cremation',
      naturalBurial: 'Natural / green burial',
      noPreference: 'No preference stated',
    }

    if (funeralWishes.funeralType) {
      funeralRow('Type of funeral', funeralTypeLabels[funeralWishes.funeralType] || funeralWishes.funeralType)
    }
    if (funeralWishes.funeralRestingPlace) {
      funeralRow('Preferred resting place', funeralWishes.funeralRestingPlace)
    }
    if (funeralWishes.funeralAdditionalWishes) {
      funeralRow('Additional wishes', funeralWishes.funeralAdditionalWishes)
    }
    if (funeralWishes.hasFuneralPlan) {
      funeralRow(
        'Pre-paid funeral plan',
        funeralWishes.funeralPlanDetails ||
          'A pre-paid funeral plan has been arranged. Please contact the funeral director for details.',
      )
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(160)
    doc.text('Heirloom Life', 14, pageH - 10)
    doc.text('heirloomlife.com.au', pageW - 14, pageH - 10, { align: 'right' })
  }

  return doc.output('arraybuffer') as ArrayBuffer
}
