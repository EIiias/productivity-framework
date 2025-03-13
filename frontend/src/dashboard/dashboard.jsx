import { useState } from "react";
import "./dashboard.css";

function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  const openTaskCreationWindow = () => {
    setShowModal(true);
  };

  const closeTaskCreationWindow = () => {
    setShowModal(false);
    setTaskName(""); // Reset task name
    setTaskDescription(""); // Reset task description
  };

  const handleCreateTask = async () => {
    if (!taskName || !taskDescription) {
      alert("Please provide both a task name and description.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/tasks", {
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
      } else {
        alert("Error creating task");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error creating task");
    }
  };

  return (
    <div className="container">
      {/* Top Bar */}
      <div className="topBar">
        <button className="taskButton" onClick={openTaskCreationWindow}>
          Add Task
        </button>
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

export default Dashboard;