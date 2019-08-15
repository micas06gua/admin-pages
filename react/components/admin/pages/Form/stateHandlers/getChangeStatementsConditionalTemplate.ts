import { Statements } from 'pages'

import { State } from '../index'

export const getChangeStatementsConditionalTemplate = (
  uniqueId: number,
  statements: Statements[]
) => (prevState: State) => {
  const newPages = prevState.data.pages.map(page => {
    if (page.uniqueId === uniqueId) {
      return {
        ...page,
        condition: {
          ...page.condition,
          statements,
        },
      }
    }
    return page
  })

  return {
    ...prevState,
    data: {
      ...prevState.data,
      pages: newPages,
    },
    formErrors: {},
  }
}
