require('dotenv').config()
const express = require('express')
const { Sequelize, DataTypes } = require('sequelize')
const cors = require('cors')
const https = require('https');
const WebSocket = require('ws');
const fs = require('fs');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

/*
//Setup HTTPS Server for WebSockets & Express
const server = https.createServer({
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('key.pem')
}, app);
*/

// ✅ Attach WebSocket server to the existing HTTPS server (for ws://)
const ws = new WebSocket.Server({ port: 5003 });

console.log("✅ WebSocket server is running on ws://localhost:5003");

// Handle Incoming Connections
ws.on("connection", (ws, req) => {
  console.log(`✅ New client connected from ${req.socket.remoteAddress}`);

  // Send a welcome message
  ws.send("Welcome to the WebSocket server!");

  // Log received messages
  ws.on("message", (message) => {
    console.log(`📩 Received: ${message}`);
  });

  // Log disconnections
  ws.on("close", (code, reason) => {
    console.log(`⚠️ Client disconnected. Code: ${code}, Reason: ${reason}`);
  });

  // Handle errors
  ws.on("error", (err) => {
    console.error("❌ WebSocket Error:", err);
  });
});

// Broadcast function to notify all clients
function broadcast(message) {
  ws.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Connect to postgres
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://taskdb:1234@localhost:5001/taskdb',
  {
    dialect: 'postgres',
    logging: true // <--- set to 'true' oder function(msg) => console.log(msg)
  }
)

sequelize
  .authenticate()
  .then(() => console.log('>>> Verbunden mit PostgreSQL.'))
  .catch((error) => console.error('Fehler beim Verbinden zu PostgreSQL:', error))

// Create needed tables
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
    },
      // Existing fields...
      notified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
  },
  {
    timestamps: true
  }
)

const Users = sequelize.define(
  'Users',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Automatically generates a UUID
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    signupDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    timestamps: false
  }
);

// Update DB if changes are present
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

const cron = require("node-cron");
const { Op } = require("sequelize");

// Run every minute (adjust as needed)
cron.schedule('* * * * *', async () => {
  console.log('>>> Checking for overdue tasks...');

  const now = new Date();
  const overdueTasks = await Task.findAll({
    where: {
      deadline: { [Op.lte]: now },
      status: "Offen",
      notified: false
    }
  });

  for (const task of overdueTasks) {
    console.log(`>>> Sending WebSocket Notification: Task "${task.title}" is overdue!`);

    // Send WebSocket notification
    broadcast({
      type: 'TASK_OVERDUE',
      taskId: task.id,
      title: task.title,
      message: `Task "${task.title}" is overdue!`,
      deadline: task.deadline
    });

    // Mark as notified
    await task.update({ notified: true });
  }

  console.log(`>>> ${overdueTasks.length} notifications sent.`);
});

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(email)

    const newUser = await Users.create({
      email,
      password: hashedPassword
    })

    res.status(201).json({ message: 'Register successful' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Register failed' })
  }
})

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare entered password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // If valid, continue with login (e.g., send token, set session, etc.)
    console.log("User logged in:", user.email);
    res.status(200).json({ message: 'Login successful' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
});

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

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = '60d'; // Customize as needed

function issueToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

module.exports = {
  issueToken
};
