import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'unstated'
import { LoginContainer } from './Login/login-state'
import { normalize } from 'polished'
import { injectGlobal } from 'emotion'

let addProtocol = (process.env.REACT_APP_API_SERVER || '').indexOf('http') < 0

export const API_URL: string = process.env.REACT_APP_API_SERVER
                             ? (addProtocol
                               ? 'http://' + process.env.REACT_APP_API_SERVER
                               : process.env.REACT_APP_API_SERVER)
                             : 'http://localhost:3000'

injectGlobal`${normalize()}`

const login = new LoginContainer()
ReactDOM.render((<Router>
                  <Provider inject={[login]}>
                    <App />
                  </Provider>
                </Router>), document.getElementById('root'))
