import React, { useState } from "react";
import "../styles/Login.scss";
import { setLogin } from "../redux/state";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user && data.token) {
        dispatch(setLogin({ user: data.user, token: data.token }));
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        setError(data.message || "Email or password is incorrect.");
      }
    } catch (err) {
      console.error("Login failed", err.message);
      setError("Login failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setResetMessage("");
    try {
      const response = await fetch("http://localhost:3001/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        setResetMessage("Check your email for reset instructions.");
      } else {
        setResetMessage(data.message || "Failed to send reset email.");
      }
    } catch (err) {
      setResetMessage("Failed to send reset email.");
    }
  };

  return (
    <div className="login-page">
      <div className="overlay"></div>
      <div className="login-card">
        <h1 className="brand"><img src="/assets/logo.png" alt="house" />DreamHouse</h1>
        <h2>Welcome Back</h2>
        <p className="subtitle">Log in to find your perfect home</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="extras">
          <span onClick={() => setForgotModal(true)}>Forgot Password?</span>
          <a href="/register">New here? Sign Up</a>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="modal_overlay" onClick={() => setForgotModal(false)}>
          <div className="modal_content" onClick={(e) => e.stopPropagation()}>
            <h3>Reset Password</h3>
            <form onSubmit={handleForgotSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <button type="submit">Send Reset Link</button>
            </form>
            {resetMessage && <p className="message">{resetMessage}</p>}
            <button className="close_modal" onClick={() => setForgotModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
