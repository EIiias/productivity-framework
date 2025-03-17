import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';

// DnD-Kit imports for drag & drop
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import './tasksPage.css';

/*
  Categories (Lebensbereiche), each with:
    - name: internal name
    - translations: DE, EN, FR
    - icon: e.g. "🏠"
    - keywords: used to auto-detect this category from title/tags
      Here, each category's keyword list is heavily expanded:
      * German synonyms
      * English synonyms
      * French synonyms
    - colorLight/colorDark: background color for light/dark modes
*/
const categories = [
  {
    name: 'Haushalt & Alltag',
    translations: {
      de: 'Haushalt & Alltag',
      en: 'Household & Daily Life',
      fr: 'Ménage & Quotidien'
    },
    icon: '🏠',
    keywords: [
      // GERMAN
      'haushalt','putzen','einkaufen','wäsche','garten','aufräumen','wohnung',
      'spülen','kochen','reinigung',
      // ENGLISH
      'household','cleaning','shopping','laundry','garden','tidy','home',
      'dishwashing','cooking','maintenance',
      // FRENCH
      'ménage','nettoyer','courses','linge','jardin','ranger','maison',
      'vaisselle','cuisine','entretien'
    ],
    colorLight: '#E2E3E5',
    colorDark: '#3F3F40'
  },
  {
    name: 'Beruf & Projekte',
    translations: {
      de: 'Beruf & Projekte',
      en: 'Work & Projects',
      fr: 'Travail & Projets'
    },
    icon: '💼',
    keywords: [
      // GERMAN
      'arbeit','projekt','kunde','meeting','deadline','job','auftrag','business',
      'büro','besprechung','ziel','firma',
      // ENGLISH
      'work','project','client','meeting','deadline','job','contract','business',
      'office','conference','goal','company',
      // FRENCH
      'travail','projet','client','réunion','deadline','emploi','contrat','affaires',
      'bureau','conférence','objectif','entreprise'
    ],
    colorLight: '#D1E7DD',
    colorDark: '#2A3F2F'
  },
  {
    name: 'Finanzen & Verwaltung',
    translations: {
      de: 'Finanzen & Verwaltung',
      en: 'Finance & Administration',
      fr: 'Finances & Administration'
    },
    icon: '💰',
    keywords: [
      // GERMAN
      'finanzen','rechnung','steuer','bank','budget','zahlung','abrechnung','versicherungen',
      'konto','überweisung','geld','verwaltung',
      // ENGLISH
      'finance','invoice','tax','bank','budget','payment','billing','insurance',
      'account','transfer','money','administration',
      // FRENCH
      'finances','facture','impôts','banque','budget','paiement','facturation','assurance',
      'compte','virement','argent','administration'
    ],
    colorLight: '#F7D7DA',
    colorDark: '#4F2A2B'
  },
  {
    name: 'Gesundheit & Sport',
    translations: {
      de: 'Gesundheit & Sport',
      en: 'Health & Sports',
      fr: 'Santé & Sport'
    },
    icon: '⚕️',
    keywords: [
      // GERMAN
      'gesundheit','sport','training','fitness','laufen','yoga','ernährung','workout','meditation',
      'arzt','bewegung','diät','wellness',
      // ENGLISH
      'health','sports','training','fitness','running','yoga','nutrition','workout','meditation',
      'doctor','exercise','diet','wellbeing',
      // FRENCH
      'santé','sport','entraînement','fitness','course','yoga','nutrition','exercice','méditation',
      'médecin','exercice','régime','bien-être'
    ],
    colorLight: '#FFE5E5',
    colorDark: '#4F2A2A'
  },
  {
    name: 'Bildung & Lernen',
    translations: {
      de: 'Bildung & Lernen',
      en: 'Education & Learning',
      fr: 'Éducation & Apprentissage'
    },
    icon: '📚',
    keywords: [
      // GERMAN
      'lernen','studium','prüfung','bildung','kurs','zertifikat','lesen','weiterbildung',
      'schulungen','seminar','fachbuch','uni',
      // ENGLISH
      'learning','study','exam','education','course','certificate','reading','training',
      'schooling','seminar','textbook','university',
      // FRENCH
      'apprentissage','études','examen','éducation','cours','certificat','lecture','formation',
      'scolarité','séminaire','manuel','université'
    ],
    colorLight: '#FEF3C7',
    colorDark: '#4F442A'
  },
  {
    name: 'Freunde & Familie',
    translations: {
      de: 'Freunde & Familie',
      en: 'Friends & Family',
      fr: 'Amis & Famille'
    },
    icon: '👨‍👩‍👧‍👦',
    keywords: [
      // GERMAN
      'familie','freunde','partner','eltern','besuch','fest','geburtstag','verabredung',
      'kinder','großeltern','feier','zusammentreffen',
      // ENGLISH
      'family','friends','partner','parents','visit','party','birthday','appointment',
      'kids','grandparents','celebration','gathering',
      // FRENCH
      'famille','amis','partenaire','parents','visite','fête','anniversaire','rendez-vous',
      'enfants','grands-parents','célébration','réunion'
    ],
    colorLight: '#FFD6E7',
    colorDark: '#4F2A3D'
  },
  {
    name: 'Lernen & Persönliches Wachstum',
    translations: {
      de: 'Lernen & Persönliches Wachstum',
      en: 'Personal Growth & Learning',
      fr: 'Croissance Personnelle & Apprentissage'
    },
    icon: '🌱',
    keywords: [
      // GERMAN
      'persönlich','lernen','bildung','kurs','berufsmatura','coaching','entwicklung',
      'wachstum','lebenslang','mentoring','karriere','talent',
      // ENGLISH
      'personal','learning','education','course','vocational','coaching','development',
      'growth','lifelong','mentoring','career','talent',
      // FRENCH
      'personnel','apprentissage','éducation','cours','professionnel','coaching','développement',
      'croissance','toutela vie','mentorat','carrière','talent'
    ],
    colorLight: '#E5D1F7',
    colorDark: '#3F2A4F'
  },
  {
    name: 'Freizeit & Reisen',
    translations: {
      de: 'Freizeit & Reisen',
      en: 'Leisure & Travel',
      fr: 'Loisirs & Voyages'
    },
    icon: '✈️',
    keywords: [
      // GERMAN
      'ferien','urlaub','reise','trip','ausflug','wochenende','hobby','entspannung','kino','event',
      'erholung','strand','tourismus','flug',
      // ENGLISH
      'vacation','holiday','travel','trip','excursion','weekend','hobby','relaxation','cinema','event',
      'recreation','beach','tourism','flight',
      // FRENCH
      'vacances','congé','voyage','excursion','sortie','week-end','loisir','détente','cinéma','événement',
      'récréation','plage','tourisme','vol'
    ],
    colorLight: '#CCE5FF',
    colorDark: '#2A394F'
  },
  {
    name: 'Sonstiges',
    translations: {
      de: 'Sonstiges',
      en: 'Others',
      fr: 'Autres'
    },
    icon: '📦',
    // Usually no keywords, but let's add synonyms for completeness
    keywords: [
      // GERMAN
      'sonstiges','diverses','allgemein','rest','anderes',
      // ENGLISH
      'others','misc','general','rest','various',
      // FRENCH
      'autres','divers','général','reste','varié'
    ],
    colorLight: '#F2F2F2',
    colorDark: '#333333'
  }
];

/*
  Translations for UI texts (DE, EN, FR).
  We have the fields for category selection as well (categoryLabel, categoryAuto, categoryInfo).
*/
const translations = {
  de: {
    pageTitle: 'Aufgaben',
    addTask: '+ Neue Aufgabe',
    editTaskTitle: 'Aufgabe bearbeiten',
    addTaskTitle: 'Neue Aufgabe',
    searchPlaceholder: 'Suche in Aufgaben...',
    filterStatus: 'Status',
    filterPriority: 'Priorität',
    all: 'Alle',
    status: { Offen: 'Offen', 'In Bearbeitung': 'In Bearbeitung', Erledigt: 'Erledigt' },
    priority: { Hoch: 'Hoch', Mittel: 'Mittel', Niedrig: 'Niedrig' },
    deadline: 'Deadline',
    actions: 'Aktionen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    noTitleAlert: 'Bitte einen Titel eingeben.',
    undoToastText: 'Aufgabe gelöscht. Rückgängig?',
    undone: 'Rückgängig',
    tagsLabel: 'Tags',
    deadlineLabel: 'Deadline',
    add: 'Hinzufügen',
    groupToggle: 'Ein-/Ausklappen',
    groupingOn: 'Gruppierung: AN',
    groupingOff: 'Gruppierung: AUS',
    categoryLabel: 'Kategorie',
    categoryAuto: 'Automatisch (via Keywords)',
    categoryInfo: 'Wie werden Aufgaben kategorisiert? Entweder automatisch via Stichwörter im Titel/Tags oder du wählst manuell eine Kategorie aus. Dann wird das zugehörige Schlüsselwort automatisch hinzugefügt.'
  },
  en: {
    pageTitle: 'Tasks',
    addTask: '+ New Task',
    editTaskTitle: 'Edit Task',
    addTaskTitle: 'New Task',
    searchPlaceholder: 'Search tasks...',
    filterStatus: 'Status',
    filterPriority: 'Priority',
    all: 'All',
    status: { Offen: 'Open', 'In Bearbeitung': 'In Progress', Erledigt: 'Done' },
    priority: { Hoch: 'High', Mittel: 'Medium', Niedrig: 'Low' },
    deadline: 'Deadline',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    noTitleAlert: 'Please enter a task title.',
    undoToastText: 'Task deleted. Undo?',
    undone: 'Undo',
    tagsLabel: 'Tags',
    deadlineLabel: 'Deadline',
    add: 'Add',
    groupToggle: 'Toggle',
    groupingOn: 'Grouping: ON',
    groupingOff: 'Grouping: OFF',
    categoryLabel: 'Category',
    categoryAuto: 'Automatic (via keywords)',
    categoryInfo: 'How are tasks categorized? Either automatically via keywords in title/tags or by manually selecting a category. Then the corresponding keyword is automatically added.'
  },
  fr: {
    pageTitle: 'Tâches',
    addTask: '+ Nouvelle tâche',
    editTaskTitle: 'Modifier la tâche',
    addTaskTitle: 'Nouvelle tâche',
    searchPlaceholder: 'Rechercher dans les tâches...',
    filterStatus: 'Statut',
    filterPriority: 'Priorité',
    all: 'Toutes',
    status: { Offen: 'Ouvert', 'In Bearbeitung': 'En cours', Erledigt: 'Terminé' },
    priority: { Hoch: 'Haute', Mittel: 'Moyenne', Niedrig: 'Faible' },
    deadline: 'Échéance',
    actions: 'Actions',
    edit: 'Modifier',
    delete: 'Supprimer',
    noTitleAlert: 'Veuillez saisir un titre.',
    undoToastText: 'Tâche supprimée. Annuler?',
    undone: 'Annuler',
    tagsLabel: 'Tags',
    deadlineLabel: 'Échéance',
    add: 'Ajouter',
    groupToggle: 'Basculer',
    groupingOn: 'Regroupement : ON',
    groupingOff: 'Regroupement : OFF',
    categoryLabel: 'Catégorie',
    categoryAuto: 'Automatique (via mots-clés)',
    categoryInfo: 'Comment les tâches sont-elles classées ? Soit automatiquement via mots-clés dans le titre/les tags, soit en sélectionnant manuellement une catégorie. Le mot-clé correspondant est alors ajouté automatiquement.'
  }
};

/*
  Modal component for adding/editing tasks.
*/
function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div className="tasks-page__modal-overlay" onClick={onClose}>
      <div className="tasks-page__modal-content" onClick={e => e.stopPropagation()}>
        <div className="tasks-page__modal-header">
          <h2>{title}</h2>
          <button className="tasks-page__modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="tasks-page__modal-body">{children}</div>
      </div>
    </div>
  );
}

/*
  SortableTaskRow: one row in the tasks table (draggable).
*/
function SortableTaskRow({ task, t, darkMode, dateFormat, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  // Format the deadline
  let deadlineDisplay = '-';
  if (task.deadline) {
    try {
      const d = new Date(task.deadline);
      deadlineDisplay = (dateFormat === 'YYYY-MM-DD') ? task.deadline : d.toLocaleDateString();
    } catch {
      deadlineDisplay = task.deadline;
    }
  }

  return (
    <tr ref={setNodeRef} style={style}>
      {/* Drag handle in its own cell */}
      <td className="drag-handle-cell">
        <span className="drag-handle" {...attributes} {...listeners}>⇅</span>
      </td>
      <td>{task.title}</td>
      <td>{task.description || '-'}</td>
      <td>{deadlineDisplay}</td>
      <td>{t.priority[task.priority] || task.priority}</td>
      <td>{t.status[task.status] || task.status}</td>
      <td>{(task.tags && task.tags.length > 0) ? task.tags.join(', ') : '-'}</td>
      <td className="table-actions">
        <button className="btn-edit" onClick={() => onEdit(task)}>{t.edit}</button>
        <button className="btn-delete" onClick={() => onDelete(task.id)}>{t.delete}</button>
      </td>
    </tr>
  );
}

/*
  Main TasksPage component
  - Loads tasks from backend
  - Search, filter, sorting
  - Optional grouping by category (toggle)
  - Drag & drop reordering within/between groups
  - Undo delete
  - Modal for add/edit, including manual category selection
*/
export default function TasksPage() {
  const { darkMode, language, dateFormat } = useOutletContext();
  const t = translations[language] || translations.de;

  // Tasks, filters, sort
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortOrder, setSortOrder] = useState('none');

  // Grouping on/off
  const [groupingEnabled, setGroupingEnabled] = useState(true);

  // Undo delete
  const [recentlyDeletedTask, setRecentlyDeletedTask] = useState(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const undoTimerRef = useRef(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Fields in the modal
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskStatus, setTaskStatus] = useState('Offen');
  const [taskPriority, setTaskPriority] = useState('Mittel');
  const [taskTags, setTaskTags] = useState('');

  /*
    Category selection in the modal.
    If user picks "Auto", we rely on the existing keyword detection.
    Otherwise, we forcibly set the first keyword from that category.
  */
  const [taskCategory, setTaskCategory] = useState('Auto'); // default

  // Collapsed categories (for grouped view)
  const [collapsedCategories, setCollapsedCategories] = useState({});

  // 1) Load tasks from backend
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

  // 2) Filter & sort
  let filteredTasks = tasks.filter(task => {
    const term = searchTerm.toLowerCase();
    return (
      task.title.toLowerCase().includes(term) ||
      (task.description && task.description.toLowerCase().includes(term)) ||
      (task.tags || []).some(tag => tag.toLowerCase().includes(term))
    );
  });
  if (filterStatus !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.status === filterStatus);
  }
  if (filterPriority !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.priority === filterPriority);
  }
  if (sortOrder === 'asc') {
    filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOrder === 'desc') {
    filteredTasks.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortOrder === 'deadlineAsc') {
    filteredTasks.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  } else if (sortOrder === 'deadlineDesc') {
    filteredTasks.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(b.deadline) - new Date(a.deadline);
    });
  }

  // 3) Category detection
  function getCategoryName(task) {
    const titleLower = task.title.toLowerCase();
    const tagsLower = (task.tags || []).map(tg => tg.toLowerCase());
    // check categories except the last fallback
    for (let i = 0; i < categories.length - 1; i++) {
      const cat = categories[i];
      if (cat.keywords.some(kw => titleLower.includes(kw) || tagsLower.includes(kw))) {
        return cat.name;
      }
    }
    return 'Sonstiges';
  }

  // 4) Group tasks if grouping is enabled
  const groupedTasks = {};
  if (groupingEnabled) {
    categories.forEach(cat => {
      groupedTasks[cat.name] = [];
    });
    filteredTasks.forEach(task => {
      const catName = getCategoryName(task);
      groupedTasks[catName].push(task);
    });
  } else {
    groupedTasks['Alle'] = filteredTasks;
  }

  // Toggle grouping
  function toggleGrouping() {
    setGroupingEnabled(prev => !prev);
  }

  // Collapse/expand category
  function toggleCategory(catName) {
    setCollapsedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  }

  // 5) Drag & drop
  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    let oldCat = null, newCat = null;
    for (let cat in groupedTasks) {
      if (groupedTasks[cat].find(t => t.id === active.id)) oldCat = cat;
      if (groupedTasks[cat].find(t => t.id === over.id)) newCat = cat;
    }
    // reorder within same category
    if (oldCat && newCat && oldCat === newCat) {
      const oldIndex = groupedTasks[oldCat].findIndex(t => t.id === active.id);
      const newIndex = groupedTasks[oldCat].findIndex(t => t.id === over.id);
      const newOrder = arrayMove(groupedTasks[oldCat], oldIndex, newIndex);
      setTasks(prev => {
        const others = prev.filter(t => !groupedTasks[oldCat].some(x => x.id === t.id));
        return [...others, ...newOrder];
      });
    }
    // move to different category => adjust tags
    else if (oldCat && newCat && oldCat !== newCat) {
      const taskToMove = tasks.find(t => t.id === active.id);
      if (!taskToMove) return;
      const oldCatObj = categories.find(c => c.name === oldCat);
      const newCatObj = categories.find(c => c.name === newCat);
      if (newCatObj && newCatObj.keywords.length > 0) {
        const newKW = newCatObj.keywords[0].toLowerCase();
        if (oldCatObj && oldCatObj.keywords.length > 0) {
          const oldKW = oldCatObj.keywords[0].toLowerCase();
          taskToMove.tags = (taskToMove.tags || []).filter(tg => tg.toLowerCase() !== oldKW);
        }
        if (!taskToMove.tags.map(tg => tg.toLowerCase()).includes(newKW)) {
          taskToMove.tags = [...(taskToMove.tags || []), newKW];
        }
      } else if (oldCatObj && oldCatObj.keywords.length > 0) {
        const oldKW = oldCatObj.keywords[0].toLowerCase();
        taskToMove.tags = (taskToMove.tags || []).filter(tg => tg.toLowerCase() !== oldKW);
      }
      setTasks(prev => prev.map(t => t.id === taskToMove.id ? { ...taskToMove } : t));
      // update backend
      try {
        fetch(`http://localhost:5002/tasks/${taskToMove.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskToMove)
        }).catch(err => console.error('Error updating tags:', err));
      } catch (err) {
        console.error('Error updating tags:', err);
      }
    }
  }

  // 6) Delete & Undo
  async function handleDeleteTask(id) {
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;
    setRecentlyDeletedTask(taskToDelete);
    setTasks(prev => prev.filter(t => t.id !== id));
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
      const resp = await fetch(`http://localhost:5002/tasks/${recentlyDeletedTask.id}/undo`, { method: 'POST' });
      if (resp.ok) {
        const undoneTask = await resp.json();
        setTasks(prev => [...prev, undoneTask]);
      } else {
        setTasks(prev => [...prev, recentlyDeletedTask]);
      }
    } catch (err) {
      console.error('Error undoing delete:', err);
      setTasks(prev => [...prev, recentlyDeletedTask]);
    }
    setRecentlyDeletedTask(null);
    setShowUndoToast(false);
  }

  // 7) Modal: Add/Edit
  function handleAddTask() {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskDeadline('');
    setTaskStatus('Offen');
    setTaskPriority('Mittel');
    setTaskTags('');
    setTaskCategory('Auto'); // default
    setShowModal(true);
  }
  function handleEditTask(task) {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskDeadline(task.deadline || '');
    setTaskStatus(task.status || 'Offen');
    setTaskPriority(task.priority || 'Mittel');
    setTaskTags((task.tags || []).join(', '));
    // detect category from keywords or fallback to "Auto"
    const catName = getCategoryName(task);
    const oldCatObj = categories.find(c => c.name === catName);
    if (!oldCatObj || oldCatObj.keywords.length === 0) {
      setTaskCategory('Auto');
    } else {
      const firstKW = oldCatObj.keywords[0].toLowerCase();
      const hasFirstKW = (task.tags || []).some(tag => tag.toLowerCase() === firstKW);
      setTaskCategory(hasFirstKW ? catName : 'Auto');
    }
    setShowModal(true);
  }

  // 8) Save task
  async function saveTask() {
    if (!taskTitle.trim()) {
      alert(t.noTitleAlert);
      return;
    }
    // parse tags from input
    let parsedTags = taskTags.split(',').map(x => x.trim()).filter(Boolean);

    // If user chose a specific category (not "Auto"), forcibly set the first keyword
    if (taskCategory !== 'Auto') {
      const catObj = categories.find(c => c.name === taskCategory);
      if (catObj) {
        const newKW = catObj.keywords.length > 0 ? catObj.keywords[0].toLowerCase() : null;
        // remove old category's first KW if present
        if (editingTask) {
          const oldCatName = getCategoryName(editingTask);
          const oldCatObj = categories.find(c => c.name === oldCatName);
          if (oldCatObj && oldCatObj.keywords.length > 0) {
            const oldKW = oldCatObj.keywords[0].toLowerCase();
            parsedTags = parsedTags.filter(tag => tag.toLowerCase() !== oldKW);
          }
        }
        // add new KW if we have it
        if (newKW && !parsedTags.map(tg => tg.toLowerCase()).includes(newKW)) {
          parsedTags.push(newKW);
        }
      }
    }

    if (editingTask) {
      const updatedTask = {
        ...editingTask,
        title: taskTitle,
        description: taskDescription,
        deadline: taskDeadline,
        status: taskStatus,
        priority: taskPriority,
        tags: parsedTags
      };
      setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));
      // update backend
      try {
        await fetch(`http://localhost:5002/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask)
        });
      } catch (err) {
        console.error('Error updating task:', err);
      }
    } else {
      const newTask = {
        id: 'temp-' + Date.now(),
        title: taskTitle,
        description: taskDescription,
        deadline: taskDeadline,
        status: taskStatus,
        priority: taskPriority,
        tags: parsedTags
      };
      setTasks(prev => [...prev, newTask]);
      // create in backend
      try {
        const res = await fetch('http://localhost:5002/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
        });
        if (res.ok) {
          const data = await res.json();
          setTasks(prev => prev.map(t => (t.id === newTask.id ? data : t)));
        }
      } catch (err) {
        console.error('Error creating task:', err);
      }
    }

    setShowModal(false);
  }

  return (
    <div className={`tasks-page ${darkMode ? 'dark-mode' : ''}`}>
      {/* HEADER */}
      <header className="tasks-header">
        <h2>{t.pageTitle}</h2>
        <div className="header-actions">
          <button className="btn-add" onClick={handleAddTask}>
            {t.addTask}
          </button>
          <button className="btn-toggle-grouping" onClick={toggleGrouping}>
            {groupingEnabled ? t.groupingOn : t.groupingOff}
          </button>
        </div>
      </header>

      {/* FILTERS */}
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
          <option value="deadlineAsc">Deadline (aufsteigend)</option>
          <option value="deadlineDesc">Deadline (absteigend)</option>
        </select>
      </div>

      {/* GROUPED OR FLAT VIEW */}
      {groupingEnabled ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {categories.map(cat => {
            const tasksInCat = groupedTasks[cat.name] || [];
            const bgColor = darkMode ? cat.colorDark : cat.colorLight;
            const isCollapsed = collapsedCategories[cat.name];
            // Translate category name
            const catDisplayName = cat.translations[language] || cat.name;
            return (
              <div key={cat.name} className="category-block">
                <div className="category-header-row" style={{ backgroundColor: bgColor }}>
                  <div className="category-title">
                    <span className="category-icon">{cat.icon}</span>
                    <span>{catDisplayName}</span>
                  </div>
                  <button className="collapse-btn" onClick={() => toggleCategory(cat.name)}>
                    {isCollapsed ? '►' : '▼'} {t.groupToggle}
                  </button>
                </div>
                {!isCollapsed && (
                  <div className="tasks-list-container">
                    <table className="tasks-table">
                      <thead>
                        <tr>
                          <th style={{ width: '3rem' }}></th>
                          <th>Titel</th>
                          <th>Beschreibung</th>
                          <th>{t.deadline}</th>
                          <th>{t.filterPriority}</th>
                          <th>{t.filterStatus}</th>
                          <th>{t.tagsLabel}</th>
                          <th>{t.actions}</th>
                        </tr>
                      </thead>
                      <SortableContext items={tasksInCat.map(task => task.id)} strategy={verticalListSortingStrategy}>
                        <tbody>
                          {tasksInCat.map(task => (
                            <SortableTaskRow
                              key={task.id}
                              task={task}
                              t={t}
                              darkMode={darkMode}
                              dateFormat={dateFormat}
                              onEdit={handleEditTask}
                              onDelete={handleDeleteTask}
                            />
                          ))}
                        </tbody>
                      </SortableContext>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </DndContext>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="tasks-list-container">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th style={{ width: '3rem' }}></th>
                  <th>Titel</th>
                  <th>Beschreibung</th>
                  <th>{t.deadline}</th>
                  <th>{t.filterPriority}</th>
                  <th>{t.filterStatus}</th>
                  <th>{t.tagsLabel}</th>
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <SortableContext items={filteredTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {filteredTasks.map(task => (
                    <SortableTaskRow
                      key={task.id}
                      task={task}
                      t={t}
                      darkMode={darkMode}
                      dateFormat={dateFormat}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </div>
        </DndContext>
      )}

      {/* UNDO TOAST */}
      {showUndoToast && (
        <div className="undo-toast">
          <span>{t.undoToastText}</span>
          <button onClick={handleUndoDelete}>{t.undone}</button>
        </div>
      )}

      {/* MODAL (Add/Edit) with new Category field */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingTask ? t.editTaskTitle : t.addTaskTitle}
      >
        <p style={{ fontSize: '0.8rem', marginBottom: '0.6rem', fontStyle: 'italic' }}>
          {t.categoryInfo}
        </p>
        <label>
          {t.categoryLabel}:
          <select
            value={taskCategory}
            onChange={e => setTaskCategory(e.target.value)}
            style={{ marginBottom: '1rem' }}
          >
            <option value="Auto">{t.categoryAuto}</option>
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>
                {cat.translations[language] || cat.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Titel:
          <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
        </label>
        <label>
          Beschreibung:
          <textarea rows="3" value={taskDescription} onChange={e => setTaskDescription(e.target.value)} />
        </label>
        <label>
          {t.deadlineLabel}:
          <input type="date" value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)} />
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
          <input
            type="text"
            value={taskTags}
            onChange={e => setTaskTags(e.target.value)}
            placeholder="z.B. meeting, hobby"
          />
        </label>
        <button className="btn-primary" onClick={saveTask}>
          {editingTask ? t.edit : t.add}
        </button>
      </Modal>
    </div>
  );
}
