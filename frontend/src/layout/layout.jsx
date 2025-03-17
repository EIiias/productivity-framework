// layout.jsx
// Wir haben jetzt .topbar-left (links) und .topbar-right (rechts), damit der Titel ganz links und
// Batterie + Avatar ganz rechts sind.

import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import AssistantWidget from '../assistantWidget/assistantWidget.jsx'
import Modal from '../modal/modal.jsx'
import '../layout/layout.css'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

function isWithinDays(deadline, days) {
  if (!deadline) return false
  const dl = new Date(deadline)
  const now = new Date()
  return dl - now >= 0 && dl - now <= days * 24 * 60 * 60 * 1000
}

function getTimeBasedGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Guten Morgen'
  if (hour >= 12 && hour < 18) return 'Guten Nachmittag'
  return 'Guten Abend'
}

/** 1) Focus Widget example */
function FocusWidget() {
  const [focusTasks, setFocusTasks] = useState([])
  const [showFocusModal, setShowFocusModal] = useState(false)
  const [focusTitle, setFocusTitle] = useState('')

  useEffect(() => {
    const data = localStorage.getItem('focusTasks_v3')
    if (data) {
      const parsed = JSON.parse(data)
      if (parsed.date === new Date().toDateString()) {
        setFocusTasks(parsed.tasks)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('focusTasks_v3', JSON.stringify({
      date: new Date().toDateString(),
      tasks: focusTasks
    }))
  }, [focusTasks])

  function toggleFocusTask(id) {
    setFocusTasks(prev => prev.map(x => x.id === id ? { ...x, done: !x.done } : x))
  }

  function deleteFocusTask(id) {
    setFocusTasks(prev => prev.filter(x => x.id !== id))
  }

  function addFocusTask() {
    if (!focusTitle.trim()) return
    const newItem = { id: 'f' + Date.now(), title: focusTitle, done: false }
    setFocusTasks(prev => [...prev, newItem])
    setShowFocusModal(false)
    setFocusTitle('')
  }

  const total = focusTasks.length
  const doneCount = focusTasks.filter(ft => ft.done).length
  const progress = total ? Math.round((doneCount / total) * 100) : 0

  return (
    <div className="widget-box">
      <div className="widget-header-noncollapse">
        <h4>Heutiger Fokus</h4>
      </div>
      <div className="widget-content">
        <div className="focus-tasklist">
          {focusTasks.map(ft => (
            <div key={ft.id} className="focus-item">
              <input
                type="checkbox"
                checked={ft.done}
                onChange={() => toggleFocusTask(ft.id)}
              />
              <span className={ft.done ? 'done' : ''}>{ft.title}</span>
              <button className="focus-delete-btn" onClick={() => deleteFocusTask(ft.id)}>
                Löschen
              </button>
            </div>
          ))}
        </div>
        <button
          className="focus-add-btn"
          onClick={() => setShowFocusModal(true)}
        >
          + Neu
        </button>
        <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
          Fortschritt: {progress}%
        </p>

        <Modal
          show={showFocusModal}
          onClose={() => setShowFocusModal(false)}
          title="Fokus-Aufgabe hinzufügen"
        >
          <label>
            Titel:
            <input
              type="text"
              value={focusTitle}
              onChange={e => setFocusTitle(e.target.value)}
            />
          </label>
          <button className="btn-primary" onClick={addFocusTask}>Hinzufügen</button>
        </Modal>
      </div>
    </div>
  )
}

/** 2) Task Progress Widget */
function Aufgabenfortschritt({ tasks, darkMode }) {
  const [timeRange, setTimeRange] = useState('today')

  let filtered = []
  if (timeRange === 'today') {
    filtered = tasks.filter(t => {
      if (!t.deadline) return false
      const dl = new Date(t.deadline)
      return dl.toDateString() === new Date().toDateString()
    })
  } else if (timeRange === 'week') {
    filtered = tasks.filter(t => isWithinDays(t.deadline, 7))
  } else {
    filtered = tasks.filter(t => isWithinDays(t.deadline, 30))
  }

  const offenCount = filtered.filter(x => x.status === 'Offen').length
  const inBearbCount = filtered.filter(x => x.status === 'In Bearbeitung').length
  const erledigtCount = filtered.filter(x => x.status === 'Erledigt').length
  const total = offenCount + inBearbCount + erledigtCount

  let data = [
    { name: 'Offen', value: offenCount, color: '#0d6efd' },
    { name: 'In Bearbeitung', value: inBearbCount, color: '#fd7e14' },
    { name: 'Erledigt', value: erledigtCount, color: '#198754' }
  ]
  if (total === 0) {
    data = [{ name: 'Keine Aufgaben', value: 1, color: '#ccc' }]
  }

  return (
    <div className="widget-box">
      <div className="widget-header-noncollapse">
        <h4>Aufgabenfortschritt</h4>
      </div>
      <div className="widget-content">
        <div className="time-range-tabs">
          <button
            className={timeRange === 'today' ? 'active' : ''}
            onClick={() => setTimeRange('today')}
          >
            Heute
          </button>
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Woche
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Monat
          </button>
        </div>
        <p style={{ marginBottom: '0.8rem' }}>
          Offen: {offenCount} | In Bearbeitung: {inBearbCount} | Erledigt: {erledigtCount}
        </p>

        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                cornerRadius={10}
                paddingAngle={5}
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                wrapperStyle={{
                  backgroundColor: darkMode ? '#444' : '#fff',
                  color: darkMode ? '#fff' : '#000'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/** 3) Habit Progress Widget */
function Gewohnheitsfortschritt({ habits, darkMode }) {
  const [timeRange, setTimeRange] = useState('today')

  const total = habits.length
  const doneCount = habits.filter(h => h.completed).length
  const openCount = total - doneCount

  let data = [
    { name: 'Offen', value: openCount, color: '#0d6efd' },
    { name: 'Erledigt', value: doneCount, color: '#198754' }
  ]
  if (total === 0) {
    data = [{ name: 'Keine Gewohnheiten', value: 1, color: '#ccc' }]
  }

  return (
    <div className="widget-box">
      <div className="widget-header-noncollapse">
        <h4>Gewohnheitsfortschritt</h4>
      </div>
      <div className="widget-content">
        <div className="time-range-tabs">
          <button
            className={timeRange === 'today' ? 'active' : ''}
            onClick={() => setTimeRange('today')}
          >
            Heute
          </button>
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Woche
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Monat
          </button>
        </div>
        {total > 0 ? (
          <p style={{ marginBottom: '0.8rem' }}>
            Offen: {openCount} | Erledigt: {doneCount}
          </p>
        ) : (
          <p>Keine Gewohnheiten.</p>
        )}

        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                cornerRadius={10}
                paddingAngle={5}
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                wrapperStyle={{
                  backgroundColor: darkMode ? '#444' : '#fff',
                  color: darkMode ? '#fff' : '#000'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/** 4) Mini Calendar Widget */
function MiniCalendar({ tasks, darkMode, dateFormat }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTasks, setSelectedTasks] = useState([])

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  let calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d)
  }

  function isToday(d) {
    return (
      d === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const tasksInThisMonth = tasks.filter(t => {
    if (!t.deadline) return false
    const dl = new Date(t.deadline)
    return dl.getFullYear() === year && dl.getMonth() === month
  })
  function hasDeadline(d) {
    return tasksInThisMonth.some(t => {
      const dl = new Date(t.deadline)
      return dl.getDate() === d
    })
  }

  function handleDayClick(d) {
    if (!d) return
    const clicked = new Date(year, month, d)
    setSelectedDate(clicked)
    const dayTasks = tasks.filter(t => {
      if (!t.deadline) return false
      const dl = new Date(t.deadline)
      return dl.toDateString() === clicked.toDateString()
    })
    setSelectedTasks(dayTasks)
  }

  function formatDate(date) {
    if (!date) return ''
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    if (dateFormat === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`
    return `${dd}.${mm}.${yyyy}`
  }

  return (
    <div className="widget-box">
      <div className="widget-header-noncollapse">
        <h4>Kalender</h4>
      </div>
      <div className="mini-calendar-content">
        <div className="mini-calendar-grid">
          {['So','Mo','Di','Mi','Do','Fr','Sa'].map((wd, i) => (
            <div key={i} className="mini-calendar-dayname">{wd}</div>
          ))}
          {calendarDays.map((dayNum, idx) => {
            if (!dayNum) {
              return <div key={idx} className="mini-calendar-daycell empty-cell" />
            }
            let cellClass = ''
            if (isToday(dayNum)) cellClass += ' mini-calendar-today'
            if (hasDeadline(dayNum)) cellClass += ' has-deadline'

            return (
              <div
                key={idx}
                className={`mini-calendar-daycell${cellClass}`}
                onClick={() => handleDayClick(dayNum)}
              >
                {dayNum}
              </div>
            )
          })}
        </div>

        {selectedDate && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            <strong>{formatDate(selectedDate)}</strong>
            {selectedTasks.length > 0 ? (
              <ul>
                {selectedTasks.map(t => (
                  <li key={t.id}>{t.title}</li>
                ))}
              </ul>
            ) : (
              <p>Keine Tasks an diesem Tag.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** 5) Settings Widget */
function SettingsWidget({
  userName, setUserName,
  avatarUrl, setAvatarUrl,
  darkMode, setDarkMode,
  colorScheme, setColorScheme,
  language, setLanguage,
  dateFormat, setDateFormat
}) {
  const [notifications, setNotifications] = useState(true)

  function handleAvatarUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarUrl(ev.target.result)
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', colorScheme)
  }, [colorScheme])

  return (
    <div className="widget-box">
      <div className="widget-header-noncollapse">
        <h4>Einstellungen</h4>
      </div>
      <div className="widget-content">
        <label>
          Name:
          <input
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
          />
        </label>

        <label>
          Avatar-URL:
          <input
            type="text"
            value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)}
          />
        </label>

        <label>
          Oder Bild hochladen:
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
          />
        </label>

        <label>
          Darkmode:
          <input
            type="checkbox"
            checked={darkMode}
            onChange={e => setDarkMode(e.target.checked)}
          />
        </label>

        <label>
          Farbschema:
          <input
            type="color"
            value={colorScheme}
            onChange={e => setColorScheme(e.target.value)}
          />
        </label>

        <hr style={{ margin: '1rem 0' }} />

        <label>
          Sprache:
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            <option value="de">Deutsch</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </label>

        <label>
          Benachrichtigungen:
          <input
            type="checkbox"
            checked={notifications}
            onChange={e => setNotifications(e.target.checked)}
          />
        </label>

        <label>
          Datumsformat:
          <select
            value={dateFormat}
            onChange={e => setDateFormat(e.target.value)}
          >
            <option value="DD.MM.YYYY">TT.MM.JJJJ</option>
            <option value="YYYY-MM-DD">JJJJ-MM-TT</option>
          </select>
        </label>
      </div>
    </div>
  )
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  const [darkMode, setDarkMode] = useState(false)
  const [userName, setUserName] = useState('Lars')
  const [avatarUrl, setAvatarUrl] = useState('https://randomuser.me/api/portraits/men/3.jpg')
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [energyLevel, setEnergyLevel] = useState(75)
  const [batteryWobble, setBatteryWobble] = useState(false)

  const [language, setLanguage] = useState('de')
  const [dateFormat, setDateFormat] = useState('DD.MM.YYYY')
  const [colorScheme, setColorScheme] = useState('#0d6efd')

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [greeting, setGreeting] = useState(getTimeBasedGreeting())

  const [tasks, setTasks] = useState([])
  const [habits, setHabits] = useState([
    { id: 'h1', name: 'Meditation', completed: false },
    { id: 'h2', name: 'Tagebuch schreiben', completed: true }
  ])

  const isDashboard = (location.pathname === '/' || location.pathname === '/dashboard')
  const isTasks = (location.pathname === '/tasks')

  useEffect(() => {
    let c = '#51cf66'
    if (energyLevel < 30) c = '#ff6b6b'
    else if (energyLevel < 60) c = '#ffa94d'
    document.documentElement.style.setProperty('--battery-color', c)
  }, [energyLevel])

  useEffect(() => {
    setBatteryWobble(true)
    const t = setTimeout(() => setBatteryWobble(false), 500)
    return () => clearTimeout(t)
  }, [energyLevel])

  useEffect(() => {
    const saved = localStorage.getItem('layoutGlobalSettings_v3')
    if (saved) {
      const obj = JSON.parse(saved)
      if (obj.darkMode !== undefined) setDarkMode(obj.darkMode)
      if (obj.userName) setUserName(obj.userName)
      if (obj.avatarUrl) setAvatarUrl(obj.avatarUrl)
      if (obj.sidebarOpen === false) setSidebarOpen(false)
      if (obj.language) setLanguage(obj.language)
      if (obj.dateFormat) setDateFormat(obj.dateFormat)
      if (obj.colorScheme) setColorScheme(obj.colorScheme)
    }
  }, [])

  useEffect(() => {
    const toStore = {
      darkMode,
      userName,
      avatarUrl,
      sidebarOpen,
      language,
      dateFormat,
      colorScheme
    }
    localStorage.setItem('layoutGlobalSettings_v3', JSON.stringify(toStore))
  }, [darkMode, userName, avatarUrl, sidebarOpen, language, dateFormat, colorScheme])

  async function fetchTasks() {
    try {
      const res = await fetch('http://localhost:5002/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (err) {
      console.error('Fehler beim Laden der Tasks:', err)
    }
  }
  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <div className={`global-layout ${darkMode ? 'dark-mode' : ''}`}>
      {/* TOP-BAR */}
      <header className="topbar">
        <div className="topbar-row">
          {/* Links: Sidebar Toggle + Logo + Tabs */}
          <div className="topbar-left">
            <button
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Einklappen' : 'Ausklappen'}
            >
              {sidebarOpen ? '⮜' : '⮞'}
            </button>

            <div
              className="topbar-logo-container"
              onClick={() => navigate('/')}
            >
              <h1 className="topbar-logo">Produktivitäts-Framework</h1>
              <p className="topbar-subtitle">
                {greeting}, {userName}!
              </p>
            </div>

            <div className="topbar-tabs">
              <button
                className={isDashboard ? 'active' : ''}
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
              <button
                className={isTasks ? 'active' : ''}
                onClick={() => navigate('/tasks')}
              >
                Aufgaben
              </button>
            </div>
          </div>

          {/* Rechts: Batterie + Avatar */}
          <div className="topbar-right">
            <div className={`battery-widget ${batteryWobble ? 'wobble' : ''}`}>
              <div className="battery-icon">
                <div className="battery-level" style={{ width: energyLevel + '%' }} />
              </div>
              <span className="battery-info">{energyLevel}%</span>
            </div>
            <input
              className="energy-slider"
              type="range"
              min="0"
              max="100"
              value={energyLevel}
              onChange={e => setEnergyLevel(+e.target.value)}
            />
            <div className="topbar-user">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="avatar"
                onClick={() => alert('Avatar geklickt!')}
              />
            </div>
          </div>
        </div>
      </header>

      {/* SIDEBAR + MAIN */}
      <div className="layout">
        <aside
          className="widgets-column"
          style={{
            width: sidebarOpen ? '320px' : '0px',
            padding: sidebarOpen ? '1rem' : '0',
            overflow: 'hidden',
            transition: 'width 0.3s ease, padding 0.3s ease'
          }}
        >
          {sidebarOpen && (
            <>
              <FocusWidget />
              <Aufgabenfortschritt tasks={tasks} darkMode={darkMode} />
              <Gewohnheitsfortschritt habits={habits} darkMode={darkMode} />
              <MiniCalendar
                tasks={tasks}
                darkMode={darkMode}
                dateFormat={dateFormat}
              />
              <SettingsWidget
                userName={userName}
                setUserName={setUserName}
                avatarUrl={avatarUrl}
                setAvatarUrl={setAvatarUrl}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                colorScheme={colorScheme}
                setColorScheme={setColorScheme}
                language={language}
                setLanguage={setLanguage}
                dateFormat={dateFormat}
                setDateFormat={setDateFormat}
              />
            </>
          )}
        </aside>

        <main className="main-area">
          <Outlet
            context={{
              darkMode,
              language,
              dateFormat,
              colorScheme
            }}
          />
        </main>
      </div>

      {/* KI-Assistent */}
      <AssistantWidget open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  )
}
