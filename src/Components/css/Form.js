import { css } from 'emotion'
import { caption, body1 } from './Typography'

const sharedInputGroup = css`
  border: 1px solid rgba(147, 128, 108, 0.25);
  padding: 0.5em 0.75em;
  &:first-child {
    border-radius: 2px 0 0 2px;
  }

  &:last-child {
    border-radius: 0 2px 2px 0;
  }
`

export const inputGroupField = css`
  ${sharedInputGroup}
  flex: 1;
  &:not(:last-child) {
    border-right: 0;
  }

  &:not(:first-child) {
    border-left: 0;
  }
`

export const inputGroupItem = css`
  ${sharedInputGroup}
  ${body1}
  background-color: rgba(147, 128, 108, 0.1);
  color: #666;
`

export const inputGroupItemError = css`
  ${inputGroupItem}
  ${caption}
  color: red;
  font-size: inherit;
`
