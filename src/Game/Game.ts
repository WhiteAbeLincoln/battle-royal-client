// @flow
import { animation$, updateMap$, newSpawn$, startGame$, input$, Input, chatFocused$, GameInput, UIInput } from './Actions'
import * as io from 'socket.io-client'
import { State } from './models/State'
import fscreen from 'fscreen'
import 'rxjs/add/operator/bufferCount'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/scan'
import { Observable } from 'rxjs'

/**
 * An observable for time elapsed between animation frames
 */
export const clock$ = animation$
                        .bufferCount(2, 1)
                        .map(([prev, current]) => current - prev)

export const getState = (socket: SocketIOClient.Socket, canvas: HTMLCanvasElement, menuOpen$: Observable<boolean>) => {
  const map$ = updateMap$(socket)
  const spawns$ = newSpawn$(socket)
                  .scan((acc, curr) => ({ ...acc, ...curr }), {})
                  .map(s => Object.keys(s).map(k => s[k]))
                  .startWith([{ x: 0, y: 0 }])

  const start$ = startGame$(socket).startWith(false)

  const chat$ = chatFocused$(document.getElementById('chatBar') as HTMLInputElement)

  const inputt$ = input$(window as any)

  /**
   * A listener for input events that emits when the chat is not focused
   */
  const pauseInput$ = chat$.switchMap(chat => chat ? Observable.never<Input>() : inputt$)

  /**
   * A listener for ui input events that emits when the chat is not focused
   */
  const uiInput$ = pauseInput$.filter((v): v is UIInput => v === 'Menu' || v === 'Fullscreen' || v === 'Map')

  /**
   * A listener for game input events that emits when the game is started, the chat is not focused, and the menu is not open
   */
  const gameInput$ = start$.combineLatest(menuOpen$, chat$)
                           .switchMap(([started, menu, chat]) => started && !menu && !chat ? inputt$ : Observable.never<Input>())
                           .filter((v): v is GameInput => v !== 'Menu' && v !== 'Fullscreen' && v !== 'Map')

  const ratio = 16 / 9
  // Window has 16:9 ratio and is 15 meters wide
  /**
   * A viewport in world units
   */
  const viewport = { width: 15, height: 15 * (1 / ratio) }

  const state$: Observable<State> =
    clock$.withLatestFrom(map$, spawns$, start$,
            (elapsed, map, spawns, started) => ({
              elapsedTime: elapsed
            , spawns
            , map
            , started
            , viewport
            }))

  return { map$
         , spawns$
         , state$
         , start$
         , input$: pauseInput$
         , gameInput$
         , uiInput$
         }
}
