import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import { ThemeBootstrap } from './components/theme-bootstrap'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeBootstrap />
    <App />
  </BrowserRouter>,
)
