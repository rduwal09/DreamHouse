import "../styles/Footer.scss";
import { LocationOn, LocalPhone, Email } from "@mui/icons-material";
import { Link } from "react-router-dom"; // ✅ Import Link for navigation

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer_left">
        <Link to="/"><img src="/assets/logo.png" alt="logo" /></Link>
      </div>

      <div className="footer_center">
        <h3>Useful Links</h3>
        <ul>
          <li>
            <Link to="/about">About Us</Link> {/* ✅ Navigate to About.jsx */}
          </li>
          <li>
            <Link to="/terms">Terms and Conditions</Link> {/* Optional route */}
          </li>
          <li>
            <Link to="/refund">Return and Refund Policy</Link> {/* Optional route */}
          </li>
        </ul>
      </div>

      <div className="footer_right">
        <h3>Contact</h3>
        <div className="footer_right_info">
          <LocalPhone />
          <p>+9779808123456</p>
        </div>
        <div className="footer_right_info">
          <Email />
          <p>rakeshduwal64@gmail.com</p>
        </div>
        <img src="/assets/payment.png" alt="payment" />
      </div>
    </div>
  );
};

export default Footer;
