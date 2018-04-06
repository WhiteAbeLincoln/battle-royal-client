// @flow
import { Container } from 'unstated'
import type { UserInfo } from '../User/User'

const USER_KEY = 'br-user'
const TOKEN_KEY = 'br-token'

type LoginState = {
  loggedIn: boolean,
  token?: string,
  user?: UserInfo
};

const getLoginState = () => {
  return { token: localStorage.getItem(TOKEN_KEY)
         , user: JSON.parse(localStorage.getItem(USER_KEY) || 'null') }
}

export class LoginContainer extends Container<LoginState> {
  state = {
    loggedIn: false
  };

  constructor() {
    super()

    const { token, user } = getLoginState()
    if (token && user) {
      this.state = { loggedIn: true
                   , token
                   , user }
    }
  }

  login = (token: string, user: any) => {
    console.log(token, user)
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    this.setState({ token
                  , user
                  , loggedIn: true })
  }

  logout = (cb: () => void) => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    this.setState({ token: undefined
                  , user: undefined
                  , loggedIn: false })
    cb()
  }
}

export default LoginContainer
