import { useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("your_publishable_key_here");

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const handleCheckout = async () => {
    const stripe = await stripePromise;

    const res = await fetch("/api/payment/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ name: "Booking Payment", price: 100, quantity: 1 }],
        bookingId,
        userId: "123", // get from auth context
        propertyId: "456", // get from listing
      }),
    });

    const { id } = await res.json();
    const { error } = await stripe.redirectToCheckout({ sessionId: id });
    if (error) console.error(error);
  };

  return (
    <div>
      <h2>Complete Your Payment</h2>
      <button onClick={handleCheckout}>Pay with Stripe</button>
    </div>
  );
}
