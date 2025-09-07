import React from "react";
import Sidebar from "./Components/Sidebar";
import "./AdminLayout.scss";

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">{children}</div>
    </div>
  );
};

export default AdminLayout;
