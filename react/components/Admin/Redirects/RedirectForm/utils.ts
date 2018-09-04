import { DataProxy } from 'apollo-cache'

import Redirects from '../../../../queries/Redirects.graphql'
import { PAGINATION_START, PAGINATION_STEP } from '../consts'

import { MutationResult, QueryData, RedirectsQuery } from './typings'

const cacheAccessParameters = {
  query: Redirects,
  variables: {
    from: PAGINATION_START,
    to: PAGINATION_START + PAGINATION_STEP,
  },
}

export const getStoreUpdater = (operation: 'delete' | 'save') => (
  store: DataProxy,
  result: MutationResult,
) => {
  const deleteRedirect = result.data && result.data.deleteRedirect
  const saveRedirect = result.data && result.data.saveRedirect

  const isDelete = operation === 'delete'

  try {
    const queryData = readRedirectsFromStore(store)

    if (queryData) {
      const newRedirects = isDelete
        ? (deleteRedirect &&
            queryData.redirects.redirects.filter(
              redirect => redirect.id !== deleteRedirect.id,
            )) ||
          queryData.redirects.redirects
        : (saveRedirect &&
            queryData.redirects.redirects.concat(saveRedirect)) ||
          queryData.redirects.redirects

      const newTotal = isDelete
        ? queryData.redirects.total - 1
        : queryData.redirects.total + 1

      const newData = {
        ...queryData,
        redirects: {
          ...queryData.redirects,
          redirects: newRedirects,
          total: newTotal,
        },
      }

      writeRedirectsToStore(newData, store)
    }
  } catch (err) {
    console.log('No cache found for "Redirects".')
  }
}

const readRedirectsFromStore = (store: DataProxy): QueryData =>
  store.readQuery(cacheAccessParameters)

const writeRedirectsToStore = (newData: RedirectsQuery, store: DataProxy) => {
  store.writeQuery({
    data: newData,
    ...cacheAccessParameters,
  })
}