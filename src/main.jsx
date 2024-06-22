import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import UserGrid from './component/UserGrid';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/grid" element={<UserGrid />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)
