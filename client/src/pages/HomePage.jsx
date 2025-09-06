import { useSelector } from "react-redux";

import Navbar from "../components/Navbar";
import Slide from "../components/Slide";
import Categories from "../components/Categories";
import Listings from "../components/Listings";
import Footer from "../components/Footer";

const HomePage = () => {
  const user = useSelector((state) => state.user);

  return (
    <>
      <Navbar />
      <Slide />
      <Categories />
      <Listings />
      <Footer />
    </>
  );
};

export default HomePage;
