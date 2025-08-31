import { useEffect, useState } from "react";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSelector } from "react-redux";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listing, setListing] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState({ averageRating: 0, count: 0 });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { listingId } = useParams();
  const navigate = useNavigate();
  const userId = useSelector((state) => state?.user?._id);

  const [dateRange, setDateRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ]);

  const handleSelect = (ranges) => setDateRange([ranges.selection]);
  const dayCount = Math.max(
    1,
    Math.round(
      (new Date(dateRange[0].endDate) - new Date(dateRange[0].startDate)) /
        (1000 * 60 * 60 * 24)
    )
  );

  const isHost = String(listing?.creator?._id) === String(userId);

  // Fetch listing, reviews, and average rating
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`http://localhost:3001/properties/${listingId}`);
        if (!res.ok) throw new Error("Failed to fetch listing");
        const data = await res.json();
        setListing(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://localhost:3001/reviews/${listingId}`);
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };

    const fetchAverage = async () => {
      try {
        const res = await fetch(`http://localhost:3001/reviews/${listingId}/average`);
        const data = await res.json();
        // Ensure we have default structure
        setAverage({
          averageRating: data.averageRating || 0,
          count: data.count || 0,
        });
      } catch (err) {
        console.error("Failed to fetch average rating:", err);
        setAverage({ averageRating: 0, count: 0 });
      }
    };

    fetchListing();
    fetchReviews();
    fetchAverage();
  }, [listingId]);

  // Booking
  const handleBooking = async () => {
    if (!listing || !userId || isHost) return;

    try {
      const bookingForm = {
        customerId: userId,
        listingId,
        hostId: listing.creator._id,
        startDate: dateRange[0].startDate.toDateString(),
        endDate: dateRange[0].endDate.toDateString(),
        totalPrice: listing.price * dayCount,
      };

      const res = await fetch("http://localhost:3001/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingForm),
      });

      if (res.ok) navigate(`/${userId}/trips`);
    } catch (err) {
      console.error("Booking failed:", err);
    }
  };

  // Review submission
  const handleReviewSubmit = async (e) => {
  e.preventDefault();
  if (!rating || !comment) return;

  try {
    const res = await fetch("http://localhost:3001/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, rating, comment, userId }),
    });

    if (res.ok) {
      const data = await res.json();
      setReviews((prev) => [data.review, ...prev]); // add new review
      setAverage(data.average); // update average
      setRating(0);
      setComment("");
    } else {
      const error = await res.json();
      alert(error.message || "Failed to submit review");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to submit review");
  }
};


  if (loading) return <Loader />;
  if (error) return <p style={{ textAlign: "center", marginTop: "2rem" }}>{error}</p>;
  if (!listing) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Property not found</p>;

  return (
    <>
      <Navbar />
      <div className="listing-details">
        {/* Title */}
        <div className="title">
          <h1>{listing.title}</h1>
        </div>

        {/* Photos */}
        <div className="photos">
          {listing.listingPhotoPaths?.map((item, idx) => (
            <img
              key={idx}
              src={`http://localhost:3001/${item.replace("public", "")}`}
              alt={`listing-${idx}`}
            />
          ))}
        </div>

        {/* Basic Info */}
        <h2>
          {listing.type} in {listing.city}, {listing.province}, {listing.country}
        </h2>
        <p>
          {listing.guestCount} guests - {listing.bedroomCount} bedroom(s) - {listing.bedCount} bed(s) -{" "}
          {listing.bathroomCount} bathroom(s)
        </p>
        <hr />

        {/* Host Info */}
        <div className="profile">
          <img
            src={`http://localhost:3001/${listing.creator?.profileImagePath?.replace("public", "")}`}
            alt="host"
          />
          <h3>
            Hosted by {listing.creator?.firstName} {listing.creator?.lastName}
          </h3>
        </div>
        <hr />

        {/* Description */}
        <h3>Description</h3>
        <p>{listing.description}</p>
        <hr />

        {listing.highlight && (
          <>
            <h3>{listing.highlight}</h3>
            <p>{listing.highlightDesc}</p>
            <hr />
          </>
        )}

        {/* Booking Section */}
        <div className="booking">
          <div>
            <h2>What this place offers?</h2>
            <div className="amenities">
              {listing.amenities?.[0]?.split(",").map((item, idx) => (
                <div className="facility" key={idx}>
                  <div className="facility_icon">{facilities.find((f) => f.name === item)?.icon}</div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2>Booking</h2>
            <div className="date-range-calendar">
              <DateRange ranges={dateRange} onChange={handleSelect} />
              <h2>
                ${listing.price} x {dayCount} {dayCount > 1 ? "nights" : "night"}
              </h2>
              <h2>Total price: ${listing.price * dayCount}</h2>
              <p>Start Date: {dateRange[0].startDate.toDateString()}</p>
              <p>End Date: {dateRange[0].endDate.toDateString()}</p>

              <button
                className="button"
                onClick={handleBooking}
                disabled={isHost}
                title={isHost ? "You cannot book your own property" : ""}
              >
                {isHost ? "Cannot Book Own Property" : "BOOKING"}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews mt-8">
          <h2>Reviews</h2>
          <p>
            ⭐ {average?.averageRating?.toFixed(1) || "0.0"} ({average?.count || 0} reviews)
          </p>

          {!isHost && (
            <form onSubmit={handleReviewSubmit} className="mb-4">
              <label>Your Rating:</label>
              <div className="star-rating mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${rating >= star ? "filled" : ""}`}
                    onClick={() => setRating(star)}
                    style={{ cursor: "pointer", fontSize: "1.5rem", color: rating >= star ? "#f59e0b" : "#ccc" }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review..."
              />
              <button type="submit">Submit Review</button>
            </form>
          )}

          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r._id} className="review">
                <p className="font-semibold">{r.user?.name || "Anonymous"}</p>
                <p>⭐ {r.rating}</p>
                <p>{r.comment}</p>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ListingDetails;
