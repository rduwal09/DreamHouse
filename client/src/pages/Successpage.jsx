// client/src/pages/SuccessPage.js
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;

    fetch(`http://localhost:3001/api/payment/checkout-session/${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch session");
        return res.json();
      })
      .then((data) => setSession(data))
      .catch((e) => setError(e.message));
  }, [searchParams]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "16px", color: "#2e7d32" }}>
        Payment Successful 🎉
      </h1>

      {error && (
        <p style={{ color: "crimson", marginBottom: "16px" }}>Error: {error}</p>
      )}

      {!session && !error && <p>Loading payment details…</p>}

      {session && (
        <div style={{ marginTop: "20px" }}>
          <p>
            <strong>Payment ID:</strong>{" "}
            {session.payment_intent?.id || "N/A"}
          </p>
          <p>
            <strong>Amount:</strong>{" "}
            {session.amount_total
              ? (session.amount_total / 100).toFixed(2)
              : "-"}{" "}
            {session.currency?.toUpperCase()}
          </p>
          <p>
            <strong>Status:</strong> {session.payment_status}
          </p>
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <Link
          to="/"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#2e7d32",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "6px",
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
