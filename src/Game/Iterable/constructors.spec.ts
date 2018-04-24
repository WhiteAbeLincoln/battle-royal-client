// tslint:disable:no-expression-statement
import * as It from './constructors'
import { take } from './operators'

describe('cycle', () => {
  it('Generates an infinite cycle', () => {
    const cycle3 = It.cycle([1,2,3])
    expect([...take(6)(cycle3())]).toEqual([1,2,3,1,2,3])
  })
})
