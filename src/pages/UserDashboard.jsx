import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { getAuth, signOut } from "firebase/auth"; // Import signOut

const UserDashboard = () => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserImages();
    }
  }, [user]);

  const fetchUserImages = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "images"),
        where("userEmail", "==", user.email)
      );
      const querySnapshot = await getDocs(q);
      const userImages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setImages(userImages);
    } catch (error) {
      console.error("Error fetching user images:", error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "images", id));
      setImages(images.filter((image) => image.id !== id));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      window.location.href = "/"; // Redirect to home/login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Welcome, {user?.displayName}</h2>
      <p>Email: {user?.email}</p>

      {user?.photoURL && (
        <img
          src={user.photoURL}
          alt="User Profile"
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "10px",
          }}
        />
      )}
      <br />
      <button
        onClick={handleLogout}
        style={{
          backgroundColor: "#ff4444",
          color: "white",
          padding: "10px 15px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Logout
      </button>

      <h3>Your Uploaded Images</h3>
      {loading ? (
        <p>Loading images...</p>
      ) : images.length > 0 ? (
        <div>
          <button
            onClick={() => {
              navigate("/upload");
            }}
            style={{
              backgroundColor: "#ff4444",
              color: "white",
              padding: "10px 15px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            Upload More Images
          </button>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px",
            }}
          >
            {images.map((image) => (
              <div
                key={image.id}
                style={{ border: "1px solid #ccc", padding: "10px" }}
              >
                <img
                  src={image.imageBase64}
                  alt="Uploaded"
                  width="50%"
                  height="auto"
                />
                <p>
                  <h3 style={{ fontSize: "14px", marginBottom: "5px" }}>
                    {image.title || "Untitled"}
                  </h3>
                  {new Date(image.uploadedAt?.seconds * 1000).toLocaleString()}
                </p>
                <button
                  onClick={() => handleDelete(image.id)}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    padding: "5px",
                    border: "none",
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p>No images uploaded yet.</p>
          <button
            onClick={() => {
              navigate("/upload");
            }}
            style={{
              backgroundColor: "#ff4444",
              color: "white",
              padding: "10px 15px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            Upload Image
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
