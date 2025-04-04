require('dotenv').config()
const express = require('express')
const { Sequelize, DataTypes } = require('sequelize')
const cors = require('cors')
const https = require('https');
const WebSocket = require('ws');
const fs = require('fs');
const jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs');

// initialize express
const app = express()
app.use(cors())
app.use(express.json())

// connect to postgres
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://taskdb:1234@localhost:5001/taskdb',
  {
    dialect: 'postgres',
    logging: true // <--- set to 'true' oder function(msg) => console.log(msg)
  }
)

sequelize
  .authenticate()
  .then(() => console.log('Connected to postgres db'))
  .catch((error) => console.error('Error connecting to postgres db', error))

// define tables for postgres
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
    console.log('Synced db tables with source structure')
  })
  .catch((err) => console.error('Failed to sync db tables with source structure', err))

// API endpoints

// register new account
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user in db
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

// login to account
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await Users.findOne({ where: { email } });

    // if user is not found return error
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare entered password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // if password is wrong return error
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // If valid, continue with login (e.g., send token, set session, etc.)
    console.log("User logged in:", user.email);
    const accessToken = jwt.sign({ userId: user.id}, process.env.ACCESS_TOKEN_SECRET)
    res.status(200).json({ accessToken: accessToken, message: 'Login successful' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
});

const PORT = process.env.PORT || 5002
app.listen(PORT, () => {
  console.log(`Express is running on port ${PORT}`)
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, id) => {
      if (err) return res.sendStatus(403)
        req.userId = id.userId
        next()
  })
}