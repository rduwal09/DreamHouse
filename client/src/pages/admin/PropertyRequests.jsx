import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./PropertyRequests.scss";

const PropertyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | pending | approved | rejected

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:3001/api/admin/property-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Only keep requests with status pending/approved/rejected
        const filtered = res.data.filter((req) =>
          ["pending", "approved", "rejected"].includes(req.status)
        );

        setRequests(filtered);
      } catch (err) {
        console.error("❌ Fetch Error:", err.response?.data || err.message);
        setError("Failed to fetch property requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // ✅ Apply extra filtering based on tab selection
  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((req) => req.status === filter);

  return (
    <AdminLayout>
      <div className="p-6 property-requests">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">🏠 Property Requests</h1>

        {/* Filter buttons */}
        <div className="filters flex gap-3 mb-6">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status ? "active" : ""
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="loading text-gray-500">Loading requests...</p>
        ) : error ? (
          <p className="error text-red-500">{error}</p>
        ) : filteredRequests.length === 0 ? (
          <p className="empty text-gray-600">No {filter} property requests found.</p>
        ) : (
          <div className="table-container overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Owner</th>
                  <th>Property</th>
                  <th>City</th>
                  <th>Total Price</th>
                  <th>Request Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req, i) => (
                  <tr key={req._id}>
                    <td>{i + 1}</td>
                    <td>{req.tenant?.email || "N/A"}</td>
                    <td>{req.landlord?.email || "N/A"}</td>
                    <td>{req.listing?.title || "N/A"}</td>
                    <td>{req.listing?.city || "N/A"}</td>
                    <td>${req.totalPrice}</td>
                    <td className="date">
                        <span className="badge">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </td>

                    <td className="status">
                      <span className={`badge ${req.status}`}>{req.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PropertyRequests;
