import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { setLogin } from "./redux/state";

import "./App.css";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CreateListing from "./pages/CreateListing";
import ListingDetails from "./pages/ListingDetails";
import TripList from "./pages/TripList";
import WishList from "./pages/WishList";
import PropertyList from "./pages/PropertyList";
import ReservationList from "./pages/ReservationList";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from './pages/admin/Dashboard';
import RequireAdminAuth from './components/RequireAdminAuth';
import AdminUsers from './pages/admin/AdminUsers';

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  // Persist login from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      dispatch(setLogin({ user: JSON.parse(savedUser), token: savedToken }));
    }
  }, [dispatch]);

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/properties/search" element={<SearchPage />} />
        <Route path="/properties/category/:category" element={<CategoryPage />} />
        <Route path="/properties/:listingId" element={<ListingDetails />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Routes */}
        <Route path="/create-listing" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
        <Route path="/:userId/trips" element={<ProtectedRoute><TripList /></ProtectedRoute>} />
        <Route path="/:userId/wishList" element={<ProtectedRoute><WishList /></ProtectedRoute>} />
        <Route path="/:userId/properties" element={<ProtectedRoute><PropertyList /></ProtectedRoute>} />
        <Route path="/:userId/reservations" element={<ProtectedRoute><ReservationList /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<RequireAdminAuth><AdminDashboard /></RequireAdminAuth>} />
        <Route path="/admin/users" element={<RequireAdminAuth><AdminUsers /></RequireAdminAuth>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
