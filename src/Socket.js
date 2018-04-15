// @flow
import { Component } from 'react'
import io from 'socket.io-client'
import type { Socket, LookupOptions } from 'socket.io-client'

type SocketResult = { loading: boolean
                    , socket: ?Socket
                    , data: { [key: string]: any }
                    , error: string
                    , emit: (key: string) => (...data: any[]) => Promise<void>
                    }

type Props = {
  url?: string,
  options?: LookupOptions,
  listeners: string[],
  auth?: string,
  children: (result: SocketResult) => React$Element<*>
}

type State = {
  socket: ?Socket,
  connected: boolean,
  authenticated: boolean,
  data: { [messagekey: string]: any },
  error: any,
}

const defaultListeners = [ 'connect'
                        //  , 'connect_error'
                        //  , 'connect_timeout'
                         , 'error'
                         , 'disconnect'
                         , 'authenticated'
                        //  , 'reconnect'
                        //  , 'reconnect_attempt'
                        //  , 'reconnecting'
                        //  , 'reconnect_error'
                        //  , 'reconnect_failed'
                         ]

const addListeners = (socket: Socket) => (messages, handler) => {
  messages.forEach(m => {
    socket.on(m, handler(m))
  })

  for (const def of defaultListeners) {
    if (!messages.includes(def)) {
      socket.on(def, handler(def))
    }
  }

  return socket
}

const createSocket = (url?: string, options?: LookupOptions) => {
  const socket = io(url, options)
  return addListeners(socket)
}

export class SocketComponent extends Component<Props, State> {
  state = { connected: false
          , data: {}
          , socket: null
          , error: null
          , authenticated: false }

  handler = (message: string) => (data: any) => {
    if (message === 'connect' || message === 'reconnect') {
      if (this.props.auth && this.state.socket) {
        this.state.socket.emit('authenticate', this.props.auth)
      }
      this.setState({ connected: true })
    } else if (message === 'authenticated') {
      this.setState({ authenticated: true })
    } else if (message === 'disconnect') {
      this.setState({ connected: false })
    } else if (message === 'error' || message === 'connect_error') {
      this.setState({ error: data })
    } else {
      this.setState({ error: null })
    }

    if (typeof data === 'string') {
      try {
        // const old = data
        data = JSON.parse(data)
      } catch (e) {
        // do nothing
      }
    }

    this.setState((s, p) => ({ ...s, data: { ...s.data, [message]: data } }))
  }

  emit = (key: string) => (...data: any[]): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (this.state.socket) {
        this.state.socket.emit(key, ...data, (data: any) => {
          resolve(data)
        })
      } else {
        reject(data)
      }
    })
  }

  componentDidMount() {
    const socket = createSocket(this.props.url
                              , this.props.options)(this.props.listeners, this.handler)
    this.setState({ socket })
  }

  componentWillUnmount() {
    this.state.socket && this.state.socket.close()
  }

  componentWillReceiveProps(nextProps: Props) {
    let newUrl = this.props.url
    let newOptions = this.props.options

    if (nextProps.url && this.props.url !== nextProps.url) {
      newUrl = nextProps.url
    }

    if (nextProps.options && JSON.stringify(this.props.options) !== JSON.stringify(nextProps.options)) {
      newOptions = nextProps.options
    }

    if (newUrl !== this.props.url || newOptions !== this.props.options) {
      this.state.socket && this.state.socket.close()
      const socket = createSocket(newUrl
                                , newOptions)(this.props.listeners, this.handler)
      this.setState(() => ({ socket }))
    }

    if (nextProps.listeners && this.state.socket) {
      this.state.socket.off()
      this.state.socket && addListeners(this.state.socket)
    }
  }

  render() {
    return this.props.children({ loading: !this.state.connected
                               , authenticated: this.state.authenticated
                               , socket: this.state.socket
                               , data: this.state.data
                               , emit: this.emit
                               , error: '' })
  }
}

export default SocketComponent
