import React, { useState, useEffect } from 'react'
import './tasksPage.css'

// Re-usable CollapsibleWidget + Modal
function CollapsibleWidget({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="widget-box">
      <div className="widget-header" onClick={() => setOpen(!open)}>
        <h4>{title}</h4>
        <span className="widget-toggle">{open ? '⬆' : '⬇'}</span>
      </div>
      {open && <div className="widget-content">{children}</div>}
    </div>
  )
}

function Modal({ show, onClose, title, children }) {
  if (!show) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export default function TasksPage() {
  // Darkmode
  const [darkMode, setDarkMode] = useState(false)
  const [energyLevel, setEnergyLevel] = useState(100)
  const [batteryTransition, setBatteryTransition] = useState(false)

  // Benutzer
  const [userName, setUserName] = useState('Lars')
  const [avatarUrl, setAvatarUrl] = useState('https://randomuser.me/api/portraits/men/1.jpg')

  // Oben links: Titel + Subtitle
  const [greetingText, setGreetingText] = useState('Guten Morgen')
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 12 && hour < 18) setGreetingText('Guten Nachmittag')
    else if (hour >= 18 || hour < 5) setGreetingText('Guten Abend')
    else setGreetingText('Guten Morgen')
  }, [])

  // Battery-Animation
  useEffect(() => {
    setBatteryTransition(true)
    const t = setTimeout(() => setBatteryTransition(false), 300)
    return () => clearTimeout(t)
  }, [energyLevel])

  const batteryColor = energyLevel < 30
    ? '#ff6b6b'
    : energyLevel < 60
      ? '#ffa94d'
      : '#51cf66'

  // activeTab: «Dashboard» vs «Aufgaben»
  // Hier sind wir auf der Task-Seite => Aufgaben ist active
  const [activeTab, setActiveTab] = useState('tasks')

  // Tasks array
  const [tasks, setTasks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskStatus, setTaskStatus] = useState('Offen')
  const [taskPriority, setTaskPriority] = useState('Mittel')
  const [taskTags, setTaskTags] = useState('')
  const [taskDeadline, setTaskDeadline] = useState('')

  async function fetchTasks() {
    try {
      const res = await fetch('http://localhost:5002/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      } else {
        console.error('Fehler beim Laden der Tasks')
      }
    } catch (err) {
      console.error('Verbindungsfehler:', err)
    }
  }
  useEffect(() => {
    fetchTasks()
  }, [])

  async function handleDeleteTask(id) {
    try {
      const res = await fetch(`http://localhost:5002/tasks/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== id))
      } else {
        alert('Fehler beim Löschen')
      }
    } catch (err) {
      console.error(err)
      alert('Verbindungsfehler (Löschen)')
    }
  }

  async function handleCreateTask() {
    if (!taskTitle.trim() || !taskDescription.trim()) {
      alert('Bitte Titel & Beschreibung')
      return
    }
    const parsedTags = taskTags.split(',')
      .map(t => t.trim())
      .filter(x => x.length > 0)

    const newTask = {
      title: taskTitle,
      description: taskDescription,
      status: taskStatus,
      priority: taskPriority,
      tags: parsedTags,
      deadline: taskDeadline || null
    }

    try {
      const res = await fetch('http://localhost:5002/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      })
      if (res.ok) {
        await fetchTasks()
        closeModal()
      } else {
        alert('Fehler beim Erstellen')
      }
    } catch (err) {
      console.error(err)
      alert('Fehler (Verbindung)')
    }
  }

  function openModal() {
    setShowModal(true)
  }
  function closeModal() {
    setShowModal(false)
    resetForm()
  }
  function resetForm() {
    setTaskTitle('')
    setTaskDescription('')
    setTaskStatus('Offen')
    setTaskPriority('Mittel')
    setTaskTags('')
    setTaskDeadline('')
  }

  return (
    <div className={`tasksPage-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* TOP-BAR */}
      <header className="topbar">
        <div className="topbar-row">
          <div className="topbar-left">
            <div className="topbar-logo-container">
              <h1 className="topbar-logo">Produktivitäts-Framework</h1>
              <p className="topbar-subtitle">{greetingText}, {userName}!</p>
            </div>

            <div className="topbar-tabs">
              <button
                onClick={() => (window.location.href = '/dashboard')}
              >
                Dashboard
              </button>
              <button
                className="active no-hover-on-active"
                style={{ cursor: 'default' }}
              >
                Aufgaben
              </button>
            </div>
          </div>

          {/* Battery + Avatar rechts */}
          <div className="topbar-energy-container">
            <div className={`battery-widget ${batteryTransition ? 'battery-animate' : ''}`}>
              <div className="battery-icon">
                <div
                  className="battery-level"
                  style={{
                    width: `${energyLevel}%`,
                    '--battery-color': batteryColor,
                    background: batteryColor
                  }}
                />
              </div>
              <span className="battery-info">{energyLevel}%</span>
            </div>
            <input
              className="energy-slider"
              type="range"
              min="0"
              max="100"
              value={energyLevel}
              onChange={e => setEnergyLevel(Number(e.target.value))}
            />
          </div>

          <div
            className="topbar-user"
            style={{ cursor: 'pointer', marginLeft: '1rem' }}
            onClick={() => setDarkMode(!darkMode)}
          >
            <img src={avatarUrl} alt="Avatar" className="avatar" />
          </div>
        </div>
      </header>

      {/* Layout: Sidebar + Main */}
      <div className="layout">
        <aside className="widgets-column">
          <CollapsibleWidget title="Aufgabenfortschritt" defaultOpen={true}>
            <p>Hier könnte man die gleichen Charts wie im Dashboard anzeigen.</p>
          </CollapsibleWidget>

          <CollapsibleWidget title="Kalender" defaultOpen={false}>
            <p>Mini-Kalender oder Sonstiges übernehmen – je nach Bedarf.</p>
          </CollapsibleWidget>

          <CollapsibleWidget title="Einstellungen" defaultOpen={false}>
            <p>Auch hier könnte man dieselben User-Settings übernehmen.</p>
          </CollapsibleWidget>
        </aside>

        <main className="main-area">
          <h2>Aufgaben</h2>
          <button onClick={openModal} style={{ marginBottom: '1rem' }}>
            + Neue Aufgabe
          </button>

          {tasks.length === 0 ? (
            <p>Keine Aufgaben vorhanden.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    background: darkMode ? '#444' : '#fff',
                    color: darkMode ? '#eee' : '#333',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '0.6rem 0.8rem',
                    position: 'relative'
                  }}
                >
                  <button
                    style={{
                      background: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      padding: '0.3rem 0.6rem',
                      cursor: 'pointer',
                      position: 'absolute',
                      top: '0.4rem',
                      right: '0.5rem'
                    }}
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    ✖
                  </button>
                  <h3 style={{ margin: '0.2rem 0' }}>{task.title}</h3>
                  <p style={{ margin: '0.2rem 0' }}>{task.description}</p>
                  <p style={{ margin: '0.2rem 0' }}>Status: {task.status}</p>
                  <p style={{ margin: '0.2rem 0' }}>Priorität: {task.priority}</p>
                  {task.deadline && (
                    <p style={{ margin: '0.2rem 0' }}>
                      Deadline: {task.deadline.substring(0,10)}
                    </p>
                  )}
                  {task.tags && task.tags.length > 0 && (
                    <p style={{ margin: '0.2rem 0' }}>
                      Tags: {task.tags.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MODAL */}
      <Modal show={showModal} onClose={closeModal} title="Neue Aufgabe">
        <label>
          Titel:
          <input
            type="text"
            value={taskTitle}
            onChange={e => setTaskTitle(e.target.value)}
          />
        </label>
        <label>
          Beschreibung:
          <textarea
            rows={2}
            value={taskDescription}
            onChange={e => setTaskDescription(e.target.value)}
          />
        </label>
        <label>
          Status:
          <select
            value={taskStatus}
            onChange={e => setTaskStatus(e.target.value)}
          >
            <option value="Offen">Offen</option>
            <option value="In Bearbeitung">In Bearbeitung</option>
            <option value="Erledigt">Erledigt</option>
          </select>
        </label>
        <label>
          Priorität:
          <select
            value={taskPriority}
            onChange={e => setTaskPriority(e.target.value)}
          >
            <option value="Hoch">Hoch</option>
            <option value="Mittel">Mittel</option>
            <option value="Niedrig">Niedrig</option>
          </select>
        </label>
        <label>
          Tags (Komma-getrennt):
          <input
            type="text"
            value={taskTags}
            onChange={e => setTaskTags(e.target.value)}
          />
        </label>
        <label>
          Deadline:
          <input
            type="date"
            value={taskDeadline}
            onChange={e => setTaskDeadline(e.target.value)}
          />
        </label>
        <button onClick={handleCreateTask}>
          Hinzufügen
        </button>
      </Modal>
    </div>
  )
}