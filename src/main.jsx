import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App.jsx'

if (typeof global === "undefined") {
  window.global = window;
}

createRoot(document.getElementById('root')).render(
    <div className='main'><App /></div>
)
