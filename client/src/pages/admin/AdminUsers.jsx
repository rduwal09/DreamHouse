import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./AdminUsers.scss";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:3001/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err.message);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.fullname?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;
  try {
    const token = localStorage.getItem("adminToken");
    const res = await axios.delete(`http://localhost:3001/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) {
      setUsers((prev) => prev.filter((u) => u._id !== res.data.id));
    }
  } catch (err) {
    console.error("Error deleting user:", err.message);
  }
};


  const handleToggleHost = async (id, currentStatus) => {
  try {
    const token = localStorage.getItem("adminToken");
    const res = await axios.patch(
      `http://localhost:3001/api/admin/users/${id}/toggle-host`,
      { isHost: !currentStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setUsers((prev) =>
      prev.map((u) =>
        u._id === id ? { ...u, isHost: res.data.isHost } : u
      )
    );
  } catch (err) {
    console.error("Error toggling host status:", err.message);
  }
};


  return (
    <AdminLayout>
      <div className="admin-users">
        <div className="header">
          <h2>All Users</h2>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u, i) => (
                <tr key={u._id}>
                  <td>{i + 1}</td>
                  <td>{u.email}</td>
                  <td>{u.fullname || "N/A"}</td>
                  <td>{u.isHost ? "Host & Tenant" : "Tenant"}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="toggle-btn"
                        onClick={() => handleToggleHost(u._id, u.isHost)}
                      >
                        {u.isHost ? "Remove Host Role" : "Make Host"}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(u._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
