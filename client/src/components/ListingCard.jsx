// components/ListingCard.jsx
import React, { useState, useEffect } from "react";
import "../styles/ListingCard.scss";
import {
  ArrowForwardIos,
  ArrowBackIosNew,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setWishList } from "../redux/state";
import toast from "react-hot-toast";

const ListingCard = ({
  _id,
  creator,
  listingPhotoPaths = [],
  title,
  city,
  province,
  country,
  category,
  type,
  price,
  startDate,
  endDate,
  totalPrice,
  booking,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Root Redux state
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const wishList = useSelector((state) => state.wishList) || [];

  // --- Instant heart persistence ---
  useEffect(() => {
    try {
      const persisted = localStorage.getItem("persist:root");
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (parsed.wishList) {
          const localWishList = JSON.parse(parsed.wishList);
          const found = localWishList.some((item) => {
            if (!item) return false;
            if (typeof item === "string" || typeof item === "number")
              return item.toString() === _id.toString();
            if (typeof item === "object")
              return (item._id || item.id)?.toString() === _id.toString();
            return false;
          });
          if (found) setLiked(true);
        }
      }
    } catch (err) {
      console.error("Error reading persisted wishlist:", err);
    }

    if (Array.isArray(wishList)) {
      const isLiked = wishList.some((item) => {
        if (!item) return false;
        if (typeof item === "string" || typeof item === "number")
          return item.toString() === _id.toString();
        if (typeof item === "object")
          return (item._id || item.id)?.toString() === _id.toString();
        return false;
      });
      setLiked(isLiked);
    }
  }, [wishList, _id]);

  // --- Slider controls ---
  const goToPrevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex(
      (prev) => (prev - 1 + listingPhotoPaths.length) % listingPhotoPaths.length
    );
  };

  const goToNextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % listingPhotoPaths.length);
  };

  // --- Heart click handler ---
  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?._id) {
      toast.error("Please log in to add to wishlist 💭");
      return;
    }

    if (creator?._id === user._id || creator === user._id) {
      toast.error("You can’t wishlist your own listing 💡");
      return;
    }

    const wasLiked = liked;
    setLiked(!wasLiked);

    try {
      const res = await fetch(
        `http://localhost:3001/users/${user._id}/wishlist/${_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to update wishlist");

      const data = await res.json();
      dispatch(setWishList(data?.wishList || []));

      if (!wasLiked) {
        toast.success("Added to wishlist ❤️");
      } else {
        toast.success("Removed from wishlist 💔");
      }
    } catch (err) {
      console.error("❌ Wishlist update failed:", err);
      setLiked(wasLiked); // rollback
      toast.error("Something went wrong ⚠️");
    }
  };

  return (
    <div
      className="listing-card"
      onClick={() => navigate(`/properties/${_id}`)}
    >
      {/* ❤️ Favorite Button */}
      <button
        className="favorite"
        type="button"
        onClick={handleHeartClick}
        aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
      >
        {liked ? (
          <Favorite sx={{ fontSize: 28, color: "red" }} />
        ) : (
          <FavoriteBorder sx={{ fontSize: 28, color: "white" }} />
        )}
      </button>

      {/* 🖼️ Image Slider */}
      <div className="slider-container">
        <div
          className="slider"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {listingPhotoPaths.map((photo, index) => (
            <div key={index} className="slide">
              <img
                src={`http://localhost:3001/${photo.replace("public", "")}`}
                alt={`photo ${index}`}
              />
              {listingPhotoPaths.length > 1 && (
                <>
                  <div className="prev-button" onClick={goToPrevSlide}>
                    <ArrowBackIosNew sx={{ fontSize: 15 }} />
                  </div>
                  <div className="next-button" onClick={goToNextSlide}>
                    <ArrowForwardIos sx={{ fontSize: 15 }} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 🏠 Listing Info */}
      <h3>{title}</h3>
      <h4>
        {city}, {province}, {country}
      </h4>
      <p>{category}</p>

      {!booking ? (
        <>
          <p>{type}</p>
          <p>
            <span>${price}</span> / night
          </p>
        </>
      ) : (
        <>
          <p>
            {startDate} - {endDate}
          </p>
          <p>
            <span>${totalPrice}</span> total
          </p>
        </>
      )}
    </div>
  );
};

export default ListingCard;
