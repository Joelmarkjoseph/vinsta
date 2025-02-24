import React from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../src/AuthContext"; // Import useAuth hook

const Login = () => {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from context

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/gallery"); // Redirect after login
    } catch (error) {
      console.error("Login failed:", error.message);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Welcome to Vinsta</h1>
      {user ? (
        <>
          <h2>Hi {user.displayName}</h2>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              transition: "0.3s ease-in-out",
              boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            Go to Dashboard
          </button>
        </>
      ) : (
        <>
          <h2>Login to Vinsta</h2>
          <button onClick={handleLogin}>Login with Google</button>
        </>
      )}
    </div>
  );
};

export default Login;
