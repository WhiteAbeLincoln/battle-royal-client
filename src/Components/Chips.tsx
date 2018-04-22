import * as React from 'react'
import { css } from 'emotion'

// tslint:disable:no-expression-statement
// tslint:disable:no-this
// tslint:disable:no-class
// tslint:disable:typedef
// tslint:disable:readonly-array
// tslint:disable:readonly-keyword
// tslint:disable:no-if-statement

function arrayDiffer<T>(a: T[], b: T[]) {
  if (a === b) return false
  if (a.length !== b.length) return true

  const asorted = [...a].sort()
  const bsorted = [...b].sort()

  // tslint:disable-next-line:no-let
  for (let i = 0; i < a.length; i++) {
    if (asorted[i] !== bsorted[i]) return true
  }

  return false
}

const kbdStyle = css`
  margin: 2px;
  border-radius: 3px;
  padding: 1px 2px 0;
  cursor: pointer;
  border: 1px solid white;
  color: white;
`

type ChipProps = {
  value: string
  onClick: () => void
  className?: string
  render?: (value: string) => JSX.Element
}

class Chip extends React.Component<ChipProps> {
  render() {
    const className = this.props.className || kbdStyle
    const { render, onClick, value, ...rest } = this.props
    return <span onClick={onClick}>{render ? render(value) : <kbd className={className} {...rest}>{value}</kbd>}</span>
  }
}

const chipsStyle = css`
  border: 1px solid white;
  padding: 5px;
`

type ChipsProps = {
  className?: string
  onChange: (old: string[], values: string[]) => Promise<string[]>
  getRenderValue?: (value: string) => string
  renderChip?: (value: string) => JSX.Element
  values?: string[]
}

type ChipsState = {
  values: string[]
}

export class Chips extends React.Component<ChipsProps, ChipsState> {
  constructor(props: ChipsProps) {
    super(props)
    this.state = { values: props.values || [] }
  }

  keyPress = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    const key = ev.key
    if (!this.state.values.includes(key)) {
      const old = [...this.state.values]
      this.props.onChange(old, [...old, key]).then(values => {
        this.setState({ values })
      })
    }
  }

  onClick = (v: string) => () => {
    const old = [...this.state.values]
    const vals = [...this.state.values]
    const index = this.state.values.indexOf(v)
    vals.splice(index, 1)
    this.props.onChange(old, vals).then(values => {
      this.setState({ values })
    })
  }

  render() {
    const renderValue: (v: string) => string = this.props.getRenderValue
                                              ? this.props.getRenderValue
                                              : v => v
    return (
    <div
      tabIndex={-1}
      onKeyDown={this.keyPress}
      className={this.props.className || chipsStyle}
    >
      {this.state.values.map((v, i) => (
        <Chip key={i} value={renderValue(v)} onClick={this.onClick(v)} render={this.props.renderChip} />
      ))}
    </div>)
  }
}

export default Chips
