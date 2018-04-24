// tslint:disable:no-expression-statement
import * as It from './operators'

const nat = function*(start = 1) {
  while (true) {
    // tslint:disable-next-line:no-parameter-reassignment
    yield start++
  }
}

describe('take', () => {
  const take5 = It.take(5)

  it('works with an array', () => {
    expect([...take5([1,2,3,4,5,6,7])]).toEqual([1,2,3,4,5])
  })

  it('works with a generator', () => {
    expect([...take5(nat())]).toEqual([1,2,3,4,5])
  })

  it('yields nothing when given a negative number', () => {
    const take0 = It.take(-5)
    expect([...take0(nat())]).toEqual([])
  })
})

describe('filter', () => {
  const filterOdd = It.filter((n: number) => n % 2 !== 0)

  it('works with an array', () => {
    expect([...filterOdd([1,2,3,4,5,6])]).toEqual([1,3,5])
  })

  it('works with a generator', () => {
    expect([...It.take(5)(filterOdd(nat()))]).toEqual([1,3,5,7,9])
  })
})

describe('map', () => {
  const mapString = It.map((n: number) => `${n}`)

  it('works with an array', () => {
    expect([...mapString([1,2,3,4,5])]).toEqual(['1','2','3','4','5'])
  })

  it('works with a generator', () => {
    expect([...It.take(5)(mapString(nat()))]).toEqual(['1','2','3','4','5'])
  })
})

describe('forEach', () => {
  it('works with an array', () => {
    // tslint:disable-next-line:no-let
    let count = 0
    It.forEach((n: number) => { count = n })([1,2,3,4,5])
    expect(count).toEqual(5)
  })

  it('works with a generator', () => {
    // tslint:disable-next-line:no-let
    let count = 0
    It.forEach((n: number) => { count = n })(It.take(5)(nat()))
    expect(count).toEqual(5)
  })
})

describe('scan', () => {
  it('works with an array', () => {
    const sums = It.scan((p: number, c: number) => p + c)
    expect([...sums([1,2,3,4,5])]).toEqual([3,6,10,15])
  })

  it('works with a generator', () => {
    const sums = It.scan((p: number, c: number) => p + c)
    expect([...sums(It.take(5)(nat()))]).toEqual([3,6,10,15])
  })

  it('works when providing a seed value', () => {
    const sums = It.scan((p: number, c: number) => p + c, 0)
    expect([...sums([1,2,3,4,5])]).toEqual([1,3,6,10,15])
  })

  it('works like Array.prototype.reduce', () => {
    const sum = (p: number, c: number) => p + c

    const source = [1,2,3,4,5]
    const accumulator: number[] = []

    const accumSum = (p: number, c: number) => {
      const next = sum(p, c)
      accumulator.push(next)
      return next
    }

    source.reduce(accumSum)

    expect([...It.scan(sum)(source)]).toEqual(accumulator)

    // tslint:disable-next-line:no-object-mutation
    accumulator.length = 0

    source.reduce(accumSum, 0)

    expect([...It.scan(sum, 0)(source)]).toEqual(accumulator)
  })
})

describe('takeWhile', () => {
  const whileNotNull = It.takeWhile((val: any) => val !== null)
  it('works with an array', () => {
    expect([...whileNotNull([1,2,3,4,5,null,6])]).toEqual([1,2,3,4,5])
  })

  it('works with a generator', () => {
    function* nullEveryFive() {
      // tslint:disable-next-line:no-let
      let count = 1
      while (true) {
        yield count % 5 === 0 ? null : count++
      }
    }

    expect([...whileNotNull(It.take(10)(nullEveryFive()))]).toEqual([1,2,3,4])
  })
})
