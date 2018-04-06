// @flow
import React, { Component } from 'react'
import SocketComponent from '../Socket'
import { API_URL } from '../index'
import { Subscribe } from 'unstated'
import { LoginContainer } from '../Login/login-state'
import Chat from './Chat'
import UserList from './UserList'
import Canvas from './Canvas'
import { css } from 'emotion'

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

const Game = () => (
  <Subscribe to={[LoginContainer]}>
    {login => (
    <SocketComponent
      url={API_URL}
      auth={login.state.token}
      listeners={messages}>
      {({ data, error, socket, loading }) => {
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
            <Canvas socket={socket} />
            <Chat message={message} socket={socket} user={login.state.user} />
          </div>
        </div>)
      }}
    </SocketComponent>)}
  </Subscribe>
)

export default Game
