export const mapToHtml = formulaString => {
  return formulaString
    .replace(/(&)/g, '&nbsp;&and;&nbsp;') // '&' must be replaced first due to html syntax
    .replace(/(-)/g, '&not;')
    .replace(/(v)/g, '&nbsp;&or;&nbsp;')
    .replace(/(>)/g, '&nbsp;&rarr;&nbsp;')
}

export const mapToUnicode = formulaString => {
  return formulaString
    .replace(/(&)/g, '\u00A0\u2227\u00A0')
    .replace(/(-)/g, '\u00AC')
    .replace(/(v)/g, '\u00A0\u2228\u00A0')
    .replace(/(>)/g, '\u00A0\u2192\u00A0')
}
