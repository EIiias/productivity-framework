import { useState, useEffect } from "react";
import "./tasksPage.css";

function TasksPage() {
  const [showModal, setShowModal] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [tasks, setTasks] = useState([]); // Store tasks in state

  const openTaskCreationWindow = () => {
    setShowModal(true);
  };

  const closeTaskCreationWindow = () => {
    setShowModal(false);
    setTaskName(""); // Reset task name
    setTaskDescription(""); // Reset task description
  };

  const displayTasks = async () => {
    try {
      const response = await fetch("http://localhost:5002/tasks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const fetchedTasks = await response.json();
        console.log("Fetched tasks successfully:", fetchedTasks);
        setTasks(fetchedTasks); // Update state with fetched tasks
      } else {
        alert("Error fetching tasks");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error fetching tasks");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5002/tasks/${taskId}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        console.log("Task deleted:", taskId);
        setTasks(tasks.filter(task => task.id !== taskId)); // Remove from state
      } else {
        alert("Error deleting task");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error deleting task");
    }
  };

  const handleCreateTask = async () => {
    if (!taskName || !taskDescription) {
      alert("Please provide both a task name and description.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5002/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: taskName,
          description: taskDescription,
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        console.log("Task created:", newTask);
        closeTaskCreationWindow(); // Close the modal after successful creation
        displayTasks(); // Refresh task list after adding a new task
      } else {
        alert("Error creating task");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error creating task");
    }
  };

  // Fetch tasks on component mount
  useEffect(() => {
    displayTasks();
  }, []);

  return (
    <div className="container">
      {/* Top Bar */}
      <div className="topBar">
        <button className="topBarButton" onClick={openTaskCreationWindow}>
          Add Task
        </button>
        <button className="topBarButton" onClick={displayTasks}>
          Refresh Tasks
        </button>
      </div>

    {/* Task List */}
    <div className="taskList">
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <div key={task.id} className="taskBar">
            <div className="taskInfo">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
            </div>
            <button className="deleteButton" onClick={() => handleDeleteTask(task.id)}>
              ✖ Delete
            </button>
          </div>
        ))
      ) : (
        <p>No tasks found.</p>
      )}
    </div>

      {/* Task Creation Modal */}
      {showModal && (
        <div className="modalOverlay">
          <div className="modalWindow">
            <div className="modalHeader">
              <h2>Create Task</h2>
              <button className="closeButton" onClick={closeTaskCreationWindow}>
                ✖
              </button>
            </div>
            <div className="modalContent">
              <input
                type="text"
                placeholder="Task Name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
              <textarea
                placeholder="Task Description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              ></textarea>
              <button className="submitButton" onClick={handleCreateTask}>
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TasksPage;