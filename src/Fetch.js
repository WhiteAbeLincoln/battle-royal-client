// @flow

import { Component } from 'react'

type Props<T> = {
  url: string,
  render: (result: { data?: T, error?: any }) => React$Element<*>
};

type State<T> = {
  data?: T,
  error?: any
}

export class Fetch<T> extends Component<Props<T>, State<T>> {
  constructor(props: Props<T>) {
    super(props)

    this.state = { }
  }

  componentDidMount() {
    fetch(this.props.url).then(response => {
                           const data = response.json()
                           if (!response.ok) {
                             return data.then(err => { throw err })
                           }
                           return data
                         })
                         .then(res => {
                           this.setState({ data: res })
                         })
                         .catch(err => {
                           this.setState({ error: err, data: undefined })
                         })
  }

  render() {
    return this.props.render(this.state)
  }
}

export default Fetch
