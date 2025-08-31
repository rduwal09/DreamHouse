import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function Reviews({ listingId }) {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const user = useSelector((state) => state.user); // logged-in user

  // Fetch reviews and average rating
  useEffect(() => {
    if (!listingId) return;
    fetchReviews();
    fetchAverage();
    // eslint-disable-next-line
  }, [listingId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:3001/reviews/${listingId}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const fetchAverage = async () => {
    try {
      const res = await fetch(`http://localhost:3001/reviews/${listingId}/average`);
      if (!res.ok) throw new Error("Failed to fetch average rating");
      const data = await res.json();
      setAverage(data);
    } catch (err) {
      console.error("Error fetching average rating:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to submit a review!");
    if (!rating || !comment) return alert("Please provide a rating and comment!");

    try {
      const res = await fetch("http://localhost:3001/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          userId: user._id,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        setRating(0);
        setComment("");
        fetchReviews();  // refresh reviews
        fetchAverage();  // refresh average rating
      } else {
        console.error("Error submitting review:", await res.text());
      }
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold">Reviews</h3>

      {/* Average rating */}
      {average && (
        <p className="text-gray-600 mb-4">
          ⭐ {average?.averageRating?.toFixed(1) || 0} ({average?.count || 0} reviews)
        </p>
      )}

      {/* Review submission form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <label className="block mb-2 font-medium">Your Rating:</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border rounded px-2 py-1 mb-2"
          >
            <option value="0">Select rating</option>
            {[1,2,3,4,5].map((n) => <option key={n} value={n}>⭐ {n}</option>)}
          </select>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
            className="w-full border rounded px-3 py-2 mb-2"
          />

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Submit Review
          </button>
        </form>
      ) : (
        <p className="text-gray-500 mb-4">Login to leave a review.</p>
      )}

      {/* List of reviews */}
      {reviews.length > 0 ? (
        reviews.map((r) => (
          <div key={r._id} className="border-b py-2">
            <p className="font-semibold">{r.user?.name || "Anonymous"}</p>
            <p>⭐ {r.rating}</p>
            <p>{r.comment}</p>
          </div>
        ))
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
}

export default Reviews;
