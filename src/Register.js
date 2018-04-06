// @flow
import React from 'react'
import { Form, Field } from 'react-final-form'
import { API_URL } from './index'
import { BigHeader, InputGroup, ErrorItem, RaisedButton, Spinner } from './Components'
import { inputGroupItem, inputGroupField } from './Components/css/Form'
import { button } from './Components/css/Typography'
import type { RouterHistory } from 'react-router-dom'
import { withRouter } from 'react-router-dom'
import { css } from 'emotion'

type UserData = {
  name?: string,
  gamertag: string,
  password: string,
}

type RegisterFormProps = {
  onSubmit: (data: UserData) => Promise<void>
}

const simpleMemoize = fn => {
  let lastArg
  let lastResult
  return arg => {
    if (!lastArg || arg !== lastArg) {
      lastArg = arg
      lastResult = fn(arg)
    }
    return lastResult
  }
}

const nameAvailable = simpleMemoize(async value => {
  if (!value) {
    return 'Required'
  }

  const res = await fetch(API_URL + `/users/${value}`)
  if (res.ok) return 'Username Taken'
  if (res.status !== 404) return 'Unknown error'
})

const padded = css`
  margin: 5px;
`

const horizontal = css`
  display: flex;
  flex-flow: row nowrap;
`

type Validator = any => ?string

const required = value => (value ? undefined : 'Required')
const minLength = length => (value: string) => value.length >= length ? undefined : `Minimum length ${length}`
const composeValidators = (...validators: Validator[]) => value => validators.reduce((err, validator) => err || validator(value), undefined)

const RegisterForm = (props: RegisterFormProps) => (
  <Form
    onSubmit={props.onSubmit}
    render={
      ({ handleSubmit
       , reset
       , submitting
       , pristine
       , validating
       , values }) => (
          <form onSubmit={handleSubmit}>
            <Field name="gamertag" validate={nameAvailable}>
              {({ input, meta }) => (
                <InputGroup>
                  <label className={inputGroupItem}>Username</label>
                  <input className={inputGroupField} {...input} type="text" placeholder="Username" />
                  {meta.error && meta.touched && <ErrorItem>{meta.error}</ErrorItem>}
                </InputGroup>
              )}
            </Field>
            <Field name="name">
              {({ input }) => (
                <InputGroup>
                  <label className={inputGroupItem}>Name</label>
                  <input className={inputGroupField} {...input} type="text" placeholder="Name" />
                </InputGroup>
              )}
            </Field>
            <Field name="password" validate={composeValidators(required, minLength(8))}>
              {({ input, meta }) => (
                <InputGroup>
                  <label className={inputGroupItem}>Password</label>
                  <input className={inputGroupField} {...input} type="text" placeholder="Password" />
                  {meta.error && meta.touched && <ErrorItem>{meta.error}</ErrorItem>}
                </InputGroup>
              )}
            </Field>
            <div className={horizontal}>
            <RaisedButton className={button} type="submit" disabled={submitting}> Submit </RaisedButton>
            {validating && <Spinner className={padded} size={20} />}
            </div>
          </form>
      )}
  />
)

const registerUser = (history: RouterHistory) => (user: UserData) => {
  return fetch(API_URL + '/users',
              { body: JSON.stringify(user)
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
                console.log('Register Success: ', res)
                history.push('/')
              })
              .catch(err => {
                console.error('Register Error: ', err)
              })
}

const Register = withRouter(({ history }) => {
  return (
    <div style={{maxWidth: 500}}>
      <BigHeader color="#333">Register</BigHeader>
      <RegisterForm onSubmit={registerUser(history)} registerUser/>
    </div>
  )
})

export default Register
