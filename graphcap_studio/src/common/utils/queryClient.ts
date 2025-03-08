import { QueryClient, QueryCache } from '@tanstack/react-query'
import { cache } from 'react'
import { errorToast } from './toast'

const makeQueryClient = () => new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.log(error);
      if (query.meta?.errorMessage) {
        errorToast(query.meta.errorMessage as string);
      } else {
        errorToast(`An error occurred: ${error.message}`);
      }
    },
  }),
  defaultOptions: {
    queries: {
      // With SSR, we usually want to set some default staleTime
      // above 0 to avoid refetching immediately on the client
      staleTime: 60 * 1000,
    },
  },
})

export const getQueryClient = cache(() => makeQueryClient())