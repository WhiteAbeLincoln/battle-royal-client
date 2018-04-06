// @flow
import React, { Component, Fragment } from 'react'
import { Route, Switch, withRouter } from 'react-router-dom'
import Login from '../Login'
import Register from '../Register'
import Home from '../Home'
import User from '../User/User'
import { Subscribe } from 'unstated'
import { LoginContainer } from '../Login/login-state'
import { PrivateRoute } from '../PrivateRoute'
import { LinkButton, Button, BigHeader } from '../Components'
import { display2 } from '../Components/css/Typography'
import { css } from 'emotion'
import Game from '../GamePage/GamePage'

const appHeader = css`
  background-color: #222;
  color: #fff;
  height: 56px;
  padding-left: 16px;
  padding-right: 16px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
`

const appNav = css`
  display: flex;
  flex-flow: row nowrap;
`

const appBody = css`
  height: calc(100vh - (56px + 20px));
  padding: 10px;
`

const AuthButton = withRouter(({ history }) => (
  <Subscribe to={[LoginContainer]}>
    {login => (
      login.state.loggedIn
      ? <Button onClick={() => login.logout(() => history.push('/'))}>Log Out</Button>
      : <p> Not Logged In </p>
    )}
  </Subscribe>
))

class App extends Component<{}> {
  render() {
    return (
      <Subscribe to={[LoginContainer]}>
        {login => (<div>
          <header className={appHeader}>
            <h1 className={display2}>Battle Royale</h1>
            <nav className={appNav}>
              { login.state.loggedIn && login.state.user ? (
                <Fragment>
                <span><LinkButton to={`/user/${login.state.user.gamertag}`}>Me</LinkButton></span>
                <span><LinkButton to="/games">Games</LinkButton></span>
                <span><AuthButton /></span>
                </ Fragment>
              ) : (
                <Fragment>
                <span><LinkButton to="/login">Login</LinkButton></span>
                <span><LinkButton to="/register">Register</LinkButton></span>
                </ Fragment>
              ) }
            </nav>
          </header>
          <div className={appBody}>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/user/:tag" component={User} />
              <PrivateRoute visible={login.state.loggedIn} path="/games" component={Game} />
              <PrivateRoute visible={login.state.loggedIn} path="/game/:id" component={Game} />
              <Route component={() => (<BigHeader color="#333">404 Not Found</BigHeader>)} />
            </Switch>
          </div>
        </div>)}
      </Subscribe>
    )
  }
}

export default App
