import React from 'react'
import { Route, Redirect } from 'react-router-dom'

export const PrivateRoute = ({ visible, component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    visible
    ? <Component {...props} />
    : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
  )} />
)
