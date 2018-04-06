// @flow
import { css, keyframes } from 'emotion'
import styled from 'react-emotion'
import { display3, button } from './css/Typography'
import { Link } from 'react-router-dom'
import { inputGroupItemError } from './css/Form'
import { transparentize, opacify, readableColor } from 'polished'
import { IndigoPalette, shadow } from './css/Palette'

export const BigHeader = styled('h1')`
  ${display3}
  color: ${props => props.color || 'white'};
`

export const InputGroup = styled('div')`
  display: flex;
  margin-bottom: 1.5em;
`

export const ErrorItem = styled('span')`
  ${inputGroupItemError}
`

const buttonStyles = css`
  ${button}
  height: 36px;
  min-width: 88px;
  border-radius: 2px;
  padding-right: 8px;
  padding-left: 8px;
  margin-right: 8px;
  margin-left: 8px;
  border: none;
  background-color: rgba(0,0,0,0);
  cursor: pointer;
  &:hover:enabled {
    background-color: ${transparentize(0.75, '#ccc')}
  }
`

const raisedButtonStyles = (props) => css`
  ${buttonStyles}
  color: ${readableColor(props.color || IndigoPalette['500'])};
  &:disabled {
    color: ${transparentize(0.74, '#000')};
    background-color: ${transparentize(0.88, '#000')};
  }
  background-color: ${props.color || IndigoPalette['500']};
  &:hover:enabled {
    box-shadow: ${shadow(1)};
    background-color: ${opacify(0.12, props.color || IndigoPalette['500'])};
  }
`

export const RaisedButton = styled('button')`
  ${props => raisedButtonStyles(props)}
`

export const LinkButton = styled(Link)`
  ${buttonStyles}
  &:hover {
    background-color: ${transparentize(0.75, '#ccc')}
  }
  color: ${props => props.color || !props.dark ? '#fff' : '#212121'};
  display: block;
  text-align: center;
  line-height: 36px;
  text-decoration: none;
  background: none;
  cursor: pointer;
  border: none;
`

export const Button = styled('button')`
  ${buttonStyles}
  color: ${props => props.color || !props.dark ? '#fff' : '#212121'};
`

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const proportion = (num: number) => Math.floor(0.133 * num) * (num < 60 ? 2 : 1)

export const Spinner = styled('div')`
  border: ${props => props.size ? proportion(props.size) : 16}px solid #888;
  border-top: ${props => props.size ? proportion(props.size) : 16}px solid ${IndigoPalette['500']};
  border-radius: 50%;
  width: ${props => props.size ? props.size + 'px' : '120px'};
  height: ${props => props.size ? props.size + 'px' : '120px'};
  animation: ${rotate} 2s linear infinite;
`
