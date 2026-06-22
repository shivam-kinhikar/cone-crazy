import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { store } from './store'
import App from './App.jsx'
import './index.css'

window.addEventListener('error', (event) => {
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace; background: white; z-index: 999999; position: absolute; top: 0; left: 0; width: 100vw; height: 100vh;">
    <h2>Application Crashed</h2>
    <p><strong>Error:</strong> ${event.message}</p>
    <pre style="white-space: pre-wrap;">${event.error?.stack}</pre>
  </div>`;
});

window.addEventListener('unhandledrejection', (event) => {
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace; background: white; z-index: 999999; position: absolute; top: 0; left: 0; width: 100vw; height: 100vh;">
    <h2>Unhandled Promise Rejection</h2>
    <p><strong>Reason:</strong> ${event.reason}</p>
  </div>`;
});


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
)
