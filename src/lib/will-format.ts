/**
 * Plain-text formatting for the issued Will.
 *
 * The approved clause library uses markdown emphasis (**bold** sub-headings, *Act name*
 * italics). The Will is presented as plain text — a <pre> on the dashboard and the PDF —
 * so the markers must be removed, otherwise they show up literally (e.g. "**Survivorship**").
 * This strips the MARKERS only; the words are unchanged, so it never alters the approved
 * wording. Used by the renderer, the dashboard/summary display, and the PDF.
 */
export function stripMarkdownEmphasis(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // **bold** → bold
    .replace(/\*([^*]+?)\*/g, '$1') // *italic* → italic
}
