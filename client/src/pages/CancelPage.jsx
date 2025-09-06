import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Payment Cancelled</h1>
        <p className="text-lg mb-6">
          Your payment was not completed. You can try again whenever you’re ready.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
        >
          Back to Home
        </button>
      </div>
      <Footer />
    </>
  );
};

export default CancelPage;
