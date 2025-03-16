require('dotenv').config()
const express = require('express')
const { Sequelize, DataTypes } = require('sequelize')
const cors = require('cors')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// 1) DB-Verbindung anpassen, wenn dein Port/DB anders ist
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://taskdb:1234@localhost:5001/taskdb',
  {
    dialect: 'postgres',
    logging: true // <--- set to 'true' oder function(msg) => console.log(msg)
  }
)

// 2) Verbindung testen
sequelize
  .authenticate()
  .then(() => console.log('>>> Verbunden mit PostgreSQL.'))
  .catch((error) => console.error('Fehler beim Verbinden zu PostgreSQL:', error))

// 3) Tabellenmodell für Task:
const Task = sequelize.define(
  'Task',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Offen'
    },
    priority: {
      type: DataTypes.STRING,
      defaultValue: 'Mittel'
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Soft-Delete
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    timestamps: true
  }
)

// 4) Sync mit alter:true, damit neue Spalten hinzukommen, falls schon Tabelle existiert
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('>>> DB Sync erfolgreich (Task-Tabelle existiert und wurde ggf. angepasst).')
  })
  .catch((err) => console.error('>>> DB Sync-Fehler:', err))

// =============== ROUTES ===============
app.get('/tasks', async (req, res) => {
  try {
    // Nur nicht-gelöschte Tasks
    const tasks = await Task.findAll({
      where: { deletedAt: null }
    })
    res.json(tasks)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Fehler beim Abrufen der Tasks' })
  }
})

app.post('/tasks', async (req, res) => {
  try {
    // Prüfe ankommende Daten:
    console.log('>>> POST /tasks - req.body =', req.body)

    const { title, description, status, priority, tags, deadline } = req.body

    const newTask = await Task.create({
      title,
      description,
      status: status || 'Offen',
      priority: priority || 'Mittel',
      tags: Array.isArray(tags) ? tags : [],
      deadline: deadline ? new Date(deadline) : null
    })

    res.status(201).json(newTask)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Fehler beim Erstellen eines Tasks' })
  }
})

app.put('/tasks/:id', async (req, res) => {
  try {
    console.log('>>> PUT /tasks/:id - req.body =', req.body)

    const { id } = req.params
    const { title, description, status, priority, tags, deadline } = req.body

    const task = await Task.findByPk(id)
    if (!task || task.deletedAt) {
      return res.status(404).json({ message: 'Task nicht gefunden oder gelöscht.' })
    }

    await task.update({
      title,
      description,
      status: status || 'Offen',
      priority: priority || 'Mittel',
      tags: Array.isArray(tags) ? tags : [],
      deadline: deadline ? new Date(deadline) : null
    })
    res.json(task)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Fehler beim Updaten des Tasks' })
  }
})

// "Soft-Delete" - statt destroy() => deletedAt=now
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params
    const task = await Task.findByPk(id)
    if (!task) {
      return res.status(404).json({ message: 'Task nicht gefunden.' })
    }
    if (task.deletedAt) {
      return res.status(400).json({ message: 'Task ist bereits gelöscht.' })
    }

    await task.update({ deletedAt: new Date() })
    console.log('>>> Task soft-gelöscht:', id)
    res.json({ message: 'Task soft-gelöscht', id })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Fehler beim Löschen eines Tasks' })
  }
})

// Undo - deletedAt=null => Task wiederherstellen
app.post('/tasks/:id/undo', async (req, res) => {
  try {
    const { id } = req.params
    const task = await Task.findByPk(id)
    if (!task) {
      return res.status(404).json({ message: 'Task nicht (mehr) gefunden' })
    }
    if (!task.deletedAt) {
      return res.status(400).json({ message: 'Task ist gar nicht gelöscht, Undo nicht nötig.' })
    }

    await task.update({ deletedAt: null })
    console.log('>>> Task wiederhergestellt:', id)
    res.json(task)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Fehler beim Undo-Löschen' })
  }
})

const PORT = process.env.PORT || 5002
app.listen(PORT, () => {
  console.log(`>>> Server läuft auf Port ${PORT}`)
})
