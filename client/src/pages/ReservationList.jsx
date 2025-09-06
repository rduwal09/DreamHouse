import { useEffect, useState } from "react";
import "../styles/List.scss";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setReservationList } from "../redux/state";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";

const ReservationList = () => {
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state) => state.user._id);
  const reservationList = useSelector((state) => state.user.reservationList) || [];

  const dispatch = useDispatch();

  const getReservationList = async () => {
  try {
    const response = await fetch(`http://localhost:3001/users/${userId}/reservations`);
    const data = await response.json();

    // Keep only the latest booking per listing
    const latestBookingsMap = {};
    data.forEach((b) => {
      const listingId = b.listing._id;
      // Compare creation time or booking ID as a fallback
      if (
        !latestBookingsMap[listingId] ||
        new Date(b.createdAt) > new Date(latestBookingsMap[listingId].createdAt)
      ) {
        latestBookingsMap[listingId] = b;
      }
    });

    const latestBookings = Object.values(latestBookingsMap);
    dispatch(setReservationList(latestBookings));
  } catch (err) {
    console.log("Fetch Reservation List failed!", err.message);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    getReservationList();
  }, []); // <-- fixed dependency

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <h1 className="title-list">Your Reservation List</h1>
      <div className="list">
        {reservationList.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "2rem" }}>
            You have no reserved properties yet.
          </p>
        ) : (
          reservationList.map(({ listing, landlord, startDate, endDate, totalPrice }) => (
            
            <ListingCard
              key={listing._id}
              _id={listing._id}
              creator={landlord._id}
              listingPhotoPaths={listing.listingPhotoPaths}
              title={listing.title}
              city={listing.city}
              province={listing.province}
              country={listing.country}
              category={listing.category}
              startDate={new Date(startDate).toLocaleDateString()}
              endDate={new Date(endDate).toLocaleDateString()}
              totalPrice={totalPrice}
              booking={true}
            />
          )
        )
        )}
      </div>
      <Footer />
    </>
  );
};

export default ReservationList;
