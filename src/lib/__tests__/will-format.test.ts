import { describe, it, expect } from 'vitest'
import { stripMarkdownEmphasis } from '../will-format'

describe('stripMarkdownEmphasis', () => {
  it('removes **bold** markers but keeps the words', () => {
    expect(stripMarkdownEmphasis('**Survivorship**')).toBe('Survivorship')
    expect(stripMarkdownEmphasis('(a) **Investment** — to invest')).toBe('(a) Investment — to invest')
  })

  it('removes *italic* markers (e.g. statute names)', () => {
    expect(stripMarkdownEmphasis('the *Trustee Act 1925* (NSW)')).toBe('the Trustee Act 1925 (NSW)')
  })

  it('removes the divorce clause heading markers (no duplicate once un-bolded)', () => {
    const text = '**Effect of marriage and divorce**\n\nIf I marry…'
    expect(stripMarkdownEmphasis(text)).toBe('Effect of marriage and divorce\n\nIf I marry…')
  })

  it('leaves text without emphasis unchanged and is idempotent', () => {
    const plain = 'My Executor must pay all debts.'
    expect(stripMarkdownEmphasis(plain)).toBe(plain)
    expect(stripMarkdownEmphasis(stripMarkdownEmphasis('**x** *y*'))).toBe('x y')
  })

  it('leaves no ** anywhere after stripping', () => {
    const out = stripMarkdownEmphasis('**A** normal *b* and **c d** end')
    expect(out).not.toContain('**')
    expect(out).toBe('A normal b and c d end')
  })
})
