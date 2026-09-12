import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './i18n.js'
import ClientHome from './pages/ClientHome.jsx'
import Admin from './pages/Admin.jsx'
import Login from './pages/Login.jsx'
import PromotionRequest from './pages/PromotionRequest.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ClientHome/>} />
      <Route path="/admin" element={<Admin/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/dang-ky-gioi-thieu" element={<PromotionRequest/>} />
    </Routes>
  </BrowserRouter>
)
