import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CreateJob from "./pages/CreateJob";
import Settings from "./pages/Settings";
import FAQs from "./pages/FAQs";
import Admin from "./pages/Admin";
import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Jobs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-job" element={<CreateJob />} />
          <Route path="/edit-job/:id" element={<CreateJob />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
