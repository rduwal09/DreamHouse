import { useSearchParams } from "react-router-dom";
import CheckoutButton from "../components/Checkoutbutton";

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  if (!bookingId) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>
      ❌ No booking ID provided.
    </p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Complete Your Payment</h1>
      <p className="mb-4 text-gray-700">
        You are about to pay for booking ID: <strong>{bookingId}</strong>
      </p>
      <CheckoutButton bookingId={bookingId} />
    </div>
  );
}
