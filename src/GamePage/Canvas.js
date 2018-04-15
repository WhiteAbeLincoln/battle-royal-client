// @flow
import React, { Component } from 'react'
import { css } from 'emotion'
import type { Socket } from 'socket.io-client'
import fscreen from 'fscreen'
import { render, convertDim, getMapArea } from '../Game/Render'
import { getState } from '../Game/Game'
import { clickCoordinates$ } from '../Game/Actions'

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

    // render(clock$, elem)

    if (this.props.socket) {
      const { map$, state$ } = getState(this.props.socket, elem)
      if (elem) {
        clickCoordinates$(elem)
          .combineLatest(map$)
          .subscribe(([pos, map]) => {
            const bounds = getMapArea(map, elem.width, elem.height)

            if (pos.x < bounds.width && pos.y < bounds.height) {
              const x = convertDim(pos.x, 0, bounds.width, 0, map.width)
              const y = convertDim(pos.y, 0, bounds.height, 0, map.height)
              this.props.socket && this.props.socket.emit('set_spawn', { x, y })
            }
          })
      }

      state$.subscribe(render(elem))
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
