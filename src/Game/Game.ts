// @flow
import { animation$, updateMap$, newSpawn$, startGame$ } from './Actions'
import * as io from 'socket.io-client'
import { State } from './State'
import fscreen from 'fscreen'
import 'rxjs/add/operator/bufferCount'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/scan'
import { Observable } from 'rxjs'

/**
  A observer for time elapsed between animation frames
 */
export const clock$ = animation$
                        .bufferCount(2, 1)
                        .map(([prev, current]) => current - prev)

export const getState = (socket: SocketIOClient.Socket, canvas: HTMLCanvasElement) => {
  const map$ = updateMap$(socket)
  const spawns$ = newSpawn$(socket)
                  .scan((acc, curr) => ({ ...acc, ...curr }), {})
                  .map(s => {
                    const arr = []
                    for (const p of Object.keys(s)) {
                      arr.push(s[p])
                    }
                    return arr
                  }).startWith([{ x: 0, y: 0 }])

  const start$ = startGame$(socket).startWith(false)

  start$.subscribe(started => {
    console.log('Game start: ', started)
    if (started) {
      // fscreen.requestFullscreen(canvas)
    }
  })

  const ratio = 16 / 9
  // Window has 16:9 ratio and is 15 meters wide
  const window = { width: 15, height: 15 * (1 / ratio) }

  const state$: Observable<State> = clock$.withLatestFrom(map$, spawns$, start$, (elapsed, map, spawns, started) => ({
      elapsedTime: elapsed
    , spawns
    , map
    , started
    , window
  }))

  return { map$
         , spawns$
         , state$ }
}
