import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/Dashboard.css'
import './styles/Responsive.css'
import './styles/Sidebar.css'
import './styles/Topbar.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
