import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.scss';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Admin Panel</h2>
      <ul>
        <li><NavLink to="/admin/dashboard" activeClassName="active">Dashboard</NavLink></li>
        <li><NavLink to="/admin/users" activeClassName="active">Users</NavLink></li>
        <li><NavLink to="/admin/properties" activeClassName="active">Properties</NavLink></li>
        <li><NavLink to="/admin/property-requests" activeClassName="active">Property Requests</NavLink></li>
        <li><NavLink to="/admin/bookings" activeClassName="active">Bookings</NavLink></li>
        
      </ul>
    </div>
  );
};

export default Sidebar;
