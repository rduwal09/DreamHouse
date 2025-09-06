import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_XXXX"); // replace with your publishable key

export default function CheckoutButton({ bookingId }) {
  const handleCheckout = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // redirect to Stripe checkout
      } else {
        alert("Failed to start checkout");
      }
    } catch (err) {
      console.error(err);
      alert("Error starting checkout");
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Pay with Stripe
    </button>
  );
}
