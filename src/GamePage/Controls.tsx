// @flow
import * as React from 'react'
import { getKeyMappings, Input, KeyMapping } from '../Game/Actions'
import { pageStyle } from './Menu'
import { BigHeader } from '../Components'
import Chips from '../Components/Chips'
import { css } from 'emotion'

// tslint:disable:no-expression-statement
// tslint:disable:no-this
// tslint:disable:no-class
// tslint:disable:typedef
// tslint:disable:readonly-array
// tslint:disable:readonly-keyword
// tslint:disable:no-if-statement

type ControlsState = {
  [key in Input]: ReadonlyArray<string>
}

const controlStyle = css`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  & div {
    margin: 5px;
  }
  & kbd {
    margin: 2px;
    border-radius: 3px;
    padding: 1px 2px 0;
    border: 1px solid black;
    color: black;
  }
`

const mappingToState = (mappings: KeyMapping): ControlsState => (
  Object.keys(mappings).reduce((obj: any, name) => {
      // tslint:disable-next-line:no-object-mutation
      obj[mappings[name]] = [...(obj[mappings[name]] || []), name]
      return obj
    }, {} as any)
)

const stateToMapping = (state: ControlsState): KeyMapping => (
  (Object.keys(state) as Input[]).reduce((obj, name) => {
    const values = state[name]
    values.forEach(v => {
      // tslint:disable-next-line:no-object-mutation
      obj[v] = name
    })

    return obj
  }, {} as { [key: string]: Input })
)

export class Controls extends React.Component<{}, ControlsState> {
  constructor(props: {}) {
    super(props)
    this.state = mappingToState(getKeyMappings())
  }

  onChange = (key: string) => (old: string[], values: string[]): Promise<string[]> => {
    const { [key]: current, ...others } = this.state
    const otherSet = Object.values(others).reduce((p, c) => [...p, ...c], [])
    const shouldChange =
      values.every(v => !otherSet.includes(v))

    if (shouldChange) {
      this.setState({
        [key as any]: values
      }, () => {
        const stringified = JSON.stringify(stateToMapping(this.state))
        localStorage.setItem('key_bindings', stringified)
      })

      return Promise.resolve(values)
    }

    return Promise.resolve(old)
  }

  render() {
    return (
      <div className={pageStyle}>
        <BigHeader>Controls</BigHeader>
        <div>
        {Object.keys(this.state).map((s, i) => (
          <span key={i}>{`${s}: `}
            <Chips
              values={(this.state as any)[s]}
              onChange={this.onChange(s)}
              getRenderValue={v => v === ' ' ? 'Space' : v}
            />
          </span>
        ))}
        </div>
      </div>
    )
  }
}
