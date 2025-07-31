
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Admin Panel</h2>
      <ul>
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li><Link to="/admin/properties">Properties</Link></li>
        <li><Link to="/admin/users">Users</Link></li>
        <li><Link to="/admin/appointments">Appointments</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
