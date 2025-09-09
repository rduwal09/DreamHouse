import { useEffect, useState } from "react";
import axios from "axios";
import { Users, Home, CalendarCheck, DollarSign } from "lucide-react";
import AdminLayout from "./AdminLayout";
import "./Dashboard.scss"; // ✅ Import SCSS
import DashboardCharts from "./Charts/DashboardCharts";



const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, listings: 0, bookings: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:3001/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats(res.data);
      } catch (err) {
        console.error("❌ Stats Error:", err.response?.data || err.message);
        setError("Failed to fetch dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <h1>📊 Admin Dashboard</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="stats-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card loading"></div>
            ))}
          </div>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="stats-grid">
            <div className="card">
              <div className="icon users">
                <Users size={28} />
              </div>
              <h3>Total Users</h3>
              <p>{stats.users}</p>
            </div>

            <div className="card">
              <div className="icon listings">
                <Home size={28} />
              </div>
              <h3>Total Listings</h3>
              <p>{stats.listings}</p>
            </div>

            <div className="card">
              <div className="icon bookings">
                <CalendarCheck size={28} />
              </div>
              <h3>Total Bookings</h3>
              <p>{stats.bookings}</p>
            </div>

            <div className="card">
              <div className="icon revenue">
                <DollarSign size={28} />
              </div>
              <h3>Total Revenue</h3>
              <p>${stats.revenue}</p>
            </div>
          </div>
        )}

        <DashboardCharts />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
