import { constructAssertion, parseFormulaString } from '@/models/formulaParser.js'

export default Object.freeze({
  assertion: constructAssertion(['P>(P>Q)', 'P'], 'Q'),
  argument: [
    {
      dependencies: [1],
      line: 1,
      formula: parseFormulaString('P>(P>Q)'),
      notation: 'A'
    },
    {
      dependencies: [2],
      line: 2,
      formula: parseFormulaString('P'),
      notation: 'A'
    },
    {
      dependencies: [1, 2],
      line: 3,
      formula: parseFormulaString('P>Q'),
      notation: '1,2 MPP'
    },
    {
      dependencies: [1, 2],
      line: 4,
      formula: parseFormulaString('Q'),
      notation: '3,2 MPP'
    }
  ]
})
