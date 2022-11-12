import BigNumber from "bignumber.js";

const gradeSymbols = [
  [-3, 'm'],
  [-2, 'c'],
  [0, ''],
  [3, 'K'],
  [6, 'M'],
  [9, 'B'],
  [12, 'T'],
] as const

function findGrade(exp: number): [grade: number, symbol: string] {
  let grade: number
  let symbol: string
  let minDiff: number = Infinity
  for (const [g, s] of gradeSymbols) {
    const diff = Math.abs(g - exp)
    if (diff <= minDiff) {
      minDiff = diff
      symbol = s
      grade = g
    }
  }
  return [grade, symbol]
}

export function formatNumber(value: BigNumber.Value): string {
  const bigNum = new BigNumber(value)
  const exp = bigNum.e
  const [grade, symbol] = findGrade(exp)
  const shifted = bigNum.shiftedBy(-grade)
  return `${shifted.toFixed(2)}${symbol}`
}

(window as any).formatNumber = formatNumber
