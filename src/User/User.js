// @flow
import React from 'react'
import type { ContextRouter } from 'react-router-dom'
import { Fetch } from '../Fetch'
import { API_URL } from '..'
import { BigHeader } from '../Components'

export type UserInfo = {
  gamertag: string,
  creationDate: string,
  name?: string,
};

export const User = ({ match }: ContextRouter) => (
  match.params.tag && <Fetch
    url={`${API_URL}/users/${match.params.tag}`}
    render={({ data, error }: { data?: UserInfo, error?: any }) => (
    <div>
      {data
      ? (<div>
          <BigHeader color="#333">{data.gamertag}</BigHeader>
          {data.name && <p>{data.name}</p>}
          <p>Joined: {data.creationDate}</p>
        </div>)
      : <p>No data for user {match.params.tag}</p>}
      {error && (<div>
        {error.name && <pre>{error.name}</pre>}
        {error.stack && <pre>{error.stack}</pre>}
      </div>)}
    </div>
  )} />
)

export default User
