import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import TopBar from '../layout/topbar.jsx'
import Dashboard from '../dashboard/dashboard.jsx'
import NotFound from '../404/404.jsx'
import Login from '../login/login.jsx'
import Signup from '../signup/signup.jsx'

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Routen, die das Layout verwenden */}
        <Route element={<TopBar />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}