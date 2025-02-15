import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Import styles
import './index.css'
import './App.css'

// Import the generated route tree
import { routeTree } from '../routeTree.gen'
import App from './App'

// Create a new router instance
const router = createRouter({ routeTree })

// Create Query Client
const queryClient = new QueryClient()

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App>
          <RouterProvider router={router} />
          {/* <ReactQueryDevtools /> */}
        </App>
      </QueryClientProvider>
    </StrictMode>,
  )
}
