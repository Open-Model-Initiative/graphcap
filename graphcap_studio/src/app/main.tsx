import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider } from '@/components/ui/theme/ThemeProvider'

// Import styles
import './index.css'

// Import the generated route tree
import { routeTree } from '../routeTree.gen'
import App from './App'
import { AppContextProvider, useFeatureFlag } from '@/context'
import { getQueryClient } from '@/utils/queryClient'

// Create a new router instance
const router = createRouter({ routeTree })

// Create Query Client
const queryClient = getQueryClient()

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

/**
 * DevTools wrapper component that conditionally renders dev tools based on feature flags
 */
function DevTools() {
  const showReactQueryDevTools = useFeatureFlag('enableReactQueryDevTools');
  
  return showReactQueryDevTools ? <ReactQueryDevtools /> : null;
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <Provider>
        <QueryClientProvider client={queryClient}>
          <App>
            <AppContextProvider>
              <RouterProvider router={router} />
              <DevTools />
            </AppContextProvider>
          </App>
        </QueryClientProvider>
      </Provider>
    </StrictMode>,
  )
}
