import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../layout/layout.jsx'
import Dashboard from '../dashboard/dashboard.jsx'
import TasksPage from '../tasksPage/tasksPage.jsx'
import NotFound from '../404/404.jsx'
import Login from '../login/login.jsx'

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Routen, die das Layout verwenden */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<TasksPage />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}