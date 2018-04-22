
declare module 'react-chips' {
  import { Component } from 'react'

  type ChipProps = {
    value: any[]
    onChange: (chips: any[]) => void
    placeholder?: string
    theme?: any
    suggestions?: any[]
    // fetchSuggestions
    // fetchSuggestionsThrushold
    fromSuggestionsOnly?: boolean
    uniqueChips?: boolean
    renderChip?: (chip: any) => JSX.Element
    suggestionsFilter?: (auto: any, chip: any) => boolean
    getChipValue?: (chip: any) => any
    createChipKeys?: Array<string | number>
    getSuggestionValue?: (suggestion: any) => any
    renderSuggestion?: (suggestion: any, args: { query: string, isHighlighted: boolean }) => JSX.Element
    shouldRenderSuggestions?: (suggestion: any) => boolean
    alwaysRenderSuggestions?: boolean
    highlightFirstSuggestion?: boolean
    focusInputOnSuggestionClick?: boolean
    multiSelection?: boolean
    renderSectionTitle?: (section: any) => string | JSX.Element
    getSectionSuggestions?: (section: any) => string | JSX.Element
  }

  class Chips extends Component<ChipProps> {}
  export default Chips
}

