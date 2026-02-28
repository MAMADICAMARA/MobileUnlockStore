//voila le contenu  de main.jsx
import React, { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }}>
          <h2 style={{ color: 'red' }}>Une erreur est survenue — voir la console</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error?.message || this.state.error)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

let rootEl = document.getElementById('root')
if (!rootEl) {
  console.warn('Root element #root not found — creating one automatically.')
  rootEl = document.createElement('div')
  rootEl.id = 'root'
  document.body.appendChild(rootEl)
}

console.log('Mounting React to', rootEl)

try {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <Suspense fallback={<div style={{padding:20}}>Chargement…</div>}>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </Suspense>
      </ErrorBoundary>
    </StrictMode>
  )
  console.info('React monté avec AuthProvider.')
} catch (err) {
  console.error('React render failed:', err)
  rootEl.innerHTML = '<pre style="color:red;padding:1rem">React failed to mount — voir la console pour détails.</pre>'
}