import { IconButton } from "@mui/material";
import { Search, Person, Menu } from "@mui/icons-material";
import variables from "../styles/variables.scss";
import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../styles/Navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { setLogout } from "../redux/state";

const Navbar = () => {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Search states
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSearch = () => {
    const query = new URLSearchParams({
      city: location,
      minPrice,
      maxPrice,
    }).toString();
    navigate(`/properties/search?${query}`);
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
  };

  const handleLogout = () => {
    dispatch(setLogout());
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setDropdownMenu(false);
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navbar">
      <Link to="/" className="navbar_logo">
        <img src="/assets/logo.png" alt="DreamHouse logo" />
      </Link>

      {/* Search bar */}
      <div className="navbar_search">
        <input
          type="text"
          placeholder="Location ..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <IconButton
          disabled={!location && !minPrice && !maxPrice}
          onClick={handleSearch}
        >
          <Search sx={{ color: variables.pinkred }} />
        </IconButton>
      </div>

      <div className="navbar_right" ref={dropdownRef}>
        {/* Host button: Become A Host or Add New Listing */}
        {user && (
          <Link to="/create-listing" className="host">
            {user.isHost ? "Add New Listing" : "Become A Host"}
          </Link>
        )}

        {/* Account dropdown */}
        <button
          className="navbar_right_account"
          onClick={() => setDropdownMenu(!dropdownMenu)}
        >
          <Menu sx={{ color: variables.darkgrey }} />
          {!user ? (
            <Person sx={{ color: variables.darkgrey }} />
          ) : (
            <img
              src={
                user.profileImagePath
                  ? `http://localhost:3001/${user.profileImagePath.replace(
                      "public",
                      ""
                    )}`
                  : "/assets/default-avatar.png"
              }
              alt="profile"
              style={{ objectFit: "cover", borderRadius: "50%" }}
            />
          )}
        </button>

        {dropdownMenu && (
          <div className="navbar_right_accountmenu">
            {!user ? (
              <>
                <Link to="/login" onClick={() => setDropdownMenu(false)}>
                  Log In
                </Link>
                <Link to="/register" onClick={() => setDropdownMenu(false)}>
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {/* Host dashboard visible only to hosts */}
                {user.isHost && (
                  <Link
                    to="/host/dashboard"
                    onClick={() => setDropdownMenu(false)}
                  >
                    Host Dashboard
                  </Link>
                )}

                {/* Tenant dashboards */}
                
                <Link
                  to={`/${user._id}/wishList`}
                  onClick={() => setDropdownMenu(false)}
                >
                  Wish List
                </Link>
                {/* <Link
                  to={`/${user._id}/properties`}
                  onClick={() => setDropdownMenu(false)}
                >
                  Property List
                </Link> */}
                <Link
                  to={`/${user._id}/reservations`}
                  onClick={() => setDropdownMenu(false)}
                >
                  Reservation List
                </Link>

                {/* Become a host / Add New Listing inside dropdown as well */}
                <Link
                  to="/create-listing"
                  onClick={() => setDropdownMenu(false)}
                >
                  {user.isHost ? "Add New Listing" : "Become A Host"}
                </Link>

                <button className="logout_btn" onClick={handleLogout}>
                  Log Out
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
