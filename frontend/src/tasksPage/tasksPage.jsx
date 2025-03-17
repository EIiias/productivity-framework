import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import './tasksPage.css';

/**
 * Translations for the Tasks Page.
 * Supports German (de), English (en) and French (fr)
 */
const translations = {
  de: {
    pageTitle: 'Task Übersicht',
    addTask: '+ Aufgabe erstellen',
    editTaskTitle: 'Aufgabe bearbeiten',
    addTaskTitle: 'Neue Aufgabe',
    searchPlaceholder: 'Suche in Aufgaben...',
    filterStatus: 'Status',
    filterPriority: 'Priorität',
    all: 'Alle',
    status: {
      Offen: 'Offen',
      'In Bearbeitung': 'In Bearbeitung',
      Erledigt: 'Erledigt'
    },
    priority: {
      Hoch: 'Hoch',
      Mittel: 'Mittel',
      Niedrig: 'Niedrig'
    },
    deadline: 'Deadline',
    actions: 'Aktionen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    noTitleAlert: 'Bitte einen Titel eingeben.',
    undoToastText: 'Aufgabe gelöscht. Rückgängig?',
    undone: 'Rückgängig'
  },
  en: {
    pageTitle: 'Task Overview',
    addTask: '+ Add Task',
    editTaskTitle: 'Edit Task',
    addTaskTitle: 'New Task',
    searchPlaceholder: 'Search tasks...',
    filterStatus: 'Status',
    filterPriority: 'Priority',
    all: 'All',
    status: {
      Offen: 'Open',
      'In Bearbeitung': 'In Progress',
      Erledigt: 'Done'
    },
    priority: {
      Hoch: 'High',
      Mittel: 'Medium',
      Niedrig: 'Low'
    },
    deadline: 'Deadline',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    noTitleAlert: 'Please enter a task title.',
    undoToastText: 'Task deleted. Undo?',
    undone: 'Undo'
  },
  fr: {
    pageTitle: 'Vue des tâches',
    addTask: '+ Ajouter une tâche',
    editTaskTitle: 'Modifier la tâche',
    addTaskTitle: 'Nouvelle tâche',
    searchPlaceholder: 'Rechercher dans les tâches...',
    filterStatus: 'Statut',
    filterPriority: 'Priorité',
    all: 'Toutes',
    status: {
      Offen: 'Ouvert',
      'In Bearbeitung': 'En cours',
      Erledigt: 'Terminé'
    },
    priority: {
      Hoch: 'Haute',
      Mittel: 'Moyenne',
      Niedrig: 'Faible'
    },
    deadline: 'Échéance',
    actions: 'Actions',
    edit: 'Modifier',
    delete: 'Supprimer',
    noTitleAlert: 'Veuillez saisir un titre.',
    undoToastText: 'Tâche supprimée. Annuler?',
    undone: 'Annuler'
  }
};

/**
 * Modal component for adding/editing tasks.
 */
function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div className="tasks-page__modal-overlay" onClick={onClose}>
      <div className="tasks-page__modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tasks-page__modal-header">
          <h2>{title}</h2>
          <button className="tasks-page__modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="tasks-page__modal-body">{children}</div>
      </div>
    </div>
  );
}

/**
 * TasksPage Component
 * - Displays tasks in a table view with comprehensive filtering, sorting and CRUD functionality.
 */
export default function TasksPage() {
  const { darkMode, language, dateFormat, colorScheme } = useOutletContext();
  const t = translations[language] || translations.de;

  // State for tasks and filters
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortOrder, setSortOrder] = useState('none');

  // Undo deletion state
  const [recentlyDeletedTask, setRecentlyDeletedTask] = useState(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const undoTimerRef = useRef(null);

  // Modal state for Add/Edit
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState('Offen');
  const [taskPriority, setTaskPriority] = useState('Mittel');
  const [taskTags, setTaskTags] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');

  // Fetch tasks from backend
  async function fetchTasks() {
    try {
      const res = await fetch('http://localhost:5002/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  }
  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter: search in title, description, and tags
  let filteredTasks = tasks.filter(task => {
    const term = searchTerm.toLowerCase();
    return (
      task.title.toLowerCase().includes(term) ||
      (task.description && task.description.toLowerCase().includes(term)) ||
      (task.tags && task.tags.join(' ').toLowerCase().includes(term))
    );
  });
  if (filterStatus !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.status === filterStatus);
  }
  if (filterPriority !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.priority === filterPriority);
  }
  if (sortOrder === 'asc') {
    filteredTasks = [...filteredTasks].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOrder === 'desc') {
    filteredTasks = [...filteredTasks].sort((a, b) => b.title.localeCompare(a.title));
  }

  // Modal handlers
  function handleAddTask() {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskStatus('Offen');
    setTaskPriority('Mittel');
    setTaskTags('');
    setTaskDeadline('');
    setShowModal(true);
  }
  function handleEditTask(task) {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setTaskTags((task.tags || []).join(', '));
    setTaskDeadline(task.deadline ? task.deadline.substring(0, 10) : '');
    setShowModal(true);
  }

  async function handleDeleteTask(id) {
    const taskToDelete = tasks.find(task => task.id === id);
    if (!taskToDelete) return;
    setRecentlyDeletedTask(taskToDelete);
    setTasks(prev => prev.filter(task => task.id !== id));
    setShowUndoToast(true);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      setShowUndoToast(false);
      setRecentlyDeletedTask(null);
    }, 6000);
    try {
      await fetch(`http://localhost:5002/tasks/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  }
  async function handleUndoDelete() {
    if (!recentlyDeletedTask) return;
    try {
      const res = await fetch(`http://localhost:5002/tasks/${recentlyDeletedTask.id}/undo`, { method: 'POST' });
      if (res.ok) {
        const undoneTask = await res.json();
        setTasks(prev => [...prev, undoneTask]);
      }
    } catch (err) {
      console.error('Error undoing delete:', err);
    }
    setRecentlyDeletedTask(null);
    setShowUndoToast(false);
  }
  async function saveTask() {
    if (!taskTitle.trim()) {
      alert(t.noTitleAlert);
      return;
    }
    const parsedTags = taskTags.split(',').map(tag => tag.trim()).filter(Boolean);
    if (editingTask) {
      const updatedTask = {
        ...editingTask,
        title: taskTitle,
        description: taskDescription,
        status: taskStatus,
        priority: taskPriority,
        tags: parsedTags,
        deadline: taskDeadline
      };
      try {
        const res = await fetch(`http://localhost:5002/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask)
        });
        if (res.ok) {
          const data = await res.json();
          setTasks(prev => prev.map(task => task.id === editingTask.id ? data : task));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      const newTask = {
        title: taskTitle,
        description: taskDescription,
        status: taskStatus,
        priority: taskPriority,
        tags: parsedTags,
        deadline: taskDeadline
      };
      try {
        const res = await fetch('http://localhost:5002/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
        });
        if (res.ok) {
          const data = await res.json();
          setTasks(prev => [...prev, data]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    setShowModal(false);
  }

  return (
    <div className={`tasks-page ${darkMode ? 'dark-mode' : ''}`}>
      <header className="tasks-header">
        <h1>{t.pageTitle}</h1>
        <button className="btn-add" onClick={handleAddTask}>{t.addTask}</button>
      </header>
      <div className="tasks-filters">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">{t.all}</option>
          <option value="Offen">{t.status.Offen}</option>
          <option value="In Bearbeitung">{t.status["In Bearbeitung"]}</option>
          <option value="Erledigt">{t.status.Erledigt}</option>
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">{t.all}</option>
          <option value="Hoch">{t.priority.Hoch}</option>
          <option value="Mittel">{t.priority.Mittel}</option>
          <option value="Niedrig">{t.priority.Niedrig}</option>
        </select>
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
          <option value="none">Sortierung: {t.all}</option>
          <option value="asc">Titel (A–Z)</option>
          <option value="desc">Titel (Z–A)</option>
        </select>
      </div>
      <div className="tasks-list-container">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Beschreibung</th>
              <th>{t.deadline}</th>
              <th>{t.filterPriority}</th>
              <th>{t.filterStatus}</th>
              <th>Tags</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.description || '-'}</td>
                <td>
                  {task.deadline
                    ? (dateFormat === 'YYYY-MM-DD'
                        ? task.deadline
                        : new Date(task.deadline).toLocaleDateString())
                    : '-'}
                </td>
                <td>{t.priority[task.priority] || task.priority}</td>
                <td>{t.status[task.status] || task.status}</td>
                <td>{task.tags ? task.tags.join(', ') : '-'}</td>
                <td className="table-actions">
                  <button className="btn-edit" onClick={() => handleEditTask(task)}>{t.edit}</button>
                  <button className="btn-delete" onClick={() => handleDeleteTask(task.id)}>{t.delete}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showUndoToast && (
        <div className="undo-toast">
          <span>{t.undoToastText}</span>
          <button onClick={handleUndoDelete}>{t.undone}</button>
        </div>
      )}
      <Modal show={showModal} onClose={() => setShowModal(false)}
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
            <option value="Offen">{t.status.Offen}</option>
            <option value="In Bearbeitung">{t.status["In Bearbeitung"]}</option>
            <option value="Erledigt">{t.status.Erledigt}</option>
          </select>
        </label>
        <label>
          Priorität:
          <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)}>
            <option value="Hoch">{t.priority.Hoch}</option>
            <option value="Mittel">{t.priority.Mittel}</option>
            <option value="Niedrig">{t.priority.Niedrig}</option>
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
  );
}
