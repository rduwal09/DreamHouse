import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ListingCard from "../components/ListingCard";
import { setWishList } from "../redux/state";
import "../styles/List.scss";

const WishList = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.user || state.user);
  const token = useSelector((state) => state.user?.token || state.token);
  const wishList = useSelector((state) => state.wishList);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?._id) {
        console.warn("⚠️ No user ID yet, waiting...");
        return;
      }

      try {
        // console.log("Fetching wishlist for user:", user._id);
        const response = await fetch(`http://localhost:3001/users/${user._id}/wishlist`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const text = await response.text();
        // console.log("🧾 Raw response text:", text);

        const data = JSON.parse(text);
        // console.log("✅ Wishlist data parsed:", data);

        dispatch(setWishList(data.wishList || []));
// console.log("✅ Updated Redux wishlist:", data.wishList);


        if (Array.isArray(data.wishList)) {
          dispatch(setWishList(data.wishList));
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user?._id, token, dispatch]);

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading your wishlist...</h2>;

// console.log("🎯 wishList array:", wishList);

  return (
    <>
      <Navbar />
      <h1 className="title-list">Your Wish List</h1>

      {Array.isArray(wishList) && wishList.length > 0 ? (
        <div className="list">
          {wishList.map((listing) => (
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
