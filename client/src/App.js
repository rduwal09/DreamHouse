import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { setLogin } from "./redux/state";

import "./App.css";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CreateListing from "./pages/CreateListing";
import ListingDetails from "./pages/ListingDetails";
import WishList from "./pages/WishList";
// import PropertyList from "./pages/PropertyList";
import ReservationList from "./pages/ReservationList";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import RequireAdminAuth from "./components/RequireAdminAuth";
import AdminUsers from "./pages/admin/AdminUsers";
import HostDashboard from "./pages/BookingsDashboard";
import EditListing from "./pages/EditListing";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [loadingUser, setLoadingUser] = useState(true);

  // Restore user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      const userWithBooleanHost = {
        ...parsedUser,
        isHost: parsedUser.isHost === true || parsedUser.isHost === "true",
      };
      dispatch(setLogin({ user: userWithBooleanHost, token: savedToken }));
    }
    setLoadingUser(false);
  }, [dispatch]);

  if (loadingUser) return null; // wait until user is loaded

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    return children;
  };

  // Redirect logged-in users from login/register
  const LoginRedirect = () => (!user ? <LoginPage /> : <Navigate to="/" replace />);
  const RegisterRedirect = () => (!user ? <RegisterPage /> : <Navigate to="/" replace />);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginRedirect />} />
        <Route path="/register" element={<RegisterRedirect />} />
        <Route path="/properties/search" element={<SearchPage />} />
        <Route path="/properties/category/:category" element={<CategoryPage />} />
        <Route path="/properties/:listingId" element={<ListingDetails />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/:userId/reservations" element={<ReservationList/>} />

        {/* Host Dashboard */}
        <Route
          path="/host/dashboard"
          element={
            <ProtectedRoute>
              {user?.isHost ? <HostDashboard /> : <Navigate to="/" replace />}
            </ProtectedRoute>
          }
        />

        {/* Edit Listing route - FIXED */}
        <Route path="/edit-listing/:id" element={<EditListing />} />

        {/* Protected User Routes */}
        <Route
          path="/create-listing"
          element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          }
        />
        <Route path="/:userId/wishList" element={<ProtectedRoute><WishList /></ProtectedRoute>} />
        {/* <Route path="/:userId/properties" element={<ProtectedRoute><PropertyList /></ProtectedRoute>} /> */}
        {/* <Route path="/:userId/reservations" element={<ProtectedRoute><ReservationList /></ProtectedRoute>} /> */}

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RequireAdminAuth>
              <AdminDashboard />
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAdminAuth>
              <AdminUsers />
            </RequireAdminAuth>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
