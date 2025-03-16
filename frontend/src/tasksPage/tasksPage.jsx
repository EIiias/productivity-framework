import React, { useState, useEffect, useRef } from 'react'
import './tasksPage.css'

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

  // Uhrzeit-Greeting
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

  // Tabs (Alle, Heute, Fällig, Erledigt)
  const [activeTab, setActiveTab] = useState('alle')  
  // Filter / Suche
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  // Tasks
  const [tasks, setTasks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskStatus, setTaskStatus] = useState('Offen')
  const [taskPriority, setTaskPriority] = useState('Mittel')
  const [taskTags, setTaskTags] = useState('')
  const [taskDeadline, setTaskDeadline] = useState('')

  // Detail Sidebar
  const [selectedTask, setSelectedTask] = useState(null)
  const sidebarRef = useRef(null)

  // Fetch Tasks once
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

  // Neue Task erstellen
  async function handleCreateTask() {
    if (!taskTitle.trim() || !taskDescription.trim()) {
      alert('Bitte Titel & Beschreibung eingeben.')
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
        alert('Fehler beim Erstellen der Task.')
      }
    } catch (err) {
      console.error(err)
      alert('Fehler (Verbindungsproblem)')
    }
  }

  // Quick-Update (z.B. Checkbox -> Erledigt) 
  async function updateTaskStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    try {
      const res = await fetch(`http://localhost:5002/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: newStatus })
      })
      if (res.ok) {
        fetchTasks()
      } else {
        alert('Fehler beim Updaten.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Löschung
  async function handleDeleteTask(id) {
    try {
      const res = await fetch(`http://localhost:5002/tasks/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== id))
        // Falls gerade die Task im Detail-Sidebar offen war -> schliessen
        if (selectedTask && selectedTask.id === id) setSelectedTask(null)
      } else {
        alert('Fehler beim Löschen')
      }
    } catch (err) {
      console.error(err)
      alert('Verbindungsfehler (Löschen)')
    }
  }

  // Detail-Sidebar öffnen
  function openDetailSidebar(task) {
    setSelectedTask(task)
  }
  // Detail-Sidebar schliessen
  function closeDetailSidebar() {
    setSelectedTask(null)
  }

  // Bearbeitung im Detail-Sidebar speichern
  async function handleSaveDetail() {
    if (!selectedTask) return
    const { id, title, description, status, priority, tags, deadline } = selectedTask
    try {
      const res = await fetch(`http://localhost:5002/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, status, priority,
          tags: Array.isArray(tags) ? tags : [],
          deadline
        })
      })
      if (res.ok) {
        await fetchTasks()
        closeDetailSidebar()
      } else {
        alert('Fehler beim Updaten der Task.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // -- Modal Helpers
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

  // ------------ Filtering + Tabs ------------
  const todayStr = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  function filterByTab(task) {
    switch (activeTab) {
      case 'heute':
        // Deadline == heute
        return task.deadline && task.deadline.substring(0,10) === todayStr
      case 'faellig':
        // Deadline < heute, status != Erledigt
        if (!task.deadline) return false
        const deadlineDate = new Date(task.deadline)
        const today = new Date(todayStr) // Zeitanteil = 00:00
        return deadlineDate < today && task.status !== 'Erledigt'
      case 'erledigt':
        return task.status === 'Erledigt'
      default:
        // 'alle'
        return true
    }
  }

  function filterBySearch(task) {
    if (!searchTerm.trim()) return true
    const lower = searchTerm.toLowerCase()
    return (
      task.title.toLowerCase().includes(lower) ||
      task.description.toLowerCase().includes(lower) ||
      (task.tags || []).some(tag => tag.toLowerCase().includes(lower))
    )
  }

  function filterByStatus(task) {
    if (filterStatus === 'all') return true
    return task.status === filterStatus
  }

  function filterByPriority(task) {
    if (filterPriority === 'all') return true
    return task.priority === filterPriority
  }

  const filteredTasks = tasks.filter(task =>
    filterByTab(task) &&
    filterBySearch(task) &&
    filterByStatus(task) &&
    filterByPriority(task)
  )

  // ============ Drag & Drop (ohne extra Library) ============
  const [draggedTaskId, setDraggedTaskId] = useState(null)

  function handleDragStart(e, taskId) {
    setDraggedTaskId(taskId)
  }
  function handleDragOver(e) {
    e.preventDefault()
  }
  function handleDrop(e, dropTaskId) {
    e.preventDefault()
    if (draggedTaskId === null) return

    // Reorder in local state
    const draggedIndex = tasks.findIndex(t => t.id === draggedTaskId)
    const dropIndex = tasks.findIndex(t => t.id === dropTaskId)
    if (draggedIndex === -1 || dropIndex === -1) return

    const newTasks = [...tasks]
    const [removed] = newTasks.splice(draggedIndex, 1)
    newTasks.splice(dropIndex, 0, removed)
    setTasks(newTasks)

    setDraggedTaskId(null)
  }

  // -------------- RENDER --------------
  return (
    <div className={`tasksPage-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* TOP-BAR */}
      <header className="topbar">
        <div className="topbar-row">
          {/* Links: Logo */}
          <div className="topbar-left">
            <div 
              className="topbar-logo-container"
              onClick={() => (window.location.href = '/dashboard')}
            >
              <h1 className="topbar-logo">Produktivitäts-Framework</h1>
              <p className="topbar-subtitle">{greetingText}, {userName}!</p>
            </div>
          </div>

          {/* Tabs in der Mitte */}
          <div className="topbar-tabs">
            <button
              onClick={() => setActiveTab('alle')}
              className={activeTab === 'alle' ? 'active' : ''}
            >
              Alle Aufgaben
            </button>
            <button
              onClick={() => setActiveTab('heute')}
              className={activeTab === 'heute' ? 'active' : ''}
            >
              Heute
            </button>
            <button
              onClick={() => setActiveTab('faellig')}
              className={activeTab === 'faellig' ? 'active' : ''}
            >
              Fällig
            </button>
            <button
              onClick={() => setActiveTab('erledigt')}
              className={activeTab === 'erledigt' ? 'active' : ''}
            >
              Erledigt
            </button>
          </div>

          {/* Rechts: Battery, KI, Avatar (Darkmode Toggle) */}
          <div className="topbar-right">
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

            {/* KI-Assistent Icon (Platzhalter) */}
            <div
              className="ki-assistant-icon"
              onClick={() => alert('KI-Assistent noch nicht implementiert!')}
            >
              KI
            </div>

            {/* Avatar (Darkmode beim Klick) */}
            <div
              className="topbar-user"
              onClick={() => setDarkMode(!darkMode)}
            >
              <img src={avatarUrl} alt="Avatar" className="avatar" />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* Filter und Suche */}
        <div className="filters-container">
          <input
            type="text"
            placeholder="Task suchen…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">Status (alle)</option>
            <option value="Offen">Offen</option>
            <option value="In Bearbeitung">In Bearbeitung</option>
            <option value="Erledigt">Erledigt</option>
          </select>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
          >
            <option value="all">Priorität (alle)</option>
            <option value="Hoch">Hoch</option>
            <option value="Mittel">Mittel</option>
            <option value="Niedrig">Niedrig</option>
          </select>
        </div>

        {/* Task-Liste */}
        <div className="tasks-list">
          {filteredTasks.length === 0 ? (
            <p>Keine passenden Aufgaben gefunden.</p>
          ) : (
            filteredTasks.map(task => {
              const isCompleted = task.status === 'Erledigt'
              const isOverdue = task.deadline 
                && task.deadline.substring(0,10) < todayStr 
                && !isCompleted

              const statusClass = (task.status === 'Offen')
                ? 'status-offen'
                : (task.status === 'In Bearbeitung')
                  ? 'status-bearbeitung'
                  : 'status-erledigt'

              const prioClass = (task.priority === 'Hoch')
                ? 'priority-hoch'
                : (task.priority === 'Mittel')
                  ? 'priority-mittel'
                  : 'priority-niedrig'

              return (
                <div
                  key={task.id}
                  className={`task-row ${isCompleted ? 'completed' : ''}`}
                  draggable
                  onDragStart={e => handleDragStart(e, task.id)}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, task.id)}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={isCompleted}
                    onChange={() => updateTaskStatus(task.id, isCompleted ? 'Offen' : 'Erledigt')}
                  />
                  {/* Drag-Handle */}
                  <span className="drag-handle">⇅</span>

                  {/* Titel */}
                  <div 
                    className="task-title"
                    onClick={() => openDetailSidebar(task)}
                  >
                    {task.title}
                  </div>

                  {/* Deadline */}
                  {task.deadline && (
                    <div
                      className={`task-deadline ${isOverdue ? 'overdue' : ''}`}
                    >
                      {task.deadline.substring(0,10)}
                    </div>
                  )}

                  {/* Status + Priority Badges */}
                  <span className={`status-badge ${statusClass}`}>
                    {task.status}
                  </span>
                  <span className={`priority-badge ${prioClass}`}>
                    {task.priority}
                  </span>

                  {/* Edit / Delete Buttons */}
                  <div className="task-actions">
                    <button
                      title="Bearbeiten"
                      onClick={() => openDetailSidebar(task)}
                    >
                      ✏️
                    </button>
                    <button
                      title="Löschen"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* FAB: Neue Task */}
      <button className="new-task-fab" onClick={openModal}>+</button>

      {/* MODAL: Neue Task */}
      <Modal show={showModal} onClose={closeModal} title="Neue Aufgabe">
        <label>Titel:</label>
        <input
          type="text"
          value={taskTitle}
          onChange={e => setTaskTitle(e.target.value)}
        />
        <label>Beschreibung:</label>
        <textarea
          rows={2}
          value={taskDescription}
          onChange={e => setTaskDescription(e.target.value)}
        />
        <label>Status:</label>
        <select
          value={taskStatus}
          onChange={e => setTaskStatus(e.target.value)}
        >
          <option value="Offen">Offen</option>
          <option value="In Bearbeitung">In Bearbeitung</option>
          <option value="Erledigt">Erledigt</option>
        </select>
        <label>Priorität:</label>
        <select
          value={taskPriority}
          onChange={e => setTaskPriority(e.target.value)}
        >
          <option value="Hoch">Hoch</option>
          <option value="Mittel">Mittel</option>
          <option value="Niedrig">Niedrig</option>
        </select>
        <label>Tags (Komma-getrennt):</label>
        <input
          type="text"
          value={taskTags}
          onChange={e => setTaskTags(e.target.value)}
        />
        <label>Deadline:</label>
        <input
          type="date"
          value={taskDeadline}
          onChange={e => setTaskDeadline(e.target.value)}
        />
        <button onClick={handleCreateTask}>
          Hinzufügen
        </button>
      </Modal>

      {/* DETAIL-SIDEBAR */}
      <div className={`detail-sidebar ${selectedTask ? 'open' : ''}`} ref={sidebarRef}>
        {selectedTask && (
          <>
            <div className="detail-sidebar-header">
              <h2>Aufgabe bearbeiten</h2>
              <button onClick={closeDetailSidebar}>×</button>
            </div>
            <div className="detail-sidebar-body">
              <label>Titel</label>
              <input
                type="text"
                value={selectedTask.title}
                onChange={e =>
                  setSelectedTask({ ...selectedTask, title: e.target.value })
                }
              />
              <label>Beschreibung</label>
              <textarea
                rows={3}
                value={selectedTask.description}
                onChange={e =>
                  setSelectedTask({ ...selectedTask, description: e.target.value })
                }
              />
              <label>Status</label>
              <select
                value={selectedTask.status}
                onChange={e =>
                  setSelectedTask({ ...selectedTask, status: e.target.value })
                }
              >
                <option value="Offen">Offen</option>
                <option value="In Bearbeitung">In Bearbeitung</option>
                <option value="Erledigt">Erledigt</option>
              </select>

              <label>Priorität</label>
              <select
                value={selectedTask.priority}
                onChange={e =>
                  setSelectedTask({ ...selectedTask, priority: e.target.value })
                }
              >
                <option value="Hoch">Hoch</option>
                <option value="Mittel">Mittel</option>
                <option value="Niedrig">Niedrig</option>
              </select>

              <label>Tags</label>
              <input
                type="text"
                value={(selectedTask.tags || []).join(', ')}
                onChange={e =>
                  setSelectedTask({
                    ...selectedTask,
                    tags: e.target.value.split(',').map(t => t.trim())
                  })
                }
              />

              <label>Deadline</label>
              <input
                type="date"
                value={selectedTask.deadline ? selectedTask.deadline.substring(0,10) : ''}
                onChange={e =>
                  setSelectedTask({ ...selectedTask, deadline: e.target.value })
                }
              />
            </div>
            <div className="detail-sidebar-footer">
              <button className="btn-secondary" onClick={closeDetailSidebar}>
                Abbrechen
              </button>
              <button className="btn-primary" onClick={handleSaveDetail}>
                Speichern
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
