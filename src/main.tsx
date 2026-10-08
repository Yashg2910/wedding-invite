import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/style.css'

// No StrictMode: its double-invoke of effects would build/dispose the WebGL
// scene twice on mount and cause a visible hitch.
createRoot(document.getElementById('root')!).render(<App />)
