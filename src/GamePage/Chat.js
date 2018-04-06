// @flow
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { InputGroup, RaisedButton } from '../Components'
import { inputGroupField, inputGroupItem } from '../Components/css/Form'
import { IndigoPalette } from '../Components/css/Palette'
import { css, cx } from 'emotion'
import { readableColor } from 'polished'
import type { Socket } from 'socket.io-client'
import type { UserInfo } from '../User/User'

const buttonStyle = css`
  margin-left: 0;
  background-color: ${IndigoPalette['300']};
  color: ${readableColor(IndigoPalette['300'])};
`

const groupStyle = css`
  margin-bottom: 0;
`

type ChatBarState = {
  message: string
}

type ChatBarProps = {
  onSubmit: string => void
}

export class ChatBar extends Component<ChatBarProps, ChatBarState> {
  state = {
    message: ''
  }

  sendMessage = (message: string) => {
    this.props.onSubmit(message)
    this.setState({ message: '' })
  }

  handleChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({message: event.currentTarget.value})
  }

  handleSubmit = (ev: SyntheticEvent<*>) => {
    ev.preventDefault()
    ev.stopPropagation()
    if (this.state.message !== '') {
      this.sendMessage(this.state.message)
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <InputGroup className={groupStyle}>
          <input
            className={inputGroupField}
            type="text"
            value={this.state.message}
            onChange={this.handleChange}
          />
          <RaisedButton
            type="submit"
            color={IndigoPalette['300']}
            className={cx(inputGroupItem, buttonStyle)}
          >Send</RaisedButton>
        </InputGroup>
      </form>
    )
  }
}

type ChatMessage = {
  from: string,
  data: string
};

const chatListStyle = css`
  display: flex;
  flex-flow: column nowrap;
  border: 1px solid black;
  border-radius: 5px;
  height: 200px;
  padding: 5px;
  overflow-y: auto;
`

type ChatListProps = {
  messages: ChatMessage[]
}

class ChatList extends Component<ChatListProps> {
  divRef = null

  constructor(props: ChatListProps) {
    super(props)
    this.divRef = (React: any).createRef()
  }

  setDivRef = elem => {
    this.divRef = elem
  }

  componentDidUpdate() {
    if (this.divRef) {
      this.divRef.scrollTop = this.divRef.scrollHeight
    }
  }

  render() {
    const { messages } = this.props
    return (
    <div className={chatListStyle} ref={this.setDivRef}>
      {messages.map((m, i) => <span key={i}><Link to={`/user/${m.from}`}>{m.from}</Link>: {m.data}</span>)}
    </div>)
  }
}

type Props = {
  socket: ?Socket,
  user?: UserInfo,
  message?: ChatMessage
}

type State = {
  messages: ChatMessage[]
}

class Chat extends Component<Props, State> {
  state = {
    messages: []
  }

  onSubmit = (message: string) => {
    if (this.props.socket) {
      this.props.socket.emit('chat_message', JSON.stringify({ data: message }))
    }

    const from = (this.props.user && this.props.user.gamertag) || '<Anonymous>'
    this.setState((s, p) => ({ messages: [...s.messages, { from, data: message }] }))
  }

  componentWillReceiveProps(nextProps: Props) {
    const newMessage = nextProps.message
    const lastMessage = this.state.messages[this.state.messages.length - 1]

    if (newMessage && newMessage !== lastMessage) {
      this.setState((s) => ({ messages: [...s.messages, newMessage] }))
    }
  }

  render() {
    return (
      <div>
        <ChatList messages={this.state.messages} />
        <ChatBar onSubmit={this.onSubmit} />
      </div>
    )
  }
}

export default Chat
