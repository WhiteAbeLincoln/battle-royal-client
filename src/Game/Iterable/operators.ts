// tslint:disable:no-if-statement
// tslint:disable:no-let
// tslint:disable:no-expression-statement
// tslint:disable:typedef
// tslint:disable:max-line-length
// tslint:disable:readonly-array

type OperatorFunction<T, U> = (it: Iterable<T>) => Iterable<U>

/**
 * Applies the provided function to every item in the iterator and yields the new value
 * @param callbackfn The mapping function
 */
export const map = <T, U>(callbackfn: (value: T, index: number) => U): OperatorFunction<T, U> => {
  return function*(it: Iterable<T>): Iterable<U> {
    let i = 0
    for (const x of it) {
      yield callbackfn(x, i++)
    }
  }
}

/**
 * Calls the provided function with every item in the iterator
 * @param f The function
 */
export const forEach = <T>(f: (a: T) => void) => (it: Iterable<T>) => {
  for (const x of it) {
    f(x)
  }
}

type FilterFunc<T, U extends T> = ((a: T) => a is U) | ((a: T) => boolean)

/**
 * Yields a value when the the provided predicate is true
 * @param f The predicate function
 */
export const filter = <T, U extends T>(f: FilterFunc<T, U>): OperatorFunction<T, U> => {
  return function*(it: Iterable<T>): Iterable<U> {
    for (const x of it) {
      if (f(x)) {
        yield x
      }
    }
  }
}

export function scan<T>(callbackfn: (previousValue: T, currentValue: T, index: number) => T, initialValue?: T): OperatorFunction<T, T>
export function scan<T, U>(callbackfn: (previousValue: U, currentValue: T, index: number) => U, initialValue: U): OperatorFunction<T, T>
export function scan<T,U= T>(callbackfn: (previousValue: U, currentValue: T, index: number) => U, initialValue?: U): OperatorFunction<T, U> {
  let hasSeed = arguments.length >= 2

  return function*(it: Iterable<T>): Iterable<U> {
    let i = 0
    let acc = initialValue as U
    let hasValue = false
    for (const item of it) {
      // tslint:disable-next-line:no-conditional-assignment
      if (hasValue || (hasValue = hasSeed)) {
        acc = callbackfn(acc, item, i++)
        yield acc
      } else {
        acc = item as any
        hasValue = true
        i++
      }
    }
  }
}

export const take = (num: number) => {
  return function*<T>(it: Iterable<T>): Iterable<T> {
    if (num < 1) {
      return
    }
    let count = 0
    for (const x of it) {
      yield x
      if (++count >= num) break
    }
  }
}

export const takeWhile = <T, U extends T = T>(pred: FilterFunc<T, U>) => {
  return function*(it: Iterable<T>): Iterable<U> {
    for (const x of it) {
      if (!pred(x)) break
      yield x
    }
  }
}

export const length = <T>(it: Iterable<T>): number => ([...it].length)

export function pipe<T, A>(op1: OperatorFunction<T, A>): OperatorFunction<T, A>
export function pipe<T, A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): OperatorFunction<T, B>
export function pipe<T, A, B, C>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): OperatorFunction<T, C>
export function pipe<T, A, B, C, D>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>): OperatorFunction<T, D>
export function pipe<T, A, B, C, D, E>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>): OperatorFunction<T, E>
export function pipe<T, A, B, C, D, E, F>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>): OperatorFunction<T, F>
export function pipe<T, A, B, C, D, E, F, G>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>): OperatorFunction<T, G>
export function pipe<T, A, B, C, D, E, F, G, H>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>): OperatorFunction<T, H>
export function pipe<T, A, B, C, D, E, F, G, H, I>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>, op9: OperatorFunction<H, I>): OperatorFunction<T, I>
export function pipe<T, R>(...operations: OperatorFunction<T, R>[]): OperatorFunction<T, R> {
  return (init: Iterable<T>): Iterable<R> => operations.reduce((s, f) => f(s) as any, init)
}
