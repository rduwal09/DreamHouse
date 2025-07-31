import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.scss';
import Sidebar from '../../pages/admin/Sidebar';

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, listings: 0, bookings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3001/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error('Stats Error:', err);
        setError('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="stats">
            <div className="card">
              <h3>Total Users</h3>
              <p>{stats.users}</p>
            </div>
            <div className="card">
              <h3>Total Listings</h3>
              <p>{stats.listings}</p>
            </div>
            <div className="card">
              <h3>Total Bookings</h3>
              <p>{stats.bookings}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
