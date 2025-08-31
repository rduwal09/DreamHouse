import { useEffect, useState } from "react";
import { categories } from "../data";
import "../styles/Listings.scss";
import ListingCard from "./ListingCard";
import Loader from "./Loader";
import { useDispatch, useSelector } from "react-redux";
import { setListings } from "../redux/state";

const Listings = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const listings = useSelector((state) => state.listings || []); // ensure array

  const getFeedListings = async () => {
    setLoading(true);
    try {
      // Fetch all listings if category is "All"
      const endpoint =
        selectedCategory !== "All"
          ? `http://localhost:3001/properties?category=${selectedCategory}`
          : "http://localhost:3001/properties";

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to fetch listings");

      const data = await response.json();
      dispatch(setListings({ listings: data }));
    } catch (err) {
      console.log("Fetch Listings Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeedListings();
  }, [selectedCategory]);

  return (
    <>
      <div className="category-list">
        {categories?.map((category, index) => (
          <div
            className={`category ${
              category.label === selectedCategory ? "selected" : ""
            }`}
            key={index}
            onClick={() => setSelectedCategory(category.label)}
          >
            <div className="category_icon">{category.icon}</div>
            <p>{category.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : listings.length > 0 ? (
        <div className="listings">
          {listings.map((listing) => (
            <ListingCard key={listing._id} {...listing} />
          ))}
        </div>
      ) : (
        <h2 style={{ textAlign: "center", marginTop: "2rem" }}>
          No listings found
        </h2>
      )}
    </>
  );
};

export default Listings;
