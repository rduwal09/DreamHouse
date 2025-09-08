import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./AdminBookings.scss";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch bookings on mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:3001/api/admin/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
      } catch (err) {
        console.error("Error fetching bookings:", err.message);
      }
    };
    fetchBookings();
  }, []);

  // Delete booking
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:3001/api/admin/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Error deleting booking:", err.message);
    }
  };

//   // Refund booking
//  const handleRefund = async (id) => {
//   if (!window.confirm("Are you sure you want to refund this booking?")) return;

//   try {
//     const token = localStorage.getItem("adminToken");
//     const res = await axios.patch(
//       `http://localhost:3001/api/admin/bookings/${id}/refund`,
//       {},
//       { headers: { Authorization: `Bearer ${token}` } }
//     );

//     // Update local state
//     setBookings((prev) =>
//       prev.map((b) =>
//         b._id === id ? { ...b, paymentStatus: "refunded" } : b
//       )
//     );

//     alert("✅ Refund successful via Stripe!");
//     console.log(res.data);
//   } catch (err) {
//     console.error("Refund error:", err.message);
//     alert("❌ Refund failed");
//   }
// };


  // Filtered bookings
  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.tenant?.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.listing?.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.landlord?.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || b.paymentStatus === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="admin-bookings">
        <div className="header">
          <h2>Bookings</h2>
          <div className="filters">
            <input
              type="text"
              placeholder="Search by user, property or owner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>Paid</option>
              <option>Unpaid</option>
              <option>Failed</option>
              <option>Refunded</option>
            </select>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Property</th>
              <th>Owner</th>
              <th>City</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Price</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((b, i) => (
                <tr key={b._id}>
                  <td>{i + 1}</td>
                  <td>{b.tenant?.email || "N/A"}</td>
                  <td>{b.listing?.title || "N/A"}</td>
                  <td>{b.landlord?.email || "N/A"}</td>
                  <td>{b.listing?.city || "N/A"}</td>
                  <td>
                    <span className="date-badge">
                      {new Date(b.startDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span className="date-badge">
                      {new Date(b.endDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td>${b.totalPrice || "0"}</td>
                  <td className={`status ${b.paymentStatus}`}>
                    {b.paymentStatus}
                  </td>
                  <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(b._id)}
                    >
                      Delete
                    </button>
                    {/* {b.paymentStatus === "paid" && (
                      <button
                        className="refund-btn"
                        onClick={() => handleRefund(b._id)}
                      >
                        Refund
                      </button>
                    )} */}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: "center" }}>
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminBookings;
