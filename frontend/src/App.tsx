import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { isLoggedIn } from "./api/client";

export default function App() {
  // Simple hash-based routing — no react-router needed
  const [page, setPage] = useState(() => window.location.hash.replace("#", "") || "home");

  const navigate = (to: string) => {
    window.location.hash = to;
    setPage(to);
  };

  if (page === "admin") {
    if (!isLoggedIn()) return <AdminLogin onLogin={() => navigate("dashboard")} />;
    return <AdminDashboard onLogout={() => navigate("home")} />;
  }
  if (page === "dashboard") {
    if (!isLoggedIn()) return <AdminLogin onLogin={() => navigate("dashboard")} />;
    return <AdminDashboard onLogout={() => navigate("home")} />;
  }

  return <LandingPage onAdmin={() => navigate("admin")} />;
}
