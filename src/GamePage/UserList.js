// @flow
import React, { Component } from 'react'
import type { UserInfo } from '../User/User'
import { Link } from 'react-router-dom'
import { css } from 'emotion'

type Props = {
  users: UserInfo[]
}

const listStyle = css`
  display: flex;
  flex-flow: column nowrap;
  border: 1px solid black;
  margin: 5px;
  overflow-y: auto;
  overflow-x: none;
  min-width: 150px;
  align-items: center;
  padding: 5px;
`

class UserList extends Component<Props> {
  render() {
    const users = this.props.users || []
    return (
      <div className={listStyle}>
        {users.map((u, i) => <Link key={i} to={`/user/${u.gamertag}`}>{u.gamertag}</Link>)}
      </div>
    )
  }
}

export default UserList
