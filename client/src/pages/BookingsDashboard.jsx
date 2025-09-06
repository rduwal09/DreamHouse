// HostDashboard.jsx

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../components/Dashboardnavbar";
import "../styles/HostDashboard.scss";

// ✅ Clean & reliable image URL builder
const getImageUrl = (path) => {
  if (!path) return null;
  const relativePath = path.replace(/^public[\\/]/, "");
  return `http://localhost:3001/${encodeURI(relativePath)}`;
};

const HostDashboard = () => {
  const user = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);
  const [filter, setFilter] = useState("pending");
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.isHost ) {
      fetchBookings();
      fetchListings();
    }
  }, [user]);

  // ✅ Fetch bookings for this host
  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await axios.get(
        `http://localhost:3001/bookings?userId=${user._id}&role=landlord`
      );
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // ✅ Fetch listings created by this host
    const fetchListings = async () => {
    try {
      setLoadingListings(true);
      const res = await axios.get(
        `http://localhost:3001/properties/host/${user._id}`
      );
      setListings(res.data);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setLoadingListings(false);
    }
  };


  // ✅ Update booking status
  const updateStatus = async (bookingId, status) => {
    try {
      await axios.patch(
        `http://localhost:3001/bookings/${bookingId}/status`,
        { status }
      );
      fetchBookings();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // ✅ Delete a listing
  const deleteListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    try {
      await fetch(`http://localhost:5000/api/listings/${listingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator: user._id }),
      });
      alert("Listing deleted successfully");
      fetchListings();
    } catch (err) {
      console.error("Failed to delete listing:", err);
      alert("Failed to delete listing");
    }
  };

  if (!user?.isHost)
    return <p>Access denied. Only hosts can view this page.</p>;

  return (
    <div className="host-dashboard">
      <DashboardNavbar />

      <div className="dashboard-content">
        {/* Rental Requests */}
        <div className="dashboard-header">
          <h2>Rental Requests</h2>
          <button onClick={() => navigate("/")} className="btn-home">
            Back to Home
          </button>
        </div>

        <div className="filter-tabs">
          {["pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`filter-btn ${filter === status ? "active" : ""}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} (
              {bookings.filter((b) => b.status === status).length})
            </button>
          ))}
        </div>

        {loadingBookings ? (
          <p className="loading-text">Loading rental requests...</p>
        ) : bookings.filter((b) => b.status === filter).length === 0 ? (
          <p className="no-bookings">No {filter} rental requests.</p>
        ) : (
          bookings
            .filter((b) => b.status === filter)
            .map((b) => (
              <div key={b._id} className="booking-card">
                <div className="booking-info">
                  <div className="tenant-info">
                    <img
                      src={
                        b.tenant?.profileImagePath
                          ? getImageUrl(b.tenant.profileImagePath)
                          : "/assets/default-avatar.png"
                      }
                      alt={`${b.tenant?.firstName}'s avatar`}
                      className="tenant-avatar"
                    />
                    <p>
                      <strong>Tenant:</strong> {b.tenant?.firstName}{" "}
                      {b.tenant?.lastName}
                    </p>
                  </div>

                  <p>
                    <strong>Listing:</strong> {b.listing?.title}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`status ${b.status}`}>{b.status}</span>
                  </p>
                  <p>
                    <strong>From:</strong>{" "}
                    {new Date(b.startDate).toDateString()}{" "}
                    <strong>To:</strong> {new Date(b.endDate).toDateString()}
                  </p>
                  <p>
                    <strong>Total Price:</strong> ${b.totalPrice}
                  </p>
                </div>

                {b.status === "pending" && (
                  <div className="booking-actions">
                    <button
                      onClick={() => updateStatus(b._id, "approved")}
                      className="btn-approve"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(b._id, "rejected")}
                      className="btn-reject"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
        )}

        {/* Host Listings */}
        <div className="dashboard-header" style={{ marginTop: "3rem" }}>
          <h2>My Listings</h2>
        </div>

        {loadingListings ? (
          <p className="loading-text">Loading listings...</p>
        ) : listings.length === 0 ? (
          <p className="no-listings">You have not created any listings yet.</p>
        ) : (
          <div className="listing-cards">
            {listings.map((listing) => (
              <div key={listing._id} className="listing-card">
                <img
                  src={
                    listing.listingPhotoPaths[0]
                      ? getImageUrl(listing.listingPhotoPaths[0])
                      : "/assets/default-listing.jpg"
                  }
                  alt={listing.title}
                  className="listing-photo"
                />
                <div className="listing-info">
                  <h3>{listing.title}</h3>
                  <p>
                    {listing.city}, {listing.country}
                  </p>
                  <p>${listing.price} / night</p>
                  <div className="listing-actions">
                    <button
                      className="btn-edit"
                      onClick={() => navigate(`/edit-listing/${listing._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => deleteListing(listing._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostDashboard;
