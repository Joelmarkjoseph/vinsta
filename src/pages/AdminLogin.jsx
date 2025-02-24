import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import AdminDashboard from "./AdminDashboard";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user) {
        setAdminLoggedIn(true);
      }
    } catch (error) {
      console.error("Login failed:", error.message);
      alert("Invalid admin credentials!");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAdminLoggedIn(false);
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <div>
      {adminLoggedIn ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
