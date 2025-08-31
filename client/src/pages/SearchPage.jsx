import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setListings } from "../redux/state";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import ListingCard from "../components/ListingCard";

const SearchPage = () => {
  const [loading, setLoading] = useState(true);
  const listings = useSelector((state) => state.listings || []);
  const dispatch = useDispatch();
  const location = useLocation();

  const getSearchListings = async () => {
    try {
      const params = new URLSearchParams(location.search);

      // Make sure city is sent, convert `location` -> `city` if present
      if (params.has("location")) {
        const city = params.get("location");
        params.delete("location");
        params.append("city", city);
      }

      // Only include non-empty params
      const queryString = Array.from(params.entries())
        .filter(([key, value]) => value)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");

      const url = queryString
        ? `http://localhost:3001/properties/search?${queryString}`
        : `http://localhost:3001/properties/search`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch listings");

      const data = await response.json();
      dispatch(setListings({ listings: data }));
    } catch (err) {
      console.error("Fetch Search failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSearchListings();
    // eslint-disable-next-line
  }, [location.search]);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Search Results</h1>
      <div className="list">
        {listings.length > 0 ? (
          listings.map((listing) => <ListingCard key={listing._id} {...listing} />)
        ) : (
          <p>No properties found for your search.</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchPage;
