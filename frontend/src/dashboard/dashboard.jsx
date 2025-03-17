// dashboard.jsx
// Final version of the Dashboard component that manages tasks from the backend.
// Supports filtering (search in title, description, and tags), sorting, drag & drop reordering,
// and adding/editing tasks via a modal. Priority and status are displayed in a separate badges row.
// Global color scheme, dark mode, and translations are integrated.
// English comments are provided for clarity.

import React, { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import './dashboard.css'

// DnD imports for draggable task cards
import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Recharts for pie charts (optional)
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

/**
 * Translations for the dashboard.
 * Supports German (de), English (en) and French (fr)
 */
const translations = {
  de: {
    tasksHeader: 'Aufgaben',
    newTask: '+ Neue Aufgabe',
    editTaskTitle: 'Aufgabe bearbeiten',
    addTaskTitle: 'Neue Aufgabe',
    all: 'Alle',
    searchPlaceholder: 'Suche …',
    overdueTooltip: 'Deadline überschritten!',
    delete: 'Löschen',
    edit: 'Bearbeiten',
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
    deadlineLabel: 'Deadline',
    tagsLabel: 'Tags (Komma-separiert)',
    add: 'Hinzufügen',
    undone: 'Rückgängig',
    undoToastText: 'Task gelöscht. Aktion rückgängig machen?',
    sortLabel: 'Sortierung',
    sortOptions: {
      none: 'Keine Sortierung',
      asc: 'Titel (A–Z)',
      desc: 'Titel (Z–A)'
    },
    noTitleAlert: 'Bitte einen Titel eingeben.'
  },
  en: {
    tasksHeader: 'Tasks',
    newTask: '+ New Task',
    editTaskTitle: 'Edit Task',
    addTaskTitle: 'New Task',
    all: 'All',
    searchPlaceholder: 'Search …',
    overdueTooltip: 'Deadline exceeded!',
    delete: 'Delete',
    edit: 'Edit',
    statuses: {
      Offen: 'Open',
      'In Bearbeitung': 'In Progress',
      Erledigt: 'Done'
    },
    priorities: {
      Hoch: 'High',
      Mittel: 'Medium',
      Niedrig: 'Low'
    },
    deadlineLabel: 'Deadline',
    tagsLabel: 'Tags (comma-separated)',
    add: 'Add',
    undone: 'Undo',
    undoToastText: 'Task deleted. Undo?',
    sortLabel: 'Sort by',
    sortOptions: {
      none: 'No sort',
      asc: 'Title (A–Z)',
      desc: 'Title (Z–A)'
    },
    noTitleAlert: 'Please enter a task title.'
  },
  fr: {
    tasksHeader: 'Tâches',
    newTask: '+ Nouvelle tâche',
    editTaskTitle: 'Modifier la tâche',
    addTaskTitle: 'Nouvelle tâche',
    all: 'Toutes',
    searchPlaceholder: 'Chercher …',
    overdueTooltip: 'Date limite dépassée!',
    delete: 'Supprimer',
    edit: 'Modifier',
    statuses: {
      Offen: 'Ouvert',
      'In Bearbeitung': 'En cours',
      Erledigt: 'Terminé'
    },
    priorities: {
      Hoch: 'Haute',
      Mittel: 'Moyenne',
      Niedrig: 'Faible'
    },
    deadlineLabel: 'Échéance',
    tagsLabel: 'Tags (séparés par virgule)',
    add: 'Ajouter',
    undone: 'Annuler',
    undoToastText: 'Tâche supprimée. Annuler?',
    sortLabel: 'Trier par',
    sortOptions: {
      none: 'Aucun tri',
      asc: 'Titre (A–Z)',
      desc: 'Titre (Z–A)'
    },
    noTitleAlert: 'Veuillez saisir un titre.'
  }
}

/**
 * Modal component for task addition/editing.
 * Closes when clicking outside the modal content.
 */
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

/**
 * SortableTaskCard: A draggable task card component.
 * Displays task title at top, with a separate row for priority and status badges.
 */
function SortableTaskCard({ task, darkMode, pastelColor, onEdit, onDelete, t, dateFormat }) {
  // DnD-Setup: useSortable liefert nur die Listener für den Drag-Handle
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  // Mapping für feste Farben für Priorität und Status
  const priorityColorMap = {
    Hoch: '#0d6efd',    // Blau
    Mittel: '#ffc107',  // Gelb
    Niedrig: '#198754'  // Grün
  };
  const statusColorMap = {
    Offen: '#0d6efd',          // Blau
    'In Bearbeitung': '#fd7e14', // Orange
    Erledigt: '#198754'        // Grün
  };

  const translatedPriority = t.priorities[task.priority] || task.priority;
  const translatedStatus = t.statuses[task.status] || task.status;

  // Deadline formatieren
  let deadlineLabel = '';
  let isOverdue = false;
  if (task.deadline) {
    const dlDate = new Date(task.deadline);
    const now = new Date();
    isOverdue = dlDate < now && task.status !== 'Erledigt';
    const dd = String(dlDate.getDate()).padStart(2, '0');
    const mm = String(dlDate.getMonth() + 1).padStart(2, '0');
    const yyyy = dlDate.getFullYear();
    deadlineLabel = dateFormat === 'YYYY-MM-DD' ? `${yyyy}-${mm}-${dd}` : `${dd}.${mm}.${yyyy}`;
  }

  // Stil: Die gesamte Card erhält nur ref und style, aber keine DnD-Listener
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: darkMode ? '#2b2b2b' : pastelColor
  };

  return (
    <div ref={setNodeRef} style={style} className={`task-card ${darkMode ? 'dark-mode-card' : ''}`}>
      {/* Nur der Drag-Handle erhält die DnD-Listener und -Attribute */}
      <span className="drag-handle" title="Drag to reorder" {...attributes} {...listeners}>
        ⇅
      </span>
      <div className="task-info">
        <div className="task-header">
          <span className="task-title">{task.title}</span>
        </div>
        {/* Neue Zeile: Badges für Priorität und Status */}
        <div className="task-badges">
          <span className="priority-badge" style={{ backgroundColor: priorityColorMap[task.priority] || '#ccc' }}>
            {translatedPriority}
          </span>
          <span className="status-badge" style={{ backgroundColor: statusColorMap[task.status] || '#ccc' }}>
            {translatedStatus}
          </span>
        </div>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        {task.tags && task.tags.length > 0 && (
          <div className="task-tags">
            {task.tags.map((tag, idx) => (
              <span key={idx} className="task-tag-pill">{tag}</span>
            ))}
          </div>
        )}
        {task.deadline && (
          <span className={`deadline-badge ${isOverdue ? 'overdue' : ''}`}
                title={isOverdue ? t.overdueTooltip : deadlineLabel}>
            {deadlineLabel}
          </span>
        )}
        <div className="task-actions">
          <button className="btn-edit" onClick={() => onEdit(task)}>{t.edit}</button>
          <button className="btn-delete" onClick={() => onDelete(task.id)}>{t.delete}</button>
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard component:
 * - Fetches tasks from the backend.
 * - Supports filtering (searching in title, description, tags), sorting and drag & drop reordering.
 * - Opens a modal for adding/editing tasks.
 */
export default function Dashboard() {
  const { darkMode, language, dateFormat } = useOutletContext()
  const t = translations[language] || translations.de

  // States for tasks and filters
  const [tasks, setTasks] = useState([])
  const [taskSearchTerm, setTaskSearchTerm] = useState('')
  const [taskFilterStatus, setTaskFilterStatus] = useState('all')
  const [taskFilterPriority, setTaskFilterPriority] = useState('all')
  const [tagFilter, setTagFilter] = useState('')
  const [taskSortOrder, setTaskSortOrder] = useState('none')

  // Undo deletion state
  const [recentlyDeletedTask, setRecentlyDeletedTask] = useState(null)
  const [showUndoToast, setShowUndoToast] = useState(false)
  const undoTimerRef = useRef(null)

  // Modal state for adding/editing a task
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskStatus, setTaskStatus] = useState('Offen')
  const [taskPriority, setTaskPriority] = useState('Mittel')
  const [taskTags, setTaskTags] = useState('')
  const [taskDeadline, setTaskDeadline] = useState('')

  // Fetch tasks from backend on mount
  async function fetchTasks() {
    try {
      const resp = await fetch('http://localhost:5002/tasks')
      if (resp.ok) {
        const data = await resp.json()
        setTasks(data)
      }
    } catch (err) {
      console.error('Error fetching tasks:', err)
    }
  }
  useEffect(() => {
    fetchTasks()
  }, [])

  // Filter: search in title, description, and tags
  let filteredTasks = tasks.filter(task => {
    const searchTerm = taskSearchTerm.toLowerCase()
    return (
      task.title.toLowerCase().includes(searchTerm) ||
      (task.description && task.description.toLowerCase().includes(searchTerm)) ||
      (task.tags && task.tags.join(' ').toLowerCase().includes(searchTerm))
    )
  })
  if (taskFilterStatus !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.status === taskFilterStatus)
  }
  if (taskFilterPriority !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.priority === taskFilterPriority)
  }
  if (taskSortOrder === 'asc') {
    filteredTasks = [...filteredTasks].sort((a, b) => a.title.localeCompare(b.title))
  } else if (taskSortOrder === 'desc') {
    filteredTasks = [...filteredTasks].sort((a, b) => b.title.localeCompare(a.title))
  }

  // Handle drag & drop reordering
  function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return
    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex(task => task.id === active.id)
      const newIndex = tasks.findIndex(task => task.id === over.id)
      setTasks(prev => arrayMove(prev, oldIndex, newIndex))
    }
  }

  // Open modal to add a new task
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

  // Open modal to edit an existing task
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

  // Delete a task and enable undo functionality
  async function handleDeleteTask(id) {
    const taskToDelete = tasks.find(task => task.id === id)
    if (!taskToDelete) return
    setRecentlyDeletedTask(taskToDelete)
    setTasks(prev => prev.filter(task => task.id !== id))
    setShowUndoToast(true)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => {
      setShowUndoToast(false)
      setRecentlyDeletedTask(null)
    }, 6000)
    try {
      await fetch(`http://localhost:5002/tasks/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.error('Error deleting task:', err)
    }
  }

  // Undo deletion of a task
  async function handleUndoDelete() {
    if (!recentlyDeletedTask) return
    try {
      const resp = await fetch(`http://localhost:5002/tasks/${recentlyDeletedTask.id}/undo`, { method: 'POST' })
      if (resp.ok) {
        const undoneTask = await resp.json()
        setTasks(prev => [...prev, undoneTask])
      }
    } catch (err) {
      console.error('Error undoing delete:', err)
    }
    setRecentlyDeletedTask(null)
    setShowUndoToast(false)
  }

  // Save task (create or update)
  async function saveTask() {
    if (!taskTitle.trim()) {
      alert(t.noTitleAlert)
      return
    }
    const parsedTags = taskTags.split(',').map(tag => tag.trim()).filter(Boolean)
    if (editingTask) {
      const updatedTask = {
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
          body: JSON.stringify(updatedTask)
        })
        if (resp.ok) {
          const updatedData = await resp.json()
          setTasks(prev => prev.map(task => task.id === editingTask.id ? updatedData : task))
        }
      } catch (err) {
        console.error(err)
      }
    } else {
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
        if (resp.ok) {
          const createdTask = await resp.json()
          setTasks(prev => [...prev, createdTask])
        }
      } catch (err) {
        console.error(err)
      }
    }
    setShowTaskModal(false)
  }

  return (
    <div className={`dashboard-main-content ${darkMode ? 'dark-mode' : ''}`}>
      <section className="tasks-section">
        <h2>
          {t.tasksHeader}
          <button className="btn-primary" onClick={handleAddTaskClick}>{t.newTask}</button>
        </h2>

        {/* Filter & Sorting Controls */}
        <div className="tasks-search-filter">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={taskSearchTerm}
            onChange={e => setTaskSearchTerm(e.target.value)}
          />
          <select value={taskFilterStatus} onChange={e => setTaskFilterStatus(e.target.value)}>
            <option value="all">{t.all}</option>
            <option value="Offen">{t.statuses.Offen}</option>
            <option value="In Bearbeitung">{t.statuses['In Bearbeitung']}</option>
            <option value="Erledigt">{t.statuses.Erledigt}</option>
          </select>
          <select value={taskFilterPriority} onChange={e => setTaskFilterPriority(e.target.value)}>
            <option value="all">{t.all}</option>
            <option value="Hoch">{t.priorities.Hoch}</option>
            <option value="Mittel">{t.priorities.Mittel}</option>
            <option value="Niedrig">{t.priorities.Niedrig}</option>
          </select>
          <input
            type="text"
            placeholder="Tags…"
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
            style={{ width: '120px' }}
          />
          <label style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>
            {t.sortLabel}:
          </label>
          <select value={taskSortOrder} onChange={e => setTaskSortOrder(e.target.value)}>
            <option value="none">{t.sortOptions.none}</option>
            <option value="asc">{t.sortOptions.asc}</option>
            <option value="desc">{t.sortOptions.desc}</option>
          </select>
        </div>

        {/* Draggable Task List */}
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            <div className="tasks-list">
              {filteredTasks.map((task, idx) => {
                const pastelColors = [
                  '#FBF8CC', '#FDE4CF', '#F1C0E8', '#CFBAF0',
                  '#A3C4F3', '#90DBF4', '#8EECF5', '#98F5E1',
                  '#B9FBC0'
                ]
                const color = pastelColors[idx % pastelColors.length]
                return (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    darkMode={darkMode}
                    pastelColor={color}
                    onEdit={handleEditTaskClick}
                    onDelete={handleDeleteTask}
                    t={t}
                    dateFormat={dateFormat}
                  />
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* Undo Toast Notification */}
      {showUndoToast && (
        <div className="undo-toast">
          <span>{t.undoToastText}</span>
          <button onClick={handleUndoDelete}>{t.undone}</button>
        </div>
      )}

      {/* Modal for Add/Edit Task */}
      <Modal show={showTaskModal} onClose={() => setShowTaskModal(false)}
             title={editingTask ? t.editTaskTitle : t.addTaskTitle}>
        <label>
          Titel:
          <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
        </label>
        <label>
          Beschreibung:
          <textarea rows="3" value={taskDescription} onChange={e => setTaskDescription(e.target.value)} />
        </label>
        <label>
          Status:
          <select value={taskStatus} onChange={e => setTaskStatus(e.target.value)}>
            <option value="Offen">{t.statuses.Offen}</option>
            <option value="In Bearbeitung">{t.statuses['In Bearbeitung']}</option>
            <option value="Erledigt">{t.statuses.Erledigt}</option>
          </select>
        </label>
        <label>
          Priorität:
          <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)}>
            <option value="Hoch">{t.priorities.Hoch}</option>
            <option value="Mittel">{t.priorities.Mittel}</option>
            <option value="Niedrig">{t.priorities.Niedrig}</option>
          </select>
        </label>
        <label>
          {t.tagsLabel}:
          <input type="text" value={taskTags} onChange={e => setTaskTags(e.target.value)} />
        </label>
        <label>
          {t.deadlineLabel}:
          <input type="date" value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)} />
        </label>
        <button className="btn-primary" onClick={saveTask}>
          {editingTask ? t.edit : t.add}
        </button>
      </Modal>
    </div>
  )
}
