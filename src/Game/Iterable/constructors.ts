
export const cycle = <T>(it: Iterable<T>) => {
  return function*() {
    // FIXME: this will require an infinitely increasing amount of memory given an infinite generator
    // figure out how haskell handles this
    const saved = []
    for (const x of it) {
      yield x
      // tslint:disable-next-line:no-expression-statement
      saved.push(x)
    }

    while (saved.length > 0) {
      yield *saved
    }
  }
}
