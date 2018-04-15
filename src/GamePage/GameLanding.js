import React, { Component } from 'react'
import { InputGroup, RaisedButton } from '../Components'
import { inputGroupField, inputGroupItem } from '../Components/css/Form'
import { API_URL } from '../index'
import { Redirect } from 'react-router-dom'

type State = {
  url: string,
  go: boolean
}

export class GameLanding extends Component<{}, State> {
  state = { url: API_URL
          , go: false };

  handleChange = (event: SytheticEvent<HTMLInputEvent>) => {
    this.setState({ url: event.currentTarget.value })
  }

  handleSubmit = (ev: SyntheticEvent<*>) => {
    ev.preventDefault()
    ev.stopPropagation()
    if (this.state.url !== '') {
      this.setState({ go: true })
    }
  }

  render() {
    if (this.state.go) {
      return (<Redirect to={{ pathname: '/game', state: { url: this.state.url } }} />)
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <InputGroup>
          <label className={inputGroupItem}>Server URL</label>
          <input
            type="url"
            className={inputGroupField}
            value={this.state.url}
            onChange={this.handleChange}
          />
          <RaisedButton
            type="submit"
          >Go</RaisedButton>
        </InputGroup>
      </form>
    )
  }
}

export default GameLanding
