import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App.jsx'

if (typeof global === "undefined") {
  window.global = window;
}

createRoot(document.getElementById('root')).render(
<Div className='main'><App /></Div>
)
