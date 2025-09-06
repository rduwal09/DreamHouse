import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setLogout } from "../redux/state";
import "../styles/dashNavbar.scss";

const DashboardNavbar = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(setLogout());
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const goHome = () => {
    window.location.href = "/";
  };

  return (
    <nav className="dashboard-navbar">
      {/* Logo */}
      <div className="navbar-left" onClick={goHome}>
        <img src="/assets/logo.png" alt="Logo" className="logo" />
        <span className="brand-name">DreamHouse</span>
      </div>

      {/* Navbar actions */}
      <div className="navbar-right">
        <button className="home-btn" onClick={goHome}>
          Home
        </button>

        <div className="user-info">
          <span className="user-name">{user?.firstName || "Host"}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
