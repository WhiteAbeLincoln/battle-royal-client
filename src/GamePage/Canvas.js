// @flow
import React, { Component } from 'react'
import { css } from 'emotion'
import type { Socket } from 'socket.io-client'
import fscreen from 'fscreen'

const canvasStyle = css`
  background-color: cornflowerblue;
  height: 100%;
`

export type Props = {
  width?: number,
  height?: number,
  socket: ?Socket
}

export class Canvas extends Component<Props> {
  canvasRef = null

  clickHandler = (ev: MouseEvent) => {
    if (this.canvasRef) {
      const rect = this.canvasRef.getBoundingClientRect()
      const x = ev.clientX - rect.left
      const y = ev.clientY - rect.top

      console.log(`x: ${x}, y: ${y}`)
      if (this.props.socket) {
        // TODO: convert this to game coordinates
        this.props.socket.emit('set_spawn_location', JSON.stringify({
          data: { x, y }
        }))
      }
    }
  }

  doubleClickHandler = (ev: MouseEvent) => {
    this.canvasRef && fscreen.requestFullscreen(this.canvasRef)
      // this.canvasRef && this.canvasRef.requestPointerLock()
  }

  setRef = (elem: HTMLCanvasElement | null) => {
    this.canvasRef = elem
    this.canvasRef && this.canvasRef.addEventListener('click', this.clickHandler, false)
    // TODO: this fires the click event. Change this to a key binding
    this.canvasRef && this.canvasRef.addEventListener('dblclick', this.doubleClickHandler, false)
  }

  render() {
    const { width, height } = this.props
    return (
      <div style={{height: '100%'}}>
        <canvas ref={this.setRef} className={canvasStyle} width={width} height={height} />
      </div>
    )
  }
}

export default Canvas
