import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ListingCard from "../components/ListingCard";
import { setWishList } from "../redux/state";
import "../styles/List.scss";

const WishList = () => {
  const dispatch = useDispatch();

  // ✅ Read wishlist from Redux state
  const user = useSelector((state) => state.user.user);
  const wishList = useSelector((state) => state.user.wishList) || [];

  // Fetch wishlist from backend on page load
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?._id) return;

      try {
        const response = await fetch(
          `http://localhost:3001/users/${user._id}/wishlist`
        );
        if (!response.ok) throw new Error("Failed to fetch wishlist");

        const data = await response.json();

        // ✅ Ensure backend returns populated listings
        dispatch(setWishList(data.wishList));
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    };

    fetchWishlist();
  }, [user?._id, dispatch]);

  return (
    <>
      <Navbar />
      <h1 className="title-list">Your Wish List</h1>

      {wishList.length > 0 ? (
        <div className="list">
          {wishList
  .filter((listing) => listing && listing._id) // ✅ ignore null/ID-only
  .map((listing) => (
    <ListingCard key={listing._id} {...listing} />
  ))}
        </div>
      ) : (
        <h2 style={{ textAlign: "center", marginTop: "2rem" }}>
          You have no properties in your wish list.
        </h2>
      )}

      <Footer />
    </>
  );
};

export default WishList;
