import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import AssistantWidget from '../assistantWidget/AssistantWidget.jsx'
import Modal from '../modal/modal.jsx'
import '../layout/layout.css'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

// Utility function: Check if a deadline is within a given number of days
function isWithinDays(deadline, days) {
  if (!deadline) return false
  const dl = new Date(deadline)
  const now = new Date()
  return dl - now >= 0 && dl - now <= days * 24 * 60 * 60 * 1000
}

// Global translations for UI texts
const globalTranslations = {
  de: {
    greetingMorning: "Guten Morgen",
    greetingAfternoon: "Guten Nachmittag",
    greetingEvening: "Guten Abend",
    focusHeader: "Heutiger Fokus",
    taskProgressHeader: "Aufgabenfortschritt",
    habitProgressHeader: "Gewohnheitsfortschritt",
    calendarHeader: "Kalender",
    settingsHeader: "Einstellungen",
    dashboardTab: "Dashboard",
    tasksTab: "Aufgaben"
  },
  en: {
    greetingMorning: "Good Morning",
    greetingAfternoon: "Good Afternoon",
    greetingEvening: "Good Evening",
    focusHeader: "Today's Focus",
    taskProgressHeader: "Task Progress",
    habitProgressHeader: "Habit Progress",
    calendarHeader: "Calendar",
    settingsHeader: "Settings",
    dashboardTab: "Dashboard",
    tasksTab: "Tasks"
  },
  fr: {
    greetingMorning: "Bonjour",
    greetingAfternoon: "Bon après-midi",
    greetingEvening: "Bonsoir",
    focusHeader: "Focalisation d'aujourd'hui",
    taskProgressHeader: "Progression des tâches",
    habitProgressHeader: "Progression des habitudes",
    calendarHeader: "Calendrier",
    settingsHeader: "Paramètres",
    dashboardTab: "Tableau de bord",
    tasksTab: "Tâches"
  }
}

// Returns a greeting based on current time and language
function getGreeting(lang) {
  const hour = new Date().getHours()
  if (lang === 'en') {
    if (hour >= 5 && hour < 12) return globalTranslations.en.greetingMorning
    if (hour >= 12 && hour < 18) return globalTranslations.en.greetingAfternoon
    return globalTranslations.en.greetingEvening
  } else if (lang === 'fr') {
    if (hour >= 5 && hour < 12) return globalTranslations.fr.greetingMorning
    if (hour >= 12 && hour < 18) return globalTranslations.fr.greetingAfternoon
    return globalTranslations.fr.greetingEvening
  } else {
    if (hour >= 5 && hour < 12) return globalTranslations.de.greetingMorning
    if (hour >= 12 && hour < 18) return globalTranslations.de.greetingAfternoon
    return globalTranslations.de.greetingEvening
  }
}

/**
 * MentalNote Component
 * Displays a reflective note based on the current energy level.
 * For each energy level (low, medium, high), 5 different messages are provided in each language.
 * The note auto-hides after 10 seconds.
 */
function MentalNote({ energyLevel, language }) {
  const messages = {
    de: {
      low: [
        "Fühlst Du Dich schwach? Gönn Dir eine Pause und atme tief durch.",
        "Niedrige Energie: Ein kurzer Spaziergang kann Wunder wirken.",
        "Vielleicht ist jetzt eine Ruhepause genau das Richtige.",
        "Dein Energielevel ist niedrig – denk an einen kleinen Power-Nap.",
        "Fühlst Du Dich schlapp? Eine kurze Auszeit könnte helfen."
      ],
      medium: [
        "Deine Energie ist moderat – kleine Pausen helfen, den Fokus zu behalten.",
        "Ein ausgewogenes Energielevel: Perfekt für produktives Arbeiten mit regelmäßigen Pausen.",
        "Moderate Energie: Denk daran, ab und zu kurz durchzuatmen.",
        "Nicht zu viel, nicht zu wenig – nutze kleine Pausen zur Erholung.",
        "Dein Energiepegel ist durchschnittlich – gönn Dir zwischendurch Erholungsphasen."
      ],
      high: [
        "Du sprühst vor Energie! Nutze diesen Schwung, aber vergiss nicht, auch mal abzuschalten.",
        "Hoher Energiepegel: Setz Deine Kraft klug ein und gönn Dir gelegentlich Pausen.",
        "Du bist voller Energie – ideal, um Großes zu erreichen, aber denk auch an dich.",
        "Volle Power! Jetzt ist der richtige Moment, um Deine Ziele anzugehen.",
        "Deine Energie ist hoch – aber auch der beste Tipp: Ein kurzes Innehalten tut manchmal gut."
      ]
    },
    en: {
      low: [
        "Feeling low on energy? Take a short break and breathe deeply.",
        "Low energy: A brief walk might work wonders.",
        "Maybe it's time for a quick rest.",
        "Your energy is low – consider a short power nap.",
        "Feeling drained? A mini-break could help."
      ],
      medium: [
        "Your energy is moderate – small breaks help you stay focused.",
        "Balanced energy: Perfect for productive work with regular breaks.",
        "Moderate energy: Remember to take brief pauses to refresh.",
        "Not too high, not too low – a quick breather can do wonders.",
        "Your energy level is average – don’t forget to pause occasionally."
      ],
      high: [
        "You're bursting with energy! Channel it wisely, but don't forget to rest.",
        "High energy: Use your power to achieve greatness, yet take short breaks.",
        "You're full of energy – perfect for tackling big tasks, but remember to slow down sometimes.",
        "Overflowing with energy! Now is the time to shine, but also to recharge briefly.",
        "Your energy is high – seize the day, but take moments to catch your breath."
      ]
    },
    fr: {
      low: [
        "Vous manquez d'énergie ? Accordez-vous une courte pause et respirez profondément.",
        "Faible énergie : Une petite promenade peut faire des merveilles.",
        "Peut-être est-il temps de faire une pause.",
        "Votre niveau d'énergie est bas – pensez à une courte sieste.",
        "Vous vous sentez épuisé ? Un mini-break pourrait vous aider."
      ],
      medium: [
        "Votre énergie est modérée – de courtes pauses vous aideront à rester concentré.",
        "Énergie équilibrée : Parfait pour travailler efficacement avec des pauses régulières.",
        "Énergie modérée : N'oubliez pas de prendre de petites pauses pour vous ressourcer.",
        "Ni trop, ni trop peu – un petit moment de détente peut faire des merveilles.",
        "Votre énergie est moyenne – pensez à faire des pauses de temps en temps."
      ],
      high: [
        "Vous débordez d'énergie ! Utilisez-la judicieusement, mais n'oubliez pas de vous reposer.",
        "Haute énergie : Profitez de votre dynamisme pour accomplir de grandes choses, tout en prenant de courtes pauses.",
        "Vous êtes plein d'énergie – idéal pour relever de grands défis, mais prenez le temps de vous arrêter un instant.",
        "Une énergie débordante ! C'est le moment de briller, tout en prenant de petits moments de repos.",
        "Votre énergie est élevée – exploitez-la pour réussir, mais pensez aussi à vous accorder des pauses."
      ]
    }
  }

  // Only update random index when energy level changes (not on language change)
  const randomIndexRef = useRef(0)
  useEffect(() => {
    randomIndexRef.current = Math.floor(Math.random() * 5)
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 10000)
    return () => clearTimeout(timer)
  }, [energyLevel])
  
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  const levelKey = energyLevel < 30 ? 'low' : energyLevel < 70 ? 'medium' : 'high'
  return (
    <div className="mental-note">
      {messages[language][levelKey][randomIndexRef.current]}
    </div>
  )
}

/** 1) Focus Widget Example */
function FocusWidget({ language }) {
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

  // Use translation for widget header
  const header = globalTranslations[language].focusHeader

  return (
    <div className="widget-box">
      <div className="widget-header-noncollapse">
        <h4>{header}</h4>
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
                {language === 'en' ? 'Delete' : language === 'fr' ? 'Supprimer' : 'Löschen'}
              </button>
            </div>
          ))}
        </div>
        <button
          className="focus-add-btn"
          onClick={() => setShowFocusModal(true)}
        >
          {language === 'en' ? '+ New' : language === 'fr' ? '+ Nouveau' : '+ Neu'}
        </button>
        <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
          {language === 'en'
            ? `Progress: ${progress}%`
            : language === 'fr'
            ? `Progression: ${progress}%`
            : `Fortschritt: ${progress}%`}
        </p>
        <Modal
          show={showFocusModal}
          onClose={() => setShowFocusModal(false)}
          title={language === 'en'
            ? 'Add Focus Task'
            : language === 'fr'
            ? 'Ajouter une tâche de focus'
            : 'Fokus-Aufgabe hinzufügen'}
        >
          <label>
            {language === 'en' ? 'Title:' : language === 'fr' ? 'Titre:' : 'Titel:'}
            <input
              type="text"
              value={focusTitle}
              onChange={e => setFocusTitle(e.target.value)}
            />
          </label>
          <button className="btn-primary" onClick={addFocusTask}>
            {language === 'en' ? 'Add' : language === 'fr' ? 'Ajouter' : 'Hinzufügen'}
          </button>
        </Modal>
      </div>
    </div>
  )
}

/** 2) Task Progress Widget */
function Aufgabenfortschritt({ tasks, darkMode, language }) {
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
    { name: language === 'en' ? 'Open' : language === 'fr' ? 'Ouvert' : 'Offen', value: offenCount, color: '#0d6efd' },
    { name: language === 'en' ? 'In Progress' : language === 'fr' ? 'En cours' : 'In Bearbeitung', value: inBearbCount, color: '#fd7e14' },
    { name: language === 'en' ? 'Done' : language === 'fr' ? 'Terminé' : 'Erledigt', value: erledigtCount, color: '#198754' }
  ]
  if (total === 0) {
    data = [{ name: language === 'en' ? 'No Tasks' : language === 'fr' ? 'Aucune tâche' : 'Keine Aufgaben', value: 1, color: '#ccc' }]
  }

  const header = globalTranslations[language].taskProgressHeader

  return (
    <div className="widget-box">
      <div className="widget-header-noncollapse">
        <h4>{header}</h4>
      </div>
      <div className="widget-content">
        <div className="time-range-tabs">
          <button
            className={timeRange === 'today' ? 'active' : ''}
            onClick={() => setTimeRange('today')}
          >
            {language === 'en' ? 'Today' : language === 'fr' ? "Aujourd'hui" : 'Heute'}
          </button>
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            {language === 'en' ? 'Week' : language === 'fr' ? 'Semaine' : 'Woche'}
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            {language === 'en' ? 'Month' : language === 'fr' ? 'Mois' : 'Monat'}
          </button>
        </div>
        <p style={{ marginBottom: '0.8rem' }}>
          {language === 'en'
            ? `Open: ${offenCount} | In Progress: ${inBearbCount} | Done: ${erledigtCount}`
            : language === 'fr'
            ? `Ouvert: ${offenCount} | En cours: ${inBearbCount} | Terminé: ${erledigtCount}`
            : `Offen: ${offenCount} | In Bearbeitung: ${inBearbCount} | Erledigt: ${erledigtCount}`}
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
function Gewohnheitsfortschritt({ habits, darkMode, language }) {
  const [timeRange, setTimeRange] = useState('today')
  const total = habits.length
  const doneCount = habits.filter(h => h.completed).length
  const openCount = total - doneCount

  let data = [
    { name: language === 'en' ? 'Open' : language === 'fr' ? 'Ouvert' : 'Offen', value: openCount, color: '#0d6efd' },
    { name: language === 'en' ? 'Done' : language === 'fr' ? 'Terminé' : 'Erledigt', value: doneCount, color: '#198754' }
  ]
  if (total === 0) {
    data = [{ name: language === 'en' ? 'No Habits' : language === 'fr' ? 'Aucune habitude' : 'Keine Gewohnheiten', value: 1, color: '#ccc' }]
  }

  const header = globalTranslations[language].habitProgressHeader

  return (
    <div className="widget-box">
      <div className="widget-header-noncollapse">
        <h4>{header}</h4>
      </div>
      <div className="widget-content">
        <div className="time-range-tabs">
          <button
            className={timeRange === 'today' ? 'active' : ''}
            onClick={() => setTimeRange('today')}
          >
            {language === 'en' ? 'Today' : language === 'fr' ? "Aujourd'hui" : 'Heute'}
          </button>
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            {language === 'en' ? 'Week' : language === 'fr' ? 'Semaine' : 'Woche'}
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            {language === 'en' ? 'Month' : language === 'fr' ? 'Mois' : 'Monat'}
          </button>
        </div>
        {total > 0 ? (
          <p style={{ marginBottom: '0.8rem' }}>
            {language === 'en'
              ? `Open: ${openCount} | Done: ${doneCount}`
              : language === 'fr'
              ? `Ouvert: ${openCount} | Terminé: ${doneCount}`
              : `Offen: ${openCount} | Erledigt: ${doneCount}`}
          </p>
        ) : (
          <p>{language === 'en' ? 'No Habits.' : language === 'fr' ? 'Aucune habitude.' : 'Keine Gewohnheiten.'}</p>
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
function MiniCalendar({ tasks, darkMode, dateFormat, language }) {
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

  const header = globalTranslations[language].calendarHeader

  return (
    <div className="widget-box">
      <div className="widget-header-noncollapse">
        <h4>{header}</h4>
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
              <p>{language === 'en' ? 'No Tasks on this day.' : language === 'fr' ? "Pas de tâches ce jour-là." : 'Keine Tasks an diesem Tag.'}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** 5) Settings Widget with System Dark Mode Option */
function SettingsWidget({
  userName, setUserName,
  avatarUrl, setAvatarUrl,
  darkMode, setDarkMode,
  systemDarkMode, setSystemDarkMode,
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
        <h4>{globalTranslations[language].settingsHeader}</h4>
      </div>
      <div className="widget-content">
        <label>
          {language === 'en' ? 'Name:' : language === 'fr' ? 'Nom:' : 'Name:'}
          <input
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
          />
        </label>
        <label>
          {language === 'en' ? 'Avatar URL:' : language === 'fr' ? "URL d'avatar:" : 'Avatar-URL:'}
          <input
            type="text"
            value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)}
          />
        </label>
        <label>
          {language === 'en' ? 'Upload Image:' : language === 'fr' ? "Télécharger l'image:" : 'Oder Bild hochladen:'}
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
          />
        </label>
        <label>
          {language === 'en' ? 'Dark Mode:' : language === 'fr' ? 'Mode Sombre:' : 'Darkmode:'}
          <input
            type="checkbox"
            checked={darkMode}
            onChange={e => setDarkMode(e.target.checked)}
          />
        </label>
        <label>
          {language === 'en' ? 'System Dark Mode:' : language === 'fr' ? 'Mode Sombre Système:' : 'System Dark Mode:'}
          <input
            type="checkbox"
            checked={systemDarkMode}
            onChange={e => setSystemDarkMode(e.target.checked)}
          />
        </label>
        <label>
          {language === 'en' ? 'Color Scheme:' : language === 'fr' ? 'Thème Couleur:' : 'Farbschema:'}
          <input
            type="color"
            value={colorScheme}
            onChange={e => setColorScheme(e.target.value)}
          />
        </label>
        <hr style={{ margin: '1rem 0' }} />
        <label>
          {language === 'en' ? 'Language:' : language === 'fr' ? 'Langue:' : 'Sprache:'}
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
          {language === 'en' ? 'Notifications:' : language === 'fr' ? 'Notifications:' : 'Benachrichtigungen:'}
          <input
            type="checkbox"
            checked={notifications}
            onChange={e => setNotifications(e.target.checked)}
          />
        </label>
        <label>
          {language === 'en' ? 'Date Format:' : language === 'fr' ? 'Format de date:' : 'Datumsformat:'}
          <select
            value={dateFormat}
            onChange={e => setDateFormat(e.target.value)}
          >
            <option value="DD.MM.YYYY">{language === 'en' ? 'DD.MM.YYYY' : language === 'fr' ? 'JJ.JJ.AAAA' : 'TT.MM.JJJJ'}</option>
            <option value="YYYY-MM-DD">{language === 'en' ? 'YYYY-MM-DD' : language === 'fr' ? 'AAAA-MM-JJ' : 'JJJJ-MM-TT'}</option>
          </select>
        </label>
      </div>
    </div>
  )
}

/** Main Layout Component */
export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  // Global states
  const [darkMode, setDarkMode] = useState(false)
  const [systemDarkMode, setSystemDarkMode] = useState(false)
  const [userName, setUserName] = useState('Lars')
  const [avatarUrl, setAvatarUrl] = useState('https://randomuser.me/api/portraits/men/3.jpg')
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [energyLevel, setEnergyLevel] = useState(75)
  const [batteryWobble, setBatteryWobble] = useState(false)

  const [language, setLanguage] = useState('de')
  const [dateFormat, setDateFormat] = useState('DD.MM.YYYY')
  const [colorScheme, setColorScheme] = useState('#0d6efd')

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [greeting, setGreeting] = useState(getGreeting(language))

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

  // Update greeting whenever language changes
  useEffect(() => {
    setGreeting(getGreeting(language))
  }, [language])

  // System Dark Mode: if enabled, follow system preference
  useEffect(() => {
    if (systemDarkMode && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      setDarkMode(mq.matches)
      const handler = (e) => setDarkMode(e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [systemDarkMode])

  useEffect(() => {
    const saved = localStorage.getItem('layoutGlobalSettings_v3')
    if (saved) {
      const obj = JSON.parse(saved)
      if (obj.darkMode !== undefined) setDarkMode(obj.darkMode)
      if (obj.userName) setUserName(obj.userName)
      if (obj.avatarUrl) setAvatarUrl(obj.avatarUrl)
      if (obj.sidebarOpen === false) setSidebarOpen(obj.sidebarOpen)
      if (obj.language) setLanguage(obj.language)
      if (obj.dateFormat) setDateFormat(obj.dateFormat)
      if (obj.colorScheme) setColorScheme(obj.colorScheme)
      if (obj.systemDarkMode !== undefined) setSystemDarkMode(obj.systemDarkMode)
    }
  }, [])

  useEffect(() => {
    const toStore = {
      darkMode,
      systemDarkMode,
      userName,
      avatarUrl,
      sidebarOpen,
      language,
      dateFormat,
      colorScheme
    }
    localStorage.setItem('layoutGlobalSettings_v3', JSON.stringify(toStore))
  }, [darkMode, systemDarkMode, userName, avatarUrl, sidebarOpen, language, dateFormat, colorScheme])

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
      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbar-row">
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
                {globalTranslations[language].dashboardTab}
              </button>
              <button
                className={isTasks ? 'active' : ''}
                onClick={() => navigate('/tasks')}
              >
                {globalTranslations[language].tasksTab}
              </button>
            </div>
          </div>
          <div className="topbar-right">
            <div className={`battery-widget ${batteryWobble ? 'wobble pulse' : 'pulse'}`}>
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

      {/* MENTAL NOTE: Displays a reflective note based on the battery level */}
      <MentalNote energyLevel={energyLevel} language={language} />

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
              <FocusWidget language={language} />
              <Aufgabenfortschritt tasks={tasks} darkMode={darkMode} language={language} />
              <Gewohnheitsfortschritt habits={habits} darkMode={darkMode} language={language} />
              <MiniCalendar tasks={tasks} darkMode={darkMode} dateFormat={dateFormat} language={language} />
              <SettingsWidget
                userName={userName}
                setUserName={setUserName}
                avatarUrl={avatarUrl}
                setAvatarUrl={setAvatarUrl}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                systemDarkMode={systemDarkMode}
                setSystemDarkMode={setSystemDarkMode}
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