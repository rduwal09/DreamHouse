import { useState, useEffect } from "react";
import "../styles/ListingCard.scss";
import { ArrowForwardIos, ArrowBackIosNew, Favorite } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setWishList } from "../redux/state";

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
  const user = useSelector((state) => state.user.user);
  const wishList = user?.wishList || [];

  // Initialize liked state only once on mount
  useEffect(() => {
  const isLiked = wishList?.some((item) => item._id?.toString() === _id.toString());
  setLiked(isLiked);
}, [wishList, _id]);

  const goToPrevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + listingPhotoPaths.length) % listingPhotoPaths.length);
  };

  const goToNextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % listingPhotoPaths.length);
  };

  const patchWishList = async (e) => {
    e.stopPropagation();
    if (!user || creator._id === user._id) return;

    setLiked((prev) => !prev); // optimistic UI

    try {
      const res = await fetch(`http://localhost:3001/users/${user._id}/${_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update wishlist");
      const data = await res.json();
      dispatch(setWishList(data.wishList));
    } catch (err) {
      console.error("Failed to update wishlist:", err);
      setLiked((prev) => !prev); // revert on error
    }
  };

  return (
    <div className="listing-card" onClick={() => navigate(`/properties/${_id}`)}>
      <div className="slider-container">
        <div className="slider" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {listingPhotoPaths.map((photo, index) => (
            <div key={index} className="slide">
              <img src={`http://localhost:3001/${photo.replace("public", "")}`} alt={`photo ${index}`} />
              <div className="prev-button" onClick={goToPrevSlide}>
                <ArrowBackIosNew sx={{ fontSize: 15 }} />
              </div>
              <div className="next-button" onClick={goToNextSlide}>
                <ArrowForwardIos sx={{ fontSize: 15 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <h3>{title}</h3>
      <h3>{city}, {province}, {country}</h3>
      <p>{category}</p>

      {!booking ? (
        <>
          <p>{type}</p>
          <p><span>${price}</span> per night</p>
        </>
      ) : (
        <>
          <p>{startDate} - {endDate}</p>
          <p><span>${totalPrice}</span> total</p>
        </>
      )}

      <button
        className="favorite"
        onClick={patchWishList}
        disabled={!user}
        type="button"
      >
        <Favorite sx={{ fontSize: 32, color: liked ? "red" : "white" }} />
      </button>

    </div>
  );
};

export default ListingCard;