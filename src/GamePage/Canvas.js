import React, { Component } from 'react'
import { css } from 'emotion'
import type { Socket } from 'socket.io-client'
import { Game } from '../Game'

const canvasStyle = css`
  background-color: cornflowerblue;
`

export type Props = {
  width?: number,
  height?: number,
  socket: ?Socket
}

export class Canvas extends Component<Props> {
  canvasRef = (React: any).createRef()

  componentDidMount() {
    // here we set up standard canvas methods
    const elem: HTMLCanvasElement = this.canvasRef.current

    if (this.props.socket) {
      const game = new Game(elem, this.props.socket)
      game.start()
    }
  }

  render() {
    const { width, height } = this.props
    return (
      <canvas ref={this.canvasRef} className={canvasStyle} width={width} height={height} />
    )
  }
}

export default Canvas
