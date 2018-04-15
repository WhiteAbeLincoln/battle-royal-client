// @flow
import React from 'react'
import SocketComponent from '../Socket'
import type { ContextRouter } from 'react-router-dom'
import { API_URL } from '../index'
import { Subscribe } from 'unstated'
import { LoginContainer } from '../Login/login-state'
import Chat from './Chat'
import UserList from './UserList'
import Canvas from './Canvas'
import ContainerDimensions from 'react-container-dimensions'
import { css } from 'emotion'
import GameLanding from './GameLanding'

const messages: string[] = [ 'server_error'
                           , 'authenticated'
                           , 'new_chat_message'
                           , 'update_users'
                           ]

const outerStyle = css`
  display: flex;
  flex-flow: row nowrap;
  height: 100%;
`

const innerStyle = css`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  margin: 5px;
`

const Game = ({ location }: ContextRouter) => {
  const url: void | string = (location.state && location.state.url)
  if (!url) {
    return <GameLanding />
  }
  return (
  <Subscribe to={[LoginContainer]}>
    {login => (
    <SocketComponent
      url={url}
      auth={login.state.token}
      listeners={messages}>
      {({ data, error, socket, loading, emit }) => {
        const { new_chat_message: message
              , update_users: newUser } = data
        if (error) {
          return (<pre>{JSON.stringify(error)}</pre>)
        }
        if (loading) {
          return (<p>Waiting for connection</p>)
        }
        return (
        <div className={outerStyle}>
          <UserList users={newUser} />
          <div className={innerStyle}>
            <div style={{width: '100%', height: '100%', display: 'flex'}}>
              <ContainerDimensions>
                <Canvas socket={socket} />
              </ContainerDimensions>
            </div>
            <Chat
              message={message}
              onSubmit={data => emit(data.key)(data)}
              user={login.state.user}
            />
          </div>
        </div>)
      }}
    </SocketComponent>)}
  </Subscribe>)
}

export default Game
