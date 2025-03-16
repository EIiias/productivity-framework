import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login/login";
import Dashboard from "./dashboard/dashboard"; 
import TasksPage from "./tasksPage/tasksPage"; 
import NotFound from "./404/404"; 
import useWebSocket from "./hooks/useWebSocket";
import NotificationPopup from "./components/notificationPopup";

function App() {
  const notifications = useWebSocket('ws://localhost:5003'); // WebSocket URL

  return (
    <Router>
      <NotificationPopup notifications={notifications} /> {/* Show Notifications */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TasksPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;