import { useState } from "react";
import "./dashboard.css";

function Dashboard() {
  const [showModal, setShowModal] = useState(false);

  const openTaskCreationWindow = () => {
    setShowModal(true);
  };

  const closeTaskCreationWindow = () => {
    setShowModal(false);
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
              <input type="text" placeholder="Task Name" />
              <textarea placeholder="Task Description"></textarea>
              <button className="submitButton">Create Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
