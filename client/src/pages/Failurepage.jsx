import { Link } from "react-router-dom";

export default function FailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-lg w-full text-center">
        {/* ❌ Emoji instead of XCircle */}
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center text-red-500 text-6xl">
          ❌
        </div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Payment Failed
        </h1>
        <p className="text-gray-600 mb-6">
          Unfortunately, your payment could not be processed. This could be due
          to insufficient funds, incorrect card details, or a declined
          transaction.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
