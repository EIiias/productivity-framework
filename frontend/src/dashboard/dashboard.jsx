import React, { useState, useEffect } from 'react'
import './dashboard.css'

// Recharts (für die PieCharts)
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

// DnD-Kit (für Drag&Drop)
import {
  DndContext,
  closestCenter
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

/* Übersetzungen (nur DE hier als Beispiel) */
const translations = {
  de: {
    productivityFramework: 'Produktivitäts-Framework',

    tabDashboard: 'Dashboard',
    tabTasks: 'Aufgaben',

    greetingMorning: 'Guten Morgen',
    greetingAfternoon: 'Guten Nachmittag',
    greetingEvening: 'Guten Abend',

    widgetFocus: 'Heutiger Fokus',
    widgetSettings: 'Einstellungen',
    widgetLanguage: 'Sprache',

    tasksHeader: 'Aufgaben',
    newTask: '+ Neue Aufgabe',

    visionBoardHeader: 'Vision Board',
    habitsHeader: 'Gewohnheiten',
    newHabit: '+ Neu',

    goalsHeader: 'Zielübersicht (Quartalsziele)',
    newGoal: '+ Neues Ziel',

    tasksProgress: 'Aufgabenfortschritt',
    habitsProgress: 'Gewohnheitsfortschritt',

    edit: 'Bearbeiten',
    add: 'Hinzufügen',
    delete: 'Löschen',
    progress: 'Fortschritt',

    addFocusTitle: 'Fokus-Aufgabe hinzufügen',
    addTaskTitle: 'Neue Aufgabe',
    editTaskTitle: 'Aufgabe bearbeiten',
    addHabitTitle: 'Neue Gewohnheit',
    editHabitTitle: 'Gewohnheit bearbeiten',
    addGoalTitle: 'Neues Ziel',
    editGoalTitle: 'Ziel bearbeiten',
    addVisionTitle: 'Neue Vision',
    editVisionTitle: 'Vision bearbeiten',

    statuses: {
      Offen: 'Offen',
      'In Bearbeitung': 'In Bearbeitung',
      Erledigt: 'Erledigt'
    },
    priorities: {
      Hoch: 'Hoch',
      Mittel: 'Mittel',
      Niedrig: 'Niedrig'
    },

    profileTitle: 'Profil',
    profileHint: 'Hier könntest du detaillierte Profildaten anzeigen oder bearbeiten.',

    userSettingsGeneral: 'Allgemein',
    userSettingsSystem: 'System',
    userNameLabel: 'Name',
    userAvatarUrlLabel: 'Avatar-URL',
    userOrUpload: 'Oder Bild hochladen:',
    userDarkmode: 'Darkmode',
    userColorScheme: 'Farbschema',
    userNotifications: 'Benachrichtigungen:',
    userDateFormat: 'Datumsformat:',

    searchPlaceholder: 'Suche …',
    all: 'Alle',
    tagsLabel: 'Tags (Komma-separiert)',
    deadlineLabel: 'Deadline',
    overdueTooltip: 'Deadline überschritten!',
    noDueTasks: 'Keine fälligen Tasks an diesem Tag',

    undone: 'Rückgängig',
    undoToastText: 'Task gelöscht. Aktion rückgängig machen?',

    timeRangeToday: 'Heute',
    timeRangeWeek: 'Woche',
    timeRangeMonth: 'Monat',

    miniCalendar: 'Kalender',

    assistantTitle: 'KI-Assistent (Simuliert)',
    assistantOpen: 'Assistent öffnen',
    assistantClose: 'Schliessen',
    quickActions: 'Quick-Aktionen',
    newTaskAction: 'Neuen Task erstellen',
    newHabitAction: 'Neue Gewohnheit erstellen',
    newGoalAction: 'Neues Ziel erstellen',
    newFocusAction: 'Fokus-Aufgabe erstellen',

    quickAddTask: 'Aufgabe',
    quickAddHabit: 'Gewohnheit',
    quickAddGoal: 'Ziel'
  }
}

/* Einfaches Modal */
function Modal({ show, onClose, title, children }) {
  if (!show) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

/* Collapsible Widget */
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

/* Sortable Task Card */
function SortableTaskCard({ task, darkMode, bgColor, onEdit, onDelete, t }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id })

  const priorityColorMap = {
    Hoch: '#dc3545',
    Mittel: '#ffc107',
    Niedrig: '#198754'
  }
  const statusColorMap = {
    Offen: 'status-offen',
    'In Bearbeitung': 'status-inbearb',
    Erledigt: 'status-erledigt'
  }

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    backgroundColor: darkMode ? '#444' : bgColor
  }

  const translatedStatus = t.statuses[task.status] || task.status
  const translatedPriority = t.priorities[task.priority] || task.priority

  // Deadline => Format als Badge
  let deadlineBadge = ''
  let isOverdue = false
  if (task.deadline) {
    const dlDate = new Date(task.deadline)
    const now = new Date()
    isOverdue = dlDate < now && task.status !== 'Erledigt'
    deadlineBadge = dlDate.toLocaleDateString()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${darkMode ? 'dark-mode-card' : ''}`}
    >
      <span
        {...attributes}
        {...listeners}
        className="drag-handle"
        title="Verschieben"
      >
        ⇅
      </span>

      <div className="task-info">
        {/* Titel + Priority-Badge */}
        <div className="task-header">
          <span className="task-title">{task.title}</span>
          <span
            className="priority-badge"
            style={{ backgroundColor: priorityColorMap[task.priority] || '#ced4da' }}
          >
            {translatedPriority}
          </span>
        </div>

        {/* Status-Badge */}
        <span
          className={`status-badge ${statusColorMap[task.status] || ''}`}
          style={{ marginBottom: '0.4rem' }}
        >
          {translatedStatus}
        </span>

        {/* Beschreibung */}
        {task.description && (
          <p style={{ margin: '0.2rem 0 0.4rem', fontStyle: 'italic' }}>
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="task-tags">
            {task.tags.map((tag, idx) => (
              <span key={idx} className="task-tag-pill">{tag}</span>
            ))}
          </div>
        )}

        {/* Deadline => Badge */}
        {task.deadline && (
          <span
            className={`deadline-badge ${isOverdue ? 'overdue' : ''}`}
            style={{ marginLeft: '0.5rem' }}
            title={isOverdue ? t.overdueTooltip : deadlineBadge}
          >
            {deadlineBadge}
          </span>
        )}

        {/* Action-Buttons */}
        <div className="task-actions">
          <button className="btn-edit" onClick={() => onEdit(task)}>
            {t.edit}
          </button>
          <button className="btn-delete" onClick={() => onDelete(task.id)}>
            {t.delete}
          </button>
        </div>
      </div>
    </div>
  )
}

/* Time Range Tabs */
function TimeRangeTabs({ timeRange, setTimeRange, t }) {
  return (
    <div className="time-range-tabs">
      <button
        className={timeRange === 'today' ? 'active no-hover-on-active' : ''}
        onClick={() => setTimeRange('today')}
      >
        {t.timeRangeToday}
      </button>
      <button
        className={timeRange === 'week' ? 'active no-hover-on-active' : ''}
        onClick={() => setTimeRange('week')}
      >
        {t.timeRangeWeek}
      </button>
      <button
        className={timeRange === 'month' ? 'active no-hover-on-active' : ''}
        onClick={() => setTimeRange('month')}
      >
        {t.timeRangeMonth}
      </button>
    </div>
  )
}

/* Hilfsfn => Deadline in X Tagen? */
function isWithinDays(deadline, days) {
  if (!deadline) return false
  const dl = new Date(deadline)
  const now = new Date()
  return (dl - now >= 0 && (dl - now) <= days * 24*60*60*1000)
}

/* Aufgabenfortschritt => PieChart + Legend */
function Aufgabenfortschritt({ tasks, darkMode, colorScheme, t }) {
  const [timeRange, setTimeRange] = useState('today')

  let filtered = []
  if (timeRange === 'today') {
    filtered = tasks.filter(tk => {
      if (!tk.deadline) return false
      const dl = new Date(tk.deadline)
      const now = new Date()
      return dl.toDateString() === now.toDateString()
    })
  } else if (timeRange === 'week') {
    filtered = tasks.filter(tk => isWithinDays(tk.deadline, 7))
  } else {
    filtered = tasks.filter(tk => isWithinDays(tk.deadline, 30))
  }

  const offenCount = filtered.filter(x => x.status === 'Offen').length
  const inBearbCount = filtered.filter(x => x.status === 'In Bearbeitung').length
  const erledigtCount = filtered.filter(x => x.status === 'Erledigt').length

  let data = [
    { name: t.statuses['Offen'], value: offenCount, color: '#0d6efd' },
    { name: t.statuses['In Bearbeitung'], value: inBearbCount, color: '#fd7e14' },
    { name: t.statuses['Erledigt'], value: erledigtCount, color: '#198754' }
  ]

  // «Immer Diagramm anzeigen», auch wenn 0
  const totalCount = offenCount + inBearbCount + erledigtCount
  if (totalCount === 0) {
    data = [{ name: 'Keine Aufgaben', value: 1, color: '#ccc' }]
  }

  return (
    <div className="widget-box">
      <div className="widget-header-noncollapse">
        <h4>{t.tasksProgress}</h4>
      </div>
      <div className="widget-content">
        <TimeRangeTabs timeRange={timeRange} setTimeRange={setTimeRange} t={t} />
        {totalCount > 0 ? (
          <p style={{ marginBottom: '0.6rem' }}>
            {t.statuses['Offen']}: {offenCount} | {t.statuses['In Bearbeitung']}: {inBearbCount} | {t.statuses['Erledigt']}: {erledigtCount}
            <br />
            (Summe: {offenCount + inBearbCount + erledigtCount})
          </p>
        ) : (
          <p style={{ marginBottom: '0.6rem' }}>Keine Aufgaben im ausgewählten Zeitraum.</p>
        )}

        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={50}
                outerRadius={60}
                paddingAngle={4}
                stroke={darkMode ? '#333' : '#fff'}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
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

        {/* Kleine Legende */}
        <div className="chart-legend">
          {data.map((item, i) => (
            <div key={i} className="legend-item">
              <div className="legend-color-box" style={{ background: item.color }} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* Gewohnheitsfortschritt => Ebenfalls PieChart + Legend */
function Gewohnheitsfortschritt({ habits, darkMode, t }) {
  const [timeRange, setTimeRange] = useState('today')

  // fiktive Filter
  let filtered = []
  if (timeRange === 'today') {
    filtered = habits.slice(0, 1)
  } else if (timeRange === 'week') {
    filtered = habits.slice(0, 2)
  } else {
    filtered = habits
  }

  const total = filtered.length
  const done = filtered.filter(h => h.completed).length
  const open = total - done

  let data = [
    { name: t.statuses['Offen'], value: open, color: '#0d6efd' },
    { name: t.statuses['Erledigt'], value: done, color: '#198754' }
  ]

  // Auch hier: immer Diagramm zeigen
  if (total === 0) {
    data = [{ name: 'Keine Gewohnheiten', value: 1, color: '#ccc' }]
  }

  return (
    <div className="widget-box">
      <div className="widget-header-noncollapse">
        <h4>{t.habitsProgress}</h4>
      </div>
      <div className="widget-content">
        <TimeRangeTabs timeRange={timeRange} setTimeRange={setTimeRange} t={t} />
        {total > 0 ? (
          <p style={{ marginBottom: '0.6rem' }}>
            {t.statuses['Offen']}: {open} | {t.statuses['Erledigt']}: {done}
            <br />
            (Summe: {total})
          </p>
        ) : (
          <p style={{ marginBottom: '0.6rem' }}>Keine Gewohnheiten im ausgewählten Zeitraum.</p>
        )}

        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={50}
                outerRadius={60}
                paddingAngle={4}
                stroke={darkMode ? '#333' : '#fff'}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
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

        <div className="chart-legend">
          {data.map((item, i) => (
            <div key={i} className="legend-item">
              <div className="legend-color-box" style={{ background: item.color }} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* Mini-Kalender */
function MiniCalendar({ tasks, t, darkMode }) {
  const [selectedDayTasks, setSelectedDayTasks] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDayOfMonth = new Date(year, month, 1)
  const startDay = firstDayOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  let calendarDays = []
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d)
  }

  const tasksInMonth = tasks.filter(tk => {
    if (!tk.deadline) return false
    const dl = new Date(tk.deadline)
    return dl.getFullYear() === year && dl.getMonth() === month
  })

  const handleDayClick = (day) => {
    if (!day) return
    const clickedDate = new Date(year, month, day)
    setSelectedDate(clickedDate)

    const dayTasks = tasks.filter(tk => {
      if (!tk.deadline) return false
      const dl = new Date(tk.deadline)
      return dl.toDateString() === clickedDate.toDateString()
    })
    setSelectedDayTasks(dayTasks)
  }

  return (
    <div className="mini-calendar-widget widget-box">
      <div className="widget-header-noncollapse">
        <h4>{t.miniCalendar}</h4>
      </div>
      <div className="mini-calendar-content">
        <div className="mini-calendar-grid">
          {['So','Mo','Di','Mi','Do','Fr','Sa'].map((wd, i) => (
            <div key={i} className="mini-calendar-dayname">{wd}</div>
          ))}
          {calendarDays.map((day, idx) => {
            const isToday = (day === today.getDate())
            const hasTasks = tasksInMonth.some(tk => {
              const dl = new Date(tk.deadline)
              return dl.getDate() === day
            })
            return (
              <div
                key={idx}
                className={
                  `mini-calendar-daycell
                   ${isToday ? 'mini-calendar-today' : ''}
                   ${day ? '' : 'empty-cell'}
                   ${hasTasks ? 'has-deadline' : ''}`
                }
                onClick={() => handleDayClick(day)}
              >
                {day || ''}
              </div>
            )
          })}
        </div>

        {selectedDate && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
            <strong>{selectedDate.toLocaleDateString()}</strong>
            {selectedDayTasks.length > 0 ? (
              <ul>
                {selectedDayTasks.map(tk => (
                  <li key={tk.id}>{tk.title}</li>
                ))}
              </ul>
            ) : (
              <p>{t.noDueTasks}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* Hauptkomponente (Dashboard) */
export default function Dashboard() {
  const [userName, setUserName] = useState('Lars')
  const [avatarUrl, setAvatarUrl] = useState('https://randomuser.me/api/portraits/men/3.jpg')
  const [darkMode, setDarkMode] = useState(false)
  const [colorScheme, setColorScheme] = useState('#0d6efd')
  const [energyLevel, setEnergyLevel] = useState(100)
  const [language, setLanguage] = useState('de')
  const [batteryTransition, setBatteryTransition] = useState(false)

  const [showProfile, setShowProfile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Übersetzungen
  const t = translations[language] || translations.de

  // Begrüssung
  const hour = new Date().getHours()
  let greetingTime = t.greetingMorning
  if (hour >= 12 && hour < 18) greetingTime = t.greetingAfternoon
  else if (hour >= 18 || hour < 5) greetingTime = t.greetingEvening

  let batteryColor = '#51cf66'
  if (energyLevel < 30) batteryColor = '#ff6b6b'
  else if (energyLevel < 60) batteryColor = '#ffa94d'

  // Profile loading from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('userProfile_v2')
    if (saved) {
      const parsed = JSON.parse(saved)
      setUserName(parsed.userName || 'Lars')
      setAvatarUrl(parsed.avatarUrl || '')
      setDarkMode(!!parsed.darkMode)
      setColorScheme(parsed.colorScheme || '#0d6efd')
      setEnergyLevel(parsed.energyLevel || 100)
      setLanguage(parsed.language || 'de')
    }
  }, [])

  // Profile storing
  useEffect(() => {
    const data = {
      userName,
      avatarUrl,
      darkMode,
      colorScheme,
      energyLevel,
      language
    }
    localStorage.setItem('userProfile_v2', JSON.stringify(data))
  }, [userName, avatarUrl, darkMode, colorScheme, energyLevel, language])

  // CSS-Farb-Variable
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', colorScheme)
  }, [colorScheme])

  // Battery transition
  useEffect(() => {
    setBatteryTransition(true)
    const t = setTimeout(() => setBatteryTransition(false), 300)
    return () => clearTimeout(t)
  }, [energyLevel])

  const handleAvatarUpload = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setAvatarUrl(ev.target.result)
    reader.readAsDataURL(file)
  }

  /* Fokus-Aufgaben */
  const [focusTasks, setFocusTasks] = useState([])
  useEffect(() => {
    const data = localStorage.getItem('focusTasks_v2')
    if (data) {
      const parsed = JSON.parse(data)
      if (parsed.date === new Date().toDateString()) {
        setFocusTasks(parsed.tasks)
      }
    }
  }, [])
  useEffect(() => {
    localStorage.setItem('focusTasks_v2', JSON.stringify({
      date: new Date().toDateString(),
      tasks: focusTasks
    }))
  }, [focusTasks])

  // Default
  useEffect(() => {
    if (focusTasks.length === 0) {
      setFocusTasks([
        { id: 'f1', title: 'Kurzer Spaziergang', done: false },
        { id: 'f2', title: '2-Min Stretching', done: false }
      ])
    }
  }, [])

  const toggleFocusTask = id =>
    setFocusTasks(prev => prev.map(x => x.id === id ? { ...x, done: !x.done } : x))
  const deleteFocusTask = id =>
    setFocusTasks(prev => prev.filter(x => x.id !== id))

  const [showFocusModal, setShowFocusModal] = useState(false)
  const [focusTitle, setFocusTitle] = useState('')
  const addFocusTask = () => {
    if (!focusTitle.trim()) return
    setFocusTasks([...focusTasks, { id: 'f'+Date.now(), title: focusTitle, done: false }])
    setFocusTitle('')
    setShowFocusModal(false)
  }
  const totalFocus = focusTasks.length
  const doneFocus = focusTasks.filter(x => x.done).length
  const focusPercent = totalFocus ? Math.round((doneFocus / totalFocus) * 100) : 0

  /* Tasks (Backend) */
  const [tasks, setTasks] = useState([])

  async function fetchTasks() {
    try {
      const resp = await fetch('http://localhost:5002/tasks')
      if (resp.ok) {
        const data = await resp.json()
        setTasks(data)
      }
    } catch (err) {
      console.error('Fehler beim Abrufen:', err)
    }
  }
  useEffect(() => { fetchTasks() }, [])

  // Drag & Drop
  const handleDragEnd = event => {
    const { active, over } = event
    if (!over) return
    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex(x => x.id === active.id)
      const newIndex = tasks.findIndex(x => x.id === over.id)
      setTasks(items => arrayMove(items, oldIndex, newIndex))
    }
  }

  // Filter
  const [taskSearchTerm, setTaskSearchTerm] = useState('')
  const [taskFilterStatus, setTaskFilterStatus] = useState('')
  const [taskFilterPriority, setTaskFilterPriority] = useState('')
  const [tagFilter, setTagFilter] = useState('')

  let filteredTasks = tasks.filter(x =>
    x.title.toLowerCase().includes(taskSearchTerm.toLowerCase())
  )
  if (taskFilterStatus && taskFilterStatus !== 'all') {
    filteredTasks = filteredTasks.filter(x => x.status === taskFilterStatus)
  }
  if (taskFilterPriority && taskFilterPriority !== 'all') {
    filteredTasks = filteredTasks.filter(x => x.priority === taskFilterPriority)
  }
  if (tagFilter.trim()) {
    filteredTasks = filteredTasks.filter(x =>
      x.tags && x.tags.some(tg => tg.toLowerCase().includes(tagFilter.toLowerCase()))
    )
  }

  // Task-Modal
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskStatus, setTaskStatus] = useState('Offen')
  const [taskPriority, setTaskPriority] = useState('Mittel')
  const [taskTags, setTaskTags] = useState('')
  const [taskDeadline, setTaskDeadline] = useState('')

  function handleAddTaskClick() {
    setEditingTask(null)
    setTaskTitle('')
    setTaskDescription('')
    setTaskStatus('Offen')
    setTaskPriority('Mittel')
    setTaskTags('')
    setTaskDeadline('')
    setShowTaskModal(true)
  }
  function handleEditTaskClick(task) {
    setEditingTask(task)
    setTaskTitle(task.title)
    setTaskDescription(task.description)
    setTaskStatus(task.status)
    setTaskPriority(task.priority)
    setTaskTags((task.tags || []).join(', '))
    setTaskDeadline(task.deadline ? task.deadline.substring(0, 10) : '')
    setShowTaskModal(true)
  }

  const [recentlyDeletedTask, setRecentlyDeletedTask] = useState(null)
  const [showUndoToast, setShowUndoToast] = useState(false)
  const undoTimerRef = React.useRef(null)

  async function handleDeleteTask(id) {
    const toDelete = tasks.find(x => x.id === id)
    if (!toDelete) return
    setRecentlyDeletedTask(toDelete)
    setTasks(prev => prev.filter(x => x.id !== id))
    setShowUndoToast(true)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => {
      setShowUndoToast(false)
      setRecentlyDeletedTask(null)
    }, 7000)
    try {
      await fetch(`http://localhost:5002/tasks/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.error(err)
    }
  }
  function handleUndoDelete() {
    if (!recentlyDeletedTask) return
    fetch(`http://localhost:5002/tasks/${recentlyDeletedTask.id}/undo`, { method: 'POST' })
      .then(r => r.json())
      .then(res => setTasks(prev => [...prev, res]))
      .catch(err => console.error(err))
    setRecentlyDeletedTask(null)
    setShowUndoToast(false)
  }

  async function saveTask() {
    if (!taskTitle.trim() || !taskDescription.trim()) {
      alert('Bitte Titel und Beschreibung eingeben!')
      return
    }
    const parsedTags = taskTags.split(',').map(t => t.trim()).filter(Boolean)
    if (editingTask) {
      // Update
      const updated = {
        ...editingTask,
        title: taskTitle,
        description: taskDescription,
        status: taskStatus,
        priority: taskPriority,
        tags: parsedTags,
        deadline: taskDeadline
      }
      try {
        const resp = await fetch(`http://localhost:5002/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        })
        const data = await resp.json()
        setTasks(prev => prev.map(x => x.id === editingTask.id ? data : x))
      } catch (err) {
        console.error(err)
      }
    } else {
      // Create
      const newTask = {
        title: taskTitle,
        description: taskDescription,
        status: taskStatus,
        priority: taskPriority,
        tags: parsedTags,
        deadline: taskDeadline
      }
      try {
        const resp = await fetch('http://localhost:5002/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
        })
        const created = await resp.json()
        setTasks(prev => [...prev, created])
      } catch (err) {
        console.error(err)
      }
    }
    setShowTaskModal(false)
  }

  /* Gewohnheiten, Ziele, Vision => minimal */
  const [habits, setHabits] = useState([
    { id: 'h1', name: 'Meditation', completed: false },
    { id: 'h2', name: 'Tagebuch schreiben', completed: true }
  ])
  const [showHabitModal, setShowHabitModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [habitName, setHabitName] = useState('')
  function handleAddHabit() {
    setEditingHabit(null)
    setHabitName('')
    setShowHabitModal(true)
  }
  function handleEditHabit(h) {
    setEditingHabit(h)
    setHabitName(h.name)
    setShowHabitModal(true)
  }
  function handleDeleteHabit(id) {
    setHabits(prev => prev.filter(x => x.id !== id))
  }
  function toggleHabit(id) {
    setHabits(prev => prev.map(x => x.id === id ? { ...x, completed: !x.completed } : x))
  }
  function saveHabit() {
    if (!habitName.trim()) return
    if (editingHabit) {
      setHabits(prev => prev.map(x => x.id === editingHabit.id ? { ...x, name: habitName } : x))
    } else {
      setHabits([...habits, {
        id: 'h' + Date.now(),
        name: habitName,
        completed: false
      }])
    }
    setShowHabitModal(false)
  }

  const [goals, setGoals] = useState([
    {
      id: 'g1',
      title: 'Q1: 5 kg abnehmen',
      progress: 20,
      milestones: ['Sportplan erstellen', 'Ernährungsplan anpassen', 'Startmessung']
    },
    {
      id: 'g2',
      title: 'Q2: Neue Geschäftsidee validieren',
      progress: 40,
      milestones: ['Ideenfindung', 'Umfragen durchführen', 'Prototyp basteln']
    },
    {
      id: 'g3',
      title: 'Q3: Eigene Website launchen',
      progress: 80,
      milestones: ['Domain sichern', 'Layout entwerfen', 'Beta-Version online']
    },
    {
      id: 'g4',
      title: 'Q4: Buch-Projekt starten',
      progress: 0,
      milestones: ['Idee skizzieren', 'Kapitelstruktur planen', 'Recherchethemen sammeln']
    }
  ])
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [goalTitle, setGoalTitle] = useState('')
  const [goalProgress, setGoalProgress] = useState(0)
  const [goalMilestones, setGoalMilestones] = useState([])
  const [newMilestone, setNewMilestone] = useState('')

  function handleAddGoal() {
    setEditingGoal(null)
    setGoalTitle('')
    setGoalProgress(0)
    setGoalMilestones([])
    setShowGoalModal(true)
  }
  function handleEditGoal(g) {
    setEditingGoal(g)
    setGoalTitle(g.title)
    setGoalProgress(g.progress)
    setGoalMilestones(g.milestones || [])
    setShowGoalModal(true)
  }
  function handleDeleteGoal(id) {
    setGoals(prev => prev.filter(x => x.id !== id))
  }
  function updateGoalProgress(id, delta) {
    setGoals(prev =>
      prev.map(g => g.id === id
        ? { ...g, progress: Math.min(100, Math.max(0, g.progress + delta)) }
        : g
      )
    )
  }
  function addMilestone() {
    if (!newMilestone.trim()) return
    setGoalMilestones(prev => [...prev, newMilestone.trim()])
    setNewMilestone('')
  }
  function removeMilestone(i) {
    setGoalMilestones(prev => prev.filter((_, idx) => idx !== i))
  }
  function saveGoal() {
    if (!goalTitle.trim()) return
    if (editingGoal) {
      // Update
      setGoals(prev =>
        prev.map(g => g.id === editingGoal.id
          ? { ...g, title: goalTitle, progress: goalProgress, milestones: goalMilestones }
          : g
        )
      )
    } else {
      setGoals([...goals, {
        id: 'g' + Date.now(),
        title: goalTitle,
        progress: goalProgress,
        milestones: goalMilestones
      }])
    }
    setShowGoalModal(false)
    setNewMilestone('')
  }

  const [visionItems, setVisionItems] = useState([
    { id: 'v1', title: 'Finanzielle Freiheit', description: 'Passives Einkommen aufbauen' }
  ])
  const [showVisionModal, setShowVisionModal] = useState(false)
  const [editingVision, setEditingVision] = useState(null)
  const [visionTitle, setVisionTitle] = useState('')
  const [visionDesc, setVisionDesc] = useState('')
  function handleAddVision() {
    setEditingVision(null)
    setVisionTitle('')
    setVisionDesc('')
    setShowVisionModal(true)
  }
  function handleEditVision(v) {
    setEditingVision(v)
    setVisionTitle(v.title)
    setVisionDesc(v.description)
    setShowVisionModal(true)
  }
  function handleDeleteVision(id) {
    setVisionItems(prev => prev.filter(x => x.id !== id))
  }
  function saveVision() {
    if (!visionTitle.trim()) return
    if (editingVision) {
      setVisionItems(prev =>
        prev.map(x => x.id === editingVision.id
          ? { ...x, title: visionTitle, description: visionDesc }
          : x
        )
      )
    } else {
      setVisionItems([...visionItems, {
        id: 'v' + Date.now(),
        title: visionTitle,
        description: visionDesc
      }])
    }
    setShowVisionModal(false)
  }

  /* KI-Assistent */
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assistantMessages, setAssistantMessages] = useState([
    { sender: 'assistant', text: 'Heute hast du viele offene Aufgaben, möchtest du Unterstützung?' }
  ])
  const [assistantInput, setAssistantInput] = useState('')
  const toggleAssistant = () => setAssistantOpen(!assistantOpen)
  const sendAssistantMessage = () => {
    if (!assistantInput.trim()) return
    const userMsg = { sender: 'user', text: assistantInput }
    const aiMsg = { sender: 'assistant', text: 'Danke für deine Anfrage. (Simuliert)' }
    setAssistantMessages(prev => [...prev, userMsg, aiMsg])
    setAssistantInput('')
  }
  function handleAssistantQuickAction(action) {
    switch (action) {
      case 'task': handleAddTaskClick(); break
      case 'habit': handleAddHabit(); break
      case 'goal': handleAddGoal(); break
      case 'focus': setShowFocusModal(true); break
      default: break
    }
  }

  // Tabs
  const [activeTab, setActiveTab] = useState('dashboard')
  const getTabButtonClass = tabKey => activeTab === tabKey ? 'active no-hover-on-active' : ''

  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false)

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* TOP-BAR */}
      <header className="topbar">
        <div className="topbar-row">
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>

          <div className="topbar-left">
            <div className="topbar-logo-container">
              <h1 className="topbar-logo">{t.productivityFramework}</h1>
              <p className="topbar-subtitle">{greetingTime}, {userName}!</p>
            </div>

            <div className="topbar-tabs">
              <button
                className={getTabButtonClass('dashboard')}
                onClick={() => setActiveTab('dashboard')}
              >
                {t.tabDashboard}
              </button>
              <button
                className={getTabButtonClass('tasks')}
                onClick={() => (window.location.href = '/tasks')}
              >
                {t.tabTasks}
              </button>
            </div>
          </div>

          {/* Battery + Avatar */}
          <div className="topbar-energy-container">
            <div className={`battery-widget ${batteryTransition ? 'battery-animate' : ''}`}>
              <div className="battery-icon">
                <div
                  className="battery-level"
                  style={{
                    width: energyLevel + '%',
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
            style={{ cursor: 'pointer' }}
            onClick={() => setShowProfile(true)}
          >
            <img src={avatarUrl} alt="Avatar" className="avatar" />
          </div>
        </div>
      </header>

      {/* GRID-LAYOUT */}
      <div className="layout">
        {/* Widgets-Sidebar */}
        <aside className="widgets-column">
          {/* Fokus-Widget */}
          <CollapsibleWidget title={t.widgetFocus} defaultOpen={true}>
            <div className="focus-tasklist">
              {focusTasks.map(ft => (
                <div key={ft.id} className="focus-item">
                  <input
                    type="checkbox"
                    checked={ft.done}
                    onChange={() => toggleFocusTask(ft.id)}
                  />
                  <span className={ft.done ? 'done' : ''}>{ft.title}</span>
                  <button
                    className="focus-delete-btn"
                    onClick={() => deleteFocusTask(ft.id)}
                  >
                    {t.delete}
                  </button>
                </div>
              ))}
            </div>
            <button className="focus-add-btn" onClick={() => setShowFocusModal(true)}>
              {t.newHabit} {/* «+ Neu» – passt hier als Platzhalter */}
            </button>
            <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
              {t.progress}: {focusPercent}%
            </p>
          </CollapsibleWidget>

          {/* Aufgabenfortschritt */}
          <Aufgabenfortschritt
            tasks={tasks}
            darkMode={darkMode}
            colorScheme={colorScheme}
            t={t}
          />

          {/* Gewohnheitsfortschritt */}
          <Gewohnheitsfortschritt
            habits={habits}
            darkMode={darkMode}
            t={t}
          />

          {/* Mini-Kalender */}
          <MiniCalendar
            tasks={tasks}
            t={t}
            darkMode={darkMode}
          />

          {/* Einstellungen */}
          <CollapsibleWidget title={t.widgetSettings} defaultOpen={false}>
            <div className="user-settings" style={{ paddingTop: '0.6rem' }}>
              <h5 style={{ margin: '0.5rem 0 0.3rem', fontSize: '1rem' }}>
                {t.userSettingsGeneral}
              </h5>
              <label>
                {t.userNameLabel}:
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                />
              </label>
              <label>
                {t.userAvatarUrlLabel}:
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                />
              </label>
              <label>
                {t.userOrUpload}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </label>
              <label>
                {t.userDarkmode}:
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={e => setDarkMode(e.target.checked)}
                />
              </label>
              <label>
                {t.userColorScheme}:
                <input
                  type="color"
                  value={colorScheme}
                  onChange={e => setColorScheme(e.target.value)}
                />
              </label>

              <hr style={{ margin: '1rem 0' }} />

              <h5 style={{ margin: '0.5rem 0 0.3rem', fontSize: '1rem' }}>
                {t.userSettingsSystem}
              </h5>
              <label>
                {t.widgetLanguage}:
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
                {t.userNotifications}
                <input type="checkbox" defaultChecked />
              </label>
              <label>
                {t.userDateFormat}
                <select defaultValue="DD.MM.YYYY">
                  <option value="DD.MM.YYYY">TT.MM.JJJJ</option>
                  <option value="YYYY-MM-DD">JJJJ-MM-TT</option>
                </select>
              </label>
            </div>
          </CollapsibleWidget>
        </aside>

        {/* Main-Area (Dashboard) */}
        <main className="main-area">
          <div className="main-content-vertical">
            {activeTab === 'dashboard' && (
              <>
                <section className="tasks-section">
                  <h2>
                    {t.tasksHeader}
                    <button onClick={handleAddTaskClick}>
                      {t.newTask}
                    </button>
                  </h2>

                  {/* Filter */}
                  <div className="tasks-search-filter">
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={taskSearchTerm}
                      onChange={e => setTaskSearchTerm(e.target.value)}
                    />
                    <select
                      value={taskFilterStatus}
                      onChange={e => setTaskFilterStatus(e.target.value)}
                    >
                      <option value="all">{t.all}</option>
                      <option value="Offen">{t.statuses['Offen']}</option>
                      <option value="In Bearbeitung">{t.statuses['In Bearbeitung']}</option>
                      <option value="Erledigt">{t.statuses['Erledigt']}</option>
                    </select>
                    <select
                      value={taskFilterPriority}
                      onChange={e => setTaskPriority(e.target.value)}
                    >
                      <option value="all">{t.all}</option>
                      <option value="Hoch">{t.priorities['Hoch']}</option>
                      <option value="Mittel">{t.priorities['Mittel']}</option>
                      <option value="Niedrig">{t.priorities['Niedrig']}</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Tags suchen …"
                      value={tagFilter}
                      onChange={e => setTagFilter(e.target.value)}
                      style={{ width: '120px' }}
                    />
                  </div>

                  <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={filteredTasks.map(x => x.id)} strategy={verticalListSortingStrategy}>
                      <div className="tasks-list">
                        {filteredTasks.map((task, index) => (
                          <SortableTaskCard
                            key={task.id}
                            task={task}
                            darkMode={darkMode}
                            bgColor={[
                              '#FBF8CC','#FDE4CF','#F1C0E8','#CFBAF0',
                              '#A3C4F3','#90DBF4','#8EECF5','#98F5E1',
                              '#B9FBC0'
                            ][index % 9]}
                            onEdit={handleEditTaskClick}
                            onDelete={handleDeleteTask}
                            t={t}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </section>

                {/* Vision + Habits */}
                <section className="vision-habits-section">
                  <div className="vision-board">
                    <h3>{t.visionBoardHeader}</h3>
                    <button onClick={handleAddVision}>+ Vision</button>
                    {visionItems.map(v => (
                      <div key={v.id} className="vision-item">
                        <h4>{v.title}</h4>
                        <p>{v.description}</p>
                        <span
                          style={{ position: 'absolute', top: 4, right: 40, cursor: 'pointer' }}
                          onClick={() => handleEditVision(v)}
                        >
                          ✎
                        </span>
                        <span
                          style={{ position: 'absolute', top: 4, right: 10, cursor: 'pointer', color: 'red' }}
                          onClick={() => handleDeleteVision(v.id)}
                        >
                          🗑
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="habits-panel">
                    <h3>{t.habitsHeader}</h3>
                    <button onClick={handleAddHabit}>
                      {t.newHabit}
                    </button>
                    <ul>
                      {habits.map(h => (
                        <li
                          key={h.id}
                          className={h.completed ? 'completed' : ''}
                          onClick={() => toggleHabit(h.id)}
                          style={{ position: 'relative' }}
                        >
                          {h.name}
                          <span
                            style={{ position: 'absolute', right: '2.5rem', cursor: 'pointer' }}
                            onClick={e => {
                              e.stopPropagation()
                              handleEditHabit(h)
                            }}
                          >
                            ✎
                          </span>
                          <span
                            style={{ position: 'absolute', right: '1rem', cursor: 'pointer', color: 'red' }}
                            onClick={e => {
                              e.stopPropagation()
                              handleDeleteHabit(h.id)
                            }}
                          >
                            🗑
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                {/* Goals => 4 Quartalsziele */}
                <section className="goals-section">
                  <h2>
                    {t.goalsHeader}
                    <button onClick={handleAddGoal}>
                      {t.newGoal}
                    </button>
                  </h2>
                  <div className="goals-container">
                    {goals.map(g => (
                      <div key={g.id} className="goal-card">
                        <div className="goal-info">
                          <span className="goal-title">{g.title}</span>
                          <span className="goal-progress-label">{g.progress}%</span>
                        </div>
                        <div className="goal-progressbar">
                          <div
                            className="goal-progress-fill"
                            style={{ width: `${g.progress}%` }}
                          />
                        </div>
                        {/* Meilensteine */}
                        {g.milestones && g.milestones.length > 0 && (
                          <ul className="milestones-list">
                            {g.milestones.map((m, i) => (
                              <li key={i}>
                                <span
                                  className="milestone-delete"
                                  onClick={() => {
                                    setGoals(prev => prev.map(x => {
                                      if (x.id === g.id) {
                                        const newArr = [...x.milestones]
                                        newArr.splice(i,1)
                                        return { ...x, milestones: newArr }
                                      }
                                      return x
                                    }))
                                  }}
                                >
                                  ×
                                </span>
                                {m}
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="goal-buttons">
                          <button onClick={() => updateGoalProgress(g.id, 10)}>+10%</button>
                          <button onClick={() => updateGoalProgress(g.id, -10)}>-10%</button>
                          <button onClick={() => handleEditGoal(g)}>{t.edit}</button>
                          <button
                            className="btn-delete-goal"
                            onClick={() => handleDeleteGoal(g.id)}
                          >
                            {t.delete}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>

      {/* KI-Assistent */}
      {assistantOpen && (
        <div className="assistant-widget">
          <div className="assistant-header">
            <h4>{t.assistantTitle}</h4>
          </div>
          <div className="assistant-body">
            {assistantMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`assistant-message ${msg.sender === 'user' ? 'user' : 'ai'}`}
              >
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="assistant-footer">
            <input
              type="text"
              placeholder="Frage eingeben …"
              value={assistantInput}
              onChange={e => setAssistantInput(e.target.value)}
            />
            <button onClick={sendAssistantMessage}>OK</button>
          </div>
          <div className="assistant-quick-actions">
            <p>{t.quickActions}:</p>
            <button onClick={() => handleAssistantQuickAction('task')}>{t.newTaskAction}</button>
            <button onClick={() => handleAssistantQuickAction('habit')}>{t.newHabitAction}</button>
            <button onClick={() => handleAssistantQuickAction('goal')}>{t.newGoalAction}</button>
            <button onClick={() => handleAssistantQuickAction('focus')}>{t.newFocusAction}</button>
          </div>
        </div>
      )}
      <button className="assistant-button" onClick={toggleAssistant}>
        {assistantOpen ? t.assistantClose : t.assistantOpen}
      </button>

      {/* Quick-Add FAB */}
      <div className="quick-add-container">
        <button className="quick-add-fab" onClick={() => setShowQuickAddMenu(!showQuickAddMenu)}>
          +
        </button>
        {showQuickAddMenu && (
          <div className="quick-add-menu">
            <button onClick={handleAddTaskClick}>{t.quickAddTask}</button>
            <button onClick={handleAddHabit}>{t.quickAddHabit}</button>
            <button onClick={handleAddGoal}>{t.quickAddGoal}</button>
          </div>
        )}
      </div>

      {/* Undo Toast */}
      {showUndoToast && (
        <div className="undo-toast">
          <span>{t.undoToastText}</span>
          <button onClick={handleUndoDelete}>{t.undone}</button>
        </div>
      )}

      {/* MODALS */}
      <Modal
        show={showFocusModal}
        onClose={() => setShowFocusModal(false)}
        title={t.addFocusTitle}
      >
        <label>
          Titel:
          <input
            type="text"
            value={focusTitle}
            onChange={e => setFocusTitle(e.target.value)}
          />
        </label>
        <button onClick={addFocusTask}>{t.add}</button>
      </Modal>

      <Modal
        show={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={editingTask ? t.editTaskTitle : t.addTaskTitle}
      >
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
            rows="3"
            value={taskDescription}
            onChange={e => setTaskDescription(e.target.value)}
          />
        </label>

        {/* Status jetzt als Select statt Radio-Buttons */}
        <label>
          Status:
          <select
            value={taskStatus}
            onChange={e => setTaskStatus(e.target.value)}
          >
            <option value="Offen">{t.statuses['Offen']}</option>
            <option value="In Bearbeitung">{t.statuses['In Bearbeitung']}</option>
            <option value="Erledigt">{t.statuses['Erledigt']}</option>
          </select>
        </label>

        <label>
          Priorität:
          <select
            value={taskPriority}
            onChange={e => setTaskPriority(e.target.value)}
          >
            <option value="Niedrig">{t.priorities['Niedrig']}</option>
            <option value="Mittel">{t.priorities['Mittel']}</option>
            <option value="Hoch">{t.priorities['Hoch']}</option>
          </select>
        </label>

        <label>
          {t.tagsLabel}:
          <input
            type="text"
            value={taskTags}
            onChange={e => setTaskTags(e.target.value)}
          />
        </label>

        <label>
          {t.deadlineLabel}:
          <input
            type="date"
            value={taskDeadline}
            onChange={e => setTaskDeadline(e.target.value)}
          />
        </label>
        <button onClick={saveTask}>
          {editingTask ? t.edit : t.add}
        </button>
      </Modal>

      <Modal
        show={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        title={editingHabit ? t.editHabitTitle : t.addHabitTitle}
      >
        <label>
          Name:
          <input
            type="text"
            value={habitName}
            onChange={e => setHabitName(e.target.value)}
          />
        </label>
        <button onClick={saveHabit}>
          {editingHabit ? t.edit : t.add}
        </button>
      </Modal>

      {/* Goals => Meilensteine */}
      <Modal
        show={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        title={editingGoal ? t.editGoalTitle : t.addGoalTitle}
      >
        <label>
          Titel:
          <input
            type="text"
            value={goalTitle}
            onChange={e => setGoalTitle(e.target.value)}
          />
        </label>
        <label>
          Fortschritt (%):
          <input
            type="number"
            min="0"
            max="100"
            value={goalProgress}
            onChange={e => setGoalProgress(Number(e.target.value))}
          />
        </label>

        <div>
          <p style={{ margin: '0.5rem 0 0.3rem' }}>Meilensteine:</p>
          {goalMilestones.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.3rem' }}>
              <span style={{ flex: 1 }}>{m}</span>
              <button
                style={{
                  background: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  padding: '0.2rem 0.4rem',
                  marginLeft: '0.5rem'
                }}
                onClick={() => setGoalMilestones(prev => prev.filter((_, idx) => idx !== i))}
              >
                ×
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', marginTop: '0.3rem' }}>
            <input
              type="text"
              value={newMilestone}
              onChange={e => setNewMilestone(e.target.value)}
              placeholder="Neuer Meilenstein"
              style={{ flex: 1 }}
            />
            <button
              style={{ marginLeft: '0.4rem' }}
              onClick={() => {
                if (!newMilestone.trim()) return
                setGoalMilestones(prev => [...prev, newMilestone.trim()])
                setNewMilestone('')
              }}
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            if (!goalTitle.trim()) return
            if (editingGoal) {
              // Update
              setGoals(prev =>
                prev.map(g => g.id === editingGoal.id
                  ? { ...g, title: goalTitle, progress: goalProgress, milestones: goalMilestones }
                  : g
                )
              )
            } else {
              // New
              setGoals([...goals, {
                id: 'g'+Date.now(),
                title: goalTitle,
                progress: goalProgress,
                milestones: goalMilestones
              }])
            }
            setShowGoalModal(false)
            setNewMilestone('')
          }}
          style={{ marginTop: '1rem' }}
        >
          {editingGoal ? t.edit : t.add}
        </button>
      </Modal>

      {/* Vision */}
      <Modal
        show={showVisionModal}
        onClose={() => setShowVisionModal(false)}
        title={editingVision ? t.editVisionTitle : t.addVisionTitle}
      >
        <label>
          Titel:
          <input
            type="text"
            value={visionTitle}
            onChange={e => setVisionTitle(e.target.value)}
          />
        </label>
        <label>
          Beschreibung:
          <textarea
            rows="3"
            value={visionDesc}
            onChange={e => setVisionDesc(e.target.value)}
          />
        </label>
        <button onClick={saveVision}>
          {editingVision ? t.edit : t.add}
        </button>
      </Modal>

      {/* Profil-Modal */}
      <Modal
        show={showProfile}
        onClose={() => setShowProfile(false)}
        title={t.profileTitle}
      >
        <div>
          <p>{t.profileHint}</p>
          <hr />
          <p><strong>Name:</strong> {userName}</p>
          <p>
            <strong>Avatar:</strong>{' '}
            <img
              src={avatarUrl}
              alt="avatar"
              style={{ width: 60, borderRadius: '50%' }}
            />
          </p>
        </div>
      </Modal>
    </div>
  )
}