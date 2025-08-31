import { useState } from "react";
import "../styles/ListingCard.scss";
import { ArrowForwardIos, ArrowBackIosNew, Favorite } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setWishList } from "../redux/state";

const ListingCard = ({
  _id, // make sure this is used as listingId
  creator,
  listingPhotoPaths = [],
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const wishList = user?.wishList || [];

  const isLiked = wishList?.find((item) => item?._id === _id);

  const patchWishList = async () => {
    if (!creator?._id || !user?._id || creator._id === user._id) return;
    const response = await fetch(
      `http://localhost:3001/users/${user._id}/${_id}`,
      { method: "PATCH", headers: { "Content-Type": "application/json" } }
    );
    const data = await response.json();
    dispatch(setWishList(data.wishList));
  };

  const goToPrevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + listingPhotoPaths.length) % listingPhotoPaths.length);
  const goToNextSlide = () => setCurrentIndex((prev) => (prev + 1) % listingPhotoPaths.length);

  return (
    <div className="listing-card" onClick={() => navigate(`/properties/${_id}`)}>
      <div className="slider-container">
        <div className="slider" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {listingPhotoPaths.map((photo, index) => (
            <div key={index} className="slide">
              <img src={`http://localhost:3001/${photo.replace("public", "")}`} alt={`photo ${index}`} />
              <div className="prev-button" onClick={(e) => { e.stopPropagation(); goToPrevSlide(); }}>
                <ArrowBackIosNew sx={{ fontSize: "15px" }} />
              </div>
              <div className="next-button" onClick={(e) => { e.stopPropagation(); goToNextSlide(); }}>
                <ArrowForwardIos sx={{ fontSize: "15px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

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

      <button className="favorite" onClick={(e) => { e.stopPropagation(); patchWishList(); }} disabled={!user}>
        {isLiked ? <Favorite sx={{ color: "red" }} /> : <Favorite sx={{ color: "white" }} />}
      </button>
    </div>
  );
};

export default ListingCard;
