import React, { useState, useEffect } from "react";
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
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";


// ✅ Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  "pk_test_51S4PFX9Jg9dvYrBkhZREKU9DDCO7YvKgCNYp12EHj6z8dlTD1Ivr37btyNNEEqghEmaaIt93Fp6BqOjUK7TcUfuS00OGLxd6KY"
);

// ✅ Utility to handle image URLs consistently
const getImageUrl = (path) => {
  if (!path) return null;
  const relativePath = path.replace(/^public[\\/]/, "");
  return `http://localhost:3001/${encodeURI(relativePath)}`;
};
const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState({ averageRating: 0, count: 0 });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [rentalRequestStatus, setRentalRequestStatus] = useState(null);
  const [existingBookingId, setExistingBookingId] = useState(null);
  const [existingBooking, setExistingBooking] = useState(null);
  const [disabledDates, setDisabledDates] = useState([]);


  const { listingId } = useParams();
  const navigate = useNavigate();
  const userId = useSelector((state) => state?.user?._id);

  const [dateRange, setDateRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ]);

  const handleSelect = (ranges) => setDateRange([ranges.selection]);
  const dayCount = existingBooking
  ? Math.max(
      1,
      Math.round(
        (new Date(existingBooking.endDate) - new Date(existingBooking.startDate)) /
          (1000 * 60 * 60 * 24)
      )
    )
  : Math.max(
      1,
      Math.round(
        (new Date(dateRange[0].endDate) - new Date(dateRange[0].startDate)) /
          (1000 * 60 * 60 * 24)
      )
    );


  const isHost = String(listing?.creator?._id) === String(userId);

  useEffect(() => {
    let intervalId;

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
        console.error(err);
      }
    };

    const fetchAverage = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/reviews/${listingId}/average`
        );
        const data = await res.json();
        setAverage({
          averageRating: data.averageRating || 0,
          count: data.count || 0,
        });
      } catch (err) {
        console.error(err);
        setAverage({ averageRating: 0, count: 0 });
      }
    };

    const fetchExistingRequest = async () => {
  if (!userId) return;
  try {
    const res = await fetch(
      `http://localhost:3001/bookings/?userId=${userId}&role=tenant`
    );
    if (res.ok) {
      const bookings = await res.json();

      const booking = bookings.find(
        (b) => String(b.listing._id) === String(listingId)
      );

      if (booking) {
        setRentalRequestStatus(booking.status);
        setExistingBookingId(booking._id);
        setExistingBooking(booking); // ✅ now dates will show correctly after reload
      } else {
        setRentalRequestStatus(null);
        setExistingBooking(null);
      }
    }
  } catch (err) {
    console.error("Failed to fetch existing booking:", err);
  }
};


    fetchListing();
    fetchReviews();
    fetchAverage();
    fetchExistingRequest();

    intervalId = setInterval(fetchExistingRequest, 5000);
    return () => clearInterval(intervalId);
  }, [listingId, userId]);


useEffect(() => {
  const fetchDisabledDates = async () => {
    try {
      const res = await fetch(
        `http://localhost:3001/bookings/disabled-dates/${listingId}`
      );
      if (res.ok) {
        const bookings = await res.json();

        let dates = [];
        bookings.forEach(b => {
          const start = new Date(b.startDate);
          const end = new Date(b.endDate);

          let current = new Date(start);
          while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
        });

        setDisabledDates(dates);
      }
    } catch (err) {
      console.error("Failed to fetch disabled dates:", err);
    }
  };

  fetchDisabledDates();
}, [listingId]);







  const handleRentalRequest = async () => {
    if (!listing || !userId || isHost) return;

    try {
      const requestData = {
        tenant: userId,
        landlord: listing.creator._id,
        listing: listingId,
        startDate: dateRange[0].startDate.toISOString(),
        endDate: dateRange[0].endDate.toISOString(),
        totalPrice: listing.price * dayCount,
      };

      let res;
      if (rentalRequestStatus === "rejected" && existingBookingId) {
        res = await fetch(
          `http://localhost:3001/bookings/${existingBookingId}/request-again`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData),
          }
        );
      } else {
        res = await fetch("http://localhost:3001/bookings/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });
      }

      if (res.ok) {
        const data = await res.json();
        setRentalRequestStatus(data.status); 
        setExistingBookingId(data._id);
        setExistingBooking(data);  // ✅ save full booking object
        toast.success("Rental request submitted!");
      
      } else {
        const error = await res.json();
        toast.eroor( "Failed to submit request");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit request");
    }
  };

  // ✅ Handle Stripe payment
  const handlePayment = async () => {
    try {
      const res = await fetch(
        "http://localhost:3001/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: listing.price * dayCount,
            bookingId: existingBookingId,
          }),
        }
      );

      const { id } = await res.json();

      const stripe = await stripePromise;
      const result = await stripe.redirectToCheckout({ sessionId: id });

      if (result.error) {
        alert(result.error.message);
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Failed to start payment");
    }
  };

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
        setReviews((prev) => [data.review, ...prev]);
        setAverage(data.average);
        setRating(0);
        setComment("");
      } else {
        const error = await res.json();
        toast.error("Failed to submit review");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review");
    }
  };

  if (loading) return <Loader />;
  if (error)
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>{error}</p>;
  if (!listing)
    return (
      <p style={{ textAlign: "center", marginTop: "2rem" }}>
        Property not found
      </p>
    );

  return (
    <>
      <Navbar />
      <div className="listing-details">
        <div className="title">
          <h1>{listing.title}</h1>
        </div>

        <div className="photos">
          {listing.listingPhotoPaths?.map((item, idx) => (
            <img key={idx} src={getImageUrl(item)} alt={`listing-${idx}`} />
          ))}
        </div>

        <h2>
          {listing.type} in {listing.city}, {listing.province},{" "}
          {listing.country}
        </h2>
        <p>
          {listing.guestCount} guests - {listing.bedroomCount} bedroom(s) -{" "}
          {listing.bedCount} bed(s) - {listing.bathroomCount} bathroom(s)
        </p>
        <hr />

        <div className="profile">
          <img
            src={getImageUrl(listing.creator?.profileImagePath)}
            alt="host"
          />
          <h3>
            Hosted by {listing.creator?.firstName} {listing.creator?.lastName}
          </h3>
        </div>
        <hr />

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

        <div className="booking">
          <div>
            <h2>What this place offers?</h2>
            <div className="amenities">
              {listing.amenities?.[0]
                ?.split(",")
                .map((item, idx) => (
                  <div className="facility" key={idx}>
                    <div className="facility_icon">
                      {facilities.find((f) => f.name === item)?.icon}
                    </div>
                    <p>{item}</p>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h2>Rental</h2>
            <div className="date-range-calendar">
              <DateRange
                ranges={dateRange}
                onChange={handleSelect}
                disabledDates={disabledDates}     // booked days (red)
                minDate={new Date(new Date().setHours(0, 0, 0, 0))} // block past dates
              />
              <h2>
                ${listing.price} x {dayCount} {dayCount > 1 ? "nights" : "night"}
              </h2>
              <h2>Total price: ${listing.price * dayCount}</h2>

             <p>
                Requested Start Date:{" "}
                {existingBooking
                  ? new Date(existingBooking.startDate).toDateString()
                  : dateRange[0].startDate.toDateString()}
              </p>

              <p>
                Requested End Date:{" "}
                {existingBooking
                  ? new Date(existingBooking.endDate).toDateString()
                  : dateRange[0].endDate.toDateString()}
              </p>



              {isHost ? (
                <button className="button" disabled>
                  Cannot Request Own Property
                </button>
              ) : rentalRequestStatus === "pending" ? (
                <button className="button" disabled>
                  Request Pending
                </button>
              ) : rentalRequestStatus === "approved" ? (
                <>
                  <button className="button" disabled>
                    Request Approved
                  </button>
                  <button
                    className="button"
                    style={{ marginLeft: "10px", backgroundColor: "#22c55e" }}
                    onClick={handlePayment}
                  >
                    Pay Now
                  </button>
                </>
              ) : rentalRequestStatus === "paid" ? (
                <button className="button" disabled>
                  ✅ Property Booked
                </button>
              ) : rentalRequestStatus === "rejected" ? (
                <>
                  <button className="button" disabled>
                    Request Rejected
                  </button>
                  <button
                    className="button"
                    style={{ marginLeft: "10px", backgroundColor: "#f97316" }}
                    onClick={handleRentalRequest}
                  >
                    Request Again
                  </button>
                </>
              ) : (
                <button className="button" onClick={handleRentalRequest}>
                  Request to Rent
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="reviews mt-8">
          <h2>Reviews</h2>
          <p>
            ⭐ {average?.averageRating?.toFixed(1) || "0.0"} (
            {average?.count || 0} reviews)
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
                    style={{
                      cursor: "pointer",
                      fontSize: "1.5rem",
                      color: rating >= star ? "#f59e0b" : "#ccc",
                    }}
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
                <p className="font-semibold">
                  {r.user?.name || "Anonymous"}
                </p>
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
//hehehehehehh
export default ListingDetails;
