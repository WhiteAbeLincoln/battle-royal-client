// @flow
import { animation$, updateMap$, newSpawn$, startGame$ } from './Actions'
import type { Socket } from 'socket.io-client'
import type { State } from './State'
import fscreen from 'fscreen'
import 'rxjs/add/operator/bufferCount'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/scan'

/**
  A observer for time elapsed between animation frames
 */
export const clock$ = animation$
                        .bufferCount(2, 1)
                        .map(([prev, current]) => current - prev)

export const getState = (socket: Socket, canvas: HTMLCanvasElement) => {
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
    if (started && !fscreen.fullscreenEnabled) {
      fscreen.requestFullscreen(canvas)
    }
  })

  const state$: rxjs$Observable<State> = clock$.withLatestFrom(map$, spawns$, (elapsed, map, spawns) => ({
      elapsedTime: elapsed
    , spawns
    , map
  }))

  return { map$
         , spawns$
         , state$ }
}
