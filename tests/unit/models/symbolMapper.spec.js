import { mapToHtml, mapToUnicode } from '@/models/symbolMapper.js'

describe('mapToHtml', () => {
  it('maps all symbols in syntax', () => {
    const formulaString = 'PQRS()-&v>'
    const formulaHtml = 'PQRS()&not;&nbsp;&and;&nbsp;&nbsp;&or;&nbsp;&nbsp;&rarr;&nbsp;'
    expect(mapToHtml(formulaString)).toBe(formulaHtml)
  })

  it('replaces repeat symbols', () => {
    const formulaString = 'P&P)-)>>&('
    const formulaHtml = 'P&nbsp;&and;&nbsp;P)&not;)&nbsp;&rarr;&nbsp;&nbsp;&rarr;&nbsp;&nbsp;&and;&nbsp;('
    expect(mapToHtml(formulaString)).toBe(formulaHtml)
  })
})

describe('mapToUnicode', () => {
  it('maps all symbols in syntax', () => {
    const formulaString = 'PQRS()-&v>'
    const formulaUnicode = 'PQRS()\u00AC\u00A0\u2227\u00A0\u00A0\u2228\u00A0\u00A0\u2192\u00A0'
    expect(mapToUnicode(formulaString)).toBe(formulaUnicode)
  })

  it('replaces repeat symbols', () => {
    const formulaString = 'P&P)-)>>&('
    const formulaUnicode = 'P\u00A0\u2227\u00A0P)\u00AC)\u00A0\u2192\u00A0\u00A0\u2192\u00A0\u00A0\u2227\u00A0('
    expect(mapToUnicode(formulaString)).toBe(formulaUnicode)
  })
})
