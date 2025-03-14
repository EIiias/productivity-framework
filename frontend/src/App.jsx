import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login/login";
import Dashboard from "./dashboard/dashboard"; // New Page
import Tasks from "./tasks/tasks"; // New Tasks

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
      </Routes>
    </Router>
  );
}

export default App;