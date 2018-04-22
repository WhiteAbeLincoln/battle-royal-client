// @flow
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { InputGroup, RaisedButton } from '../Components'
import { inputGroupField, inputGroupItem } from '../Components/css/Form'
import { IndigoPalette } from '../Components/css/Palette'
import { css, cx } from 'emotion'
import { readableColor } from 'polished'
import type { UserInfo } from '../User/User'
import { tokenize } from '../util'

const buttonStyle = css`
  margin-left: 0;
  background-color: ${IndigoPalette['300']};
  color: ${readableColor(IndigoPalette['300'])};
`

const groupStyle = css`
  margin-bottom: 0;
`

type ChatBarState = {
  message: string,
  history: string[],
  position: number,
  temp: string
}

type ChatBarProps = {
  onSubmit: string => void
}

export class ChatBar extends Component<ChatBarProps, ChatBarState> {
  state: ChatBarState = {
    message: ''
  , history: []
  , position: 0
  , temp: ''
  }

  inputRef = (React: any).createRef()

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
      this.setState(s => ({ history: [...s.history, this.state.message], position: s.history.length + 1, temp: '' }))
    }
  }

  componentDidMount() {
    const elem: HTMLInputElement = this.inputRef.current
    elem.focus()
    elem.addEventListener('keypress', (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          this.setState(s => {
            let position = s.position - 1
            if (position < 0) position = 0
            const temp = s.position === this.state.history.length ? s.message : s.temp
            const value = this.state.history[position] || temp
            return { position
                   , message: value
                   , temp }
          })
          break
        case 'ArrowDown':
          this.setState(s => {
            let position = s.position + 1
            if (position > this.state.history.length) position = this.state.history.length
            const value = position === this.state.history.length
                        ? this.state.temp
                        : this.state.history[position]
            return { position
                   , message: value }
          })
          break
        default: // do nothing
      }
    })
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <InputGroup className={groupStyle}>
          <input
            id="chatBar"
            ref={this.inputRef}
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
  from?: string,
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
  divRef = (React: any).createRef()

  getSnapshotBeforeUpdate(prevProps, prevState) {
    if (prevProps.messages.length < this.props.messages.length) {
      return this.divRef.current.scrollHeight
    }

    return null
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      this.divRef.current.scrollTop += this.divRef.current.scrollHeight - snapshot
    }
  }

  render() {
    const { messages } = this.props
    return (
    <div className={chatListStyle} ref={this.divRef}>
      {messages.map((m, i) => (
        m.from
        ? (<pre style={{margin: 0}} key={i}><Link to={`/user/${m.from}`}>{m.from}</Link>: {m.data}</pre>)
        : (<pre style={{margin: 0, color: '#666'}} key={i}>{m.data}</pre>)
      ))}
    </div>)
  }
}

type Props = {
  user?: UserInfo,
  message?: ChatMessage,
  onSubmit: (res: { key: string, data?: any }) => Promise<any>
}

type State = {
  messages: ChatMessage[],
  mutes: Set<string>,
  lastRecieved?: ChatMessage
}

type CommandResponse = { local?: string, remote?: { key: string, data?: any } }

class Chat extends Component<Props, State> {
  state: State = {
    messages: []
  , mutes: (new Set(): Set<string>)
  }

  getCommand = (msg: string) => {
    if (msg.charAt(0) !== '\\') return null

    return tokenize(msg.substr(1))
  }

  handleCommand = (command: string[]): CommandResponse => {
    const commandHelp = (
      { 'help': '\tUsage: \\help [command]\n\tDisplays help for commands'
      , 'ready': '\tUsage: \\ready\n\tVote to start the game'
      , 'unready': '\tUsage: \\ready\n\tRemove vote to start the game'
      , 'kick': '\tUsage: \\kick <gamertag>\n\tVote to kick a player'
      , 'startpoll': '\tUsage: \\startpoll <name> [description] [responses]\n\tStart a poll. Responses is a space separated string of valid responses. Defaults to "yes no"'
      , 'stoppoll': '\tUsage: \\stoppoll <name>\n\tStops a poll. Only the user who started the ballot can stop it'
      , 'poll': '\tUsage: \\poll [name] \n\tList open polls. If name is specified, shows current responses for a single poll'
      , 'vote': '\tUsage: \\vote <poll> <response>\n\tSubmit vote for poll'
      , 'mute': '\tUsage: \\mute <gamertag>\n\tMute a player'
      , 'unmute': '\tUsage: \\unmute <gamertag>\n\tUnmute a player'
      })

    switch (command[0]) {
      case 'help': {
        let message
        if (command[1]) {
          message = commandHelp[command[1]] || 'Invalid Command'
        } else {
          message = Object.keys(commandHelp).map(k => `${k}\n${commandHelp[k]}`).join('\n')
        }

        return { local: message }
      }
      case 'ready': {
        return { local: `Voted to start game`, remote: { key: 'vote_start', data: true } }
      }
      case 'unready': {
        return { local: `Removed vote to start game`, remote: { key: 'vote_start', data: false } }
      }
      case 'kick': {
        if (command.length !== 2) return { local: 'invalid parameters\n' + commandHelp[command[0]] }
        return { local: `Voted to kick ${command[1]}`, remote: { key: 'vote_kick', data: command[1] } }
      }
      case 'mute': {
        if (command.length !== 2) return { local: 'invalid parameters\n' + commandHelp[command[0]] }
        this.setState((s, p) => ({ mutes: s.mutes.add(command[1]) }))

        return { local: `Muted ${command[1]}` }
      }
      case 'startpoll': {
        if (command.length < 2 || command.length > 4) return { local: 'invalid parameters\n' + commandHelp[command[0]] }
        const responses = command[3] && command[3].split(' ')
        return { remote: { key: 'poll_action', data: { kind: 'create', name: command[1], description: command[2], responses } } }
      }
      case 'stoppoll': {
        if (command.length !== 2) return { local: 'invalid parameters\n' + commandHelp[command[0]] }
        return { remote: { key: 'poll_action', data: { kind: 'close', name: command[1] } } }
      }
      case 'poll': {
        if (command.length > 2) return { local: `invalid parameters` }
        return { remote: { key: 'poll_action', data: { kind: 'query', name: command[1] } } }
      }
      case 'vote': {
        if (command.length !== 3) return { local: 'invalid parameters\n' + commandHelp[command[0]] }
        return { remote: { key: 'vote', data: { poll: command[1], response: command[2] } } }
      }
      case 'unmute': {
        if (command.length !== 2) return { local: 'invalid parameters\n' + commandHelp[command[0]] }
        this.setState((s, p) => {
          s.mutes.delete(command[1])
          return { mutes: s.mutes }
        })

        return { local: `Unmuted ${command[1]}` }
      }
      default:
        return { local: `command not found: ${command[0]}` }
    }
  }

  onSubmit = (message: string) => {
    const from = (this.props.user && this.props.user.gamertag) || '<Anonymous>'
    const command = this.getCommand(message)
    this.setState((s, p) => ({ messages: [...s.messages, { from, data: message }] }))

    if (command) {
      const msg = this.handleCommand(command)
      if (msg.local) {
        const data = msg.local
        this.setState((s, p) => ({ messages: [...s.messages, { data }] }))
      }
      if (msg.remote) {
        this.props.onSubmit(msg.remote)
      }
    } else {
      this.props.onSubmit({ key: 'chat_message', data: message })
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const newMessage = nextProps.message
    const lastMessage = this.state.lastRecieved

    if (newMessage && newMessage !== lastMessage) {
      if (!(newMessage.from && this.state.mutes.has(newMessage.from))) {
        this.setState((s) => ({ messages: [...s.messages, newMessage], lastRecieved: newMessage }))
      }
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
