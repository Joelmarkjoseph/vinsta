import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../src/AuthContext";
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

const Login = () => {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;

      // Reference to Firestore document
      const userRef = doc(db, "users", loggedInUser.uid);

      // Check if user already exists
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        // Create user document with followers & following lists
        await setDoc(userRef, {
          name: loggedInUser.displayName,
          email: loggedInUser.email,
          uid: loggedInUser.uid,
          photoURL: loggedInUser.photoURL,
          createdAt: new Date(),
          followers: [],
          following: [],
        });
      } else {
        // Update `photoURL` if it's missing or changed
        if (
          !userSnap.data().photoURL ||
          userSnap.data().photoURL !== loggedInUser.photoURL
        ) {
          await updateDoc(userRef, {
            photoURL: loggedInUser.photoURL,
          });
        }
      }

      // Navigate to Gallery after successful login
      navigate("/gallery");
    } catch (error) {
      console.error("Login failed:", error.message);
    }
  };
  useEffect(() => {
    if (user) {
      navigate("/gallery");
    }
  }, [user, navigate]);
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
          <button
            onClick={handleLogin}
            style={{
              backgroundColor: "#28a745",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              transition: "0.3s ease-in-out",
              boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
              marginTop: "10px",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
          >
            Login with Google
          </button>
        </>
      )}
    </div>
  );
};

export default Login;
