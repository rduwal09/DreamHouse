import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/SuccessPage.scss";

const SuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Confirming your booking...");
  const navigate = useNavigate();

  useEffect(() => {
    const confirmBooking = async () => {
      const params = new URLSearchParams(window.location.search);
      const bookingId = params.get("bookingId");

      if (!bookingId) {
        setMessage("❌ No booking ID found.");
        setLoading(false);
        return;
      }

      try {
        // Call backend to mark booking as paid
        const res = await fetch(`http://localhost:3001/bookings/${bookingId}/mark-paid`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
            });

        if (res.ok) {
          const booking = await res.json();

          if (booking.status === "paid") {
            setMessage("🎉 Payment successful! Your property has been booked.");
          } else {
            setMessage("⚠️ Payment succeeded, but booking not confirmed yet.");
          }
        } else {
          setMessage("⚠️ Payment succeeded, but failed to update booking.");
        }
      } catch (err) {
        console.error(err);
        setMessage("❌ Something went wrong confirming your booking.");
      } finally {
        setLoading(false);
      }
    };

    confirmBooking();
  }, []);

  return (
    <>
      <Navbar />
      <div className="success-container">
        <div className="success-card">
          <h1>Payment Success</h1>
          <p>{message}</p>

          {!loading && (
            <button className="button" onClick={() => navigate("/")}>
              Go Back Home
            </button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SuccessPage;
