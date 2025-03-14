import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./login/login";
import Dashboard from "./dashboard/dashboard"; 
import TasksPage from "./tasksPage/tasksPage"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TasksPage />} />
      </Routes>
    </Router>
  );
}

export default App;
