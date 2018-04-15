// @flow

export const tokenize = (input: string): string[] => {
  const parts = input.match(/\\?.|^$/g)
  if (!parts) return []

  return parts.reduce((p: any, c) => {
    if (c === '"') {
      p.quote ^= 1
    } else if (!p.quote && c === ' ') {
      p.a.push('')
    } else {
      p.a[p.a.length - 1] += c.replace(/\\(.)/, '$1')
    }

    return p
  }, {a: ['']}).a
}
