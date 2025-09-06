// client/src/components/CheckoutButton.js
import React, { useState } from "react";

export default function CheckoutButton({ items, bookingId, userId, propertyId }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!items || items.length === 0) {
      console.error("❌ No items passed to CheckoutButton");
      return;
    }

    setLoading(true);

    try {
      console.log("📤 Sending checkout request:", { items, bookingId, userId, propertyId });

      const response = await fetch("http://localhost:3001/api/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, bookingId, userId, propertyId }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text}`);
      }

      const data = await response.json();
      console.log("✅ Checkout session response:", data);

      if (data.url) {
        window.location.href = data.url; // 🚀 Redirect to Stripe
      } else {
        console.error("❌ No checkout URL returned:", data);
      }
    } catch (err) {
      console.error("❌ Checkout error:", err);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
    >
      {loading ? "Redirecting..." : "Pay with Stripe"}
    </button>
  );
}
