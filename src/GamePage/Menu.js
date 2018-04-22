// @flow
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '..'
import { Fetch } from '../Fetch'
import { RaisedButton, BigHeader } from '../Components'
import { css } from 'emotion'
import { Controls } from './Controls'

type ChildProps = {
  setter: (path: string) => void
}

export const pageStyle = css`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: space-around;
  background-image: linear-gradient(
    rgba(0, 0, 0, 0.5),
    rgba(0, 0, 0, 0.5));
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10000;
  width: 100%;
  height: 100%;
  color: white;
`

const Root = ({ setter }: ChildProps) => (
  <div className={pageStyle}>
    <BigHeader>Menu</BigHeader>
    <RaisedButton onClick={() => setter('/controls')}>Controls</RaisedButton>
    <RaisedButton onClick={() => setter('/scores')}>Scores</RaisedButton>
    <RaisedButton onClick={() => setter('/credits')}>Credits</RaisedButton>
  </div>
)

const Credits = () => (
  <div className={pageStyle}>
    <BigHeader>Credits</BigHeader>
    <p>Created by Abraham White and Jeremiah Moore</p>
  </div>
)

type Score = {
  gamertag: string,
  score: number
}

const Scores = () => (
  <div className={pageStyle}>
    <BigHeader>High Scores</BigHeader>
    <Fetch
      url={`${API_URL}/scores`}
      render={({ data, error }: { data?: Score[], error: any }) => (
        <div>
          {error && <pre>{JSON.stringify(error, null, 4)}</pre>}
          {data && data.map((s, i) => (
            <p key={i}>
              <Link to={`/users/${s.gamertag}`}>{s.gamertag}</Link>
              - {s.score}
            </p>
          ))}
        </div>
      )}
    />
  </div>
)

type State = {
  path: string
}

type Props = {
  notify: number,
  onEnter: () => void
}

export class Menu extends Component<Props, State> {
  state: State = {
    path: '/'
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.notify !== this.props.notify) {
      this.setState({ path: '/' })
    }
  }

  setter = (path: string) => {
    this.props.onEnter()
    this.setState({ path })
  }

  render() {
    switch (this.state.path) {
      case '/': return <Root setter={this.setter} />
      case '/controls': return <Controls />
      case '/scores': return <Scores />
      case '/credits': return <Credits />
      default: return <p>Not Found</p>
    }
  }
}
