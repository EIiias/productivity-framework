require("dotenv").config();
const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors()); // Allow requests from frontend
app.use(express.json()); // Parse JSON requests

console.log(process.env.DATABASE_URL);

// Connect to PostgreSQL using Sequelize
const sequelize = new Sequelize("postgres://taskdb:1234@localhost:5001/taskdb", {
  dialect: "postgres",
  logging: false, // Set to true if you want to log SQL queries
});

// Test PostgreSQL connection
sequelize
  .authenticate()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((error) => console.error("Unable to connect to PostgreSQL:", error));

// Define Task Model
const Task = sequelize.define(
  "Task",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    timestamps: false, // Disable automatic `updatedAt` and `createdAt` columns if not needed
  }
);

// Sync the model with the database (create table if it doesn't exist)
sequelize.sync();

// Routes

// Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// Create a new task
app.post("/tasks", async (req, res) => {
  const { title, description } = req.body;
  try {
    const newTask = await Task.create({ title, description });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Error creating task" });
  }
});

// Delete a task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (task) {
      await task.destroy();
      res.json({ message: "Task deleted" });
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));