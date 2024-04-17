import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from '@/pages/app.tsx'
import '@/shared/styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)