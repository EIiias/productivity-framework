import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login/login";
import Dashboard from "./dashboard/dashboard"; // New Page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;