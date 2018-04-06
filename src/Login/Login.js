// @flow
import React, { Component } from 'react'
import { API_URL } from '../index'
import { Subscribe } from 'unstated'
import { LoginContainer } from './login-state'
import { Redirect } from 'react-router-dom'
import type { ContextRouter } from 'react-router-dom'
import { BigHeader, InputGroup, RaisedButton } from '../Components'
import { inputGroupItem, inputGroupField } from '../Components/css/Form'

type LoginFormState = {
  gamertag: string,
  password: string,
  canSubmit: boolean,
};

type Field = 'gamertag' | 'password';

type LoginFormProps = {
  error?: any,
  onSubmit: (un: string, pw: string) => void
}

class LoginForm extends Component<LoginFormProps, LoginFormState> {
  constructor(props: LoginFormProps) {
    super(props)

    this.state = { gamertag: ''
                 , password: ''
                 , canSubmit: false }
  }

  validateForm = (state: LoginFormState) => {
    if (state.gamertag === '' || state.password === '') {
      this.setState({canSubmit: false})
    } else {
      this.setState({canSubmit: true})
    }
  }

  handleChange = (name: Field) => (event: SyntheticEvent<HTMLInputElement>) => {
      this.validateForm({ ...this.state, [name]: event.currentTarget.value })
      this.setState({[name]: event.currentTarget.value})
  }

  render() {
    return (<form>
      <InputGroup>
        <label className={inputGroupItem}>Username</label>
        <input
          type="text"
          name="username"
          className={inputGroupField}
          value={this.state.gamertag}
          placeholder="Username"
          onChange={this.handleChange('gamertag')}
        />
      </InputGroup>
      <InputGroup>
        <label className={inputGroupItem}>Password</label>
        <input
          type="password"
          name="password"
          className={inputGroupField}
          value={this.state.password}
          placeholder="Password"
          onChange={this.handleChange('password')}
        />
      </InputGroup>
      { this.props.error ? <pre>{this.props.error.message}</pre> : null }
      <RaisedButton
        type="button"
        disabled={!this.state.canSubmit}
        onClick={() => this.props.onSubmit(this.state.gamertag, this.state.password)}
      >
        Log in
      </RaisedButton>
    </form>)
  }
}

type State = {
  redirectToReferrer: boolean,
  error?: any
};

class Login extends Component<ContextRouter, State> {
  constructor(props: ContextRouter) {
    super(props)
    this.state = { redirectToReferrer: false
                 , error: null }
  }

  login = (cb: (t: string, u: any) => void) => (un: string, pw: string) => {
    fetch(API_URL + '/login',
          { body: JSON.stringify({ gamertag: un, password: pw })
          // , credentials: 'include'
          , mode: 'cors'
          , method: 'POST'
          , headers: { 'content-type': 'application/json' }
          })
          .then(response => {
            const data = response.json()
            if (!response.ok) {
              return data.then(err => { throw err })
            }
            return data
          })
          .then(res => {
            if (res.token && res.user) {
              cb(res.token, res.user)
              this.setState({ redirectToReferrer: true })
              return
            }
            throw new Error('Unknown server error when logging in. Please try again')
          })
          .catch(err => {
            console.error('Login Error: ', err)
            this.setState({ error: err })
          })
  }

  render() {
    const { from } = this.props.location.state || { from: { pathname: '/' } }
    const { redirectToReferrer } = this.state

    if (redirectToReferrer) {
      return (<Redirect to={from} />)
    }

    return (<Subscribe to={[LoginContainer]}>
      {login => (
        <div style={{maxWidth: 500}}>
          <BigHeader color="#333">Login</BigHeader>
          <LoginForm onSubmit={this.login(login.login)} error={this.state.error}/>
        </div>
      )}
    </Subscribe>)
  }
}

export default Login
