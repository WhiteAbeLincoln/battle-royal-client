// @flow
import React, { Component } from 'react'
import { css } from 'emotion'
import type { Socket } from 'socket.io-client'
import { game } from '../Game'
import { Menu } from './Menu'
import { BehaviorSubject } from 'rxjs'

const canvasStyle = css`
  background-color: slategrey;
`

export type Props = {
  width?: number,
  height?: number,
  socket?: ?Socket
}

type State = {
  menuDepth: number,
  sub?: rxjs$ISubscription,
  counter: number
}

export class Canvas extends Component<Props, State> {
  state: State = {
      menuDepth: 0
    , counter: 0
  }

  canvasRef = (React: any).createRef()

  componentDidMount() {
    // here we set up standard canvas methods
    const elem: HTMLCanvasElement = this.canvasRef.current

    if (this.props.socket) {
      // subject to notify when the menu is open
      const subj = new BehaviorSubject(false)

      const gameFunc = game(elem, this.props.socket, subj.asObservable().distinctUntilChanged())
      const menuobs = gameFunc()

      const sub = menuobs.subscribe(() => {
        if (this.state.menuDepth === 0) {
          subj.next(true)
          this.setState((s) => ({ menuDepth: 1, counter: s.counter + 1 }))
        } else {
          if (this.state.menuDepth - 1 === 0) {
            subj.next(false)
          } else {
            subj.next(true)
          }
          this.setState((s) => ({ menuDepth: s.menuDepth - 1, counter: s.counter + 1 }))
        }
      })
      this.setState({ sub })
    }
  }

  componentWillUnmount() {
    this.state.sub && this.state.sub.unsubscribe()
  }

  render() {
    const { width, height } = this.props
    return (
      <div style={{ width, height }}>
        {this.state.menuDepth > 0
          && <Menu
              onEnter={() => this.setState((s) => ({ menuDepth: s.menuDepth + 1 }))}
              notify={this.state.counter}
            />
        }
        <canvas ref={this.canvasRef} className={canvasStyle} width={width} height={height} />
      </div>
    )
  }
}

export default Canvas
