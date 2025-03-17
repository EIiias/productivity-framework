import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../layout/layout.jsx'
import Dashboard from '../dashboard/dashboard.jsx'
import TasksPage from '../tasksPage/tasksPage.jsx'
import NotFound from '../404/404.jsx'

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
        {/* Dedizierte 404-Seite */}
        <Route path="/404" element={<NotFound />} />
        {/* Catch-all: Weiterleitung zu /404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  )
}