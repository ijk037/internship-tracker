import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // Standard router for web
import App from './App.jsx'
import './index.css' // Import Tailwind and custom CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// Dynamic Google Analytics (Google Tag) injection
const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
if (gaMeasurementId && gaMeasurementId !== 'G-XXXXXXXXXX') {
  const gaScript = document.createElement('script')
  gaScript.async = true
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`
  document.head.appendChild(gaScript)

  const inlineScript = document.createElement('script')
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaMeasurementId}', {
      page_path: window.location.pathname,
    });
  `
  document.head.appendChild(inlineScript)
}

