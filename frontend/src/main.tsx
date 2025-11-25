import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import {
  ReactQueryDevtools,
} from '@tanstack/react-query-devtools'
import App from './App'
import './styles/global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

async function enableMocking() {
  if (
    import.meta.env.VITE_ENABLE_MSW !== 'true' ||
    import.meta.env.PROD
  ) {
    return
  }

  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
  })
}

const rootElement = document.getElementById('root')!
const root = ReactDOM.createRoot(rootElement)

const renderApp = () => {
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>,
  )
}

enableMocking().finally(renderApp)

