import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { Link } from "react-router-dom"; // Import Link
import { useNavigate } from "react-router-dom"; // Import useNavigate

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";

const Gallery = () => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [showHeart, setShowHeart] = useState(null);
  const [showBrokenHeart, setShowBrokenHeart] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const q = query(collection(db, "images"), orderBy("uploadedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const imageList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setImages(imageList);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleLike = async (imageId, likedUsers) => {
    if (!user) return alert("You must be logged in to like an image.");

    const imageRef = doc(db, "images", imageId);
    const userLiked = likedUsers?.includes(user.uid);

    try {
      await updateDoc(imageRef, {
        likedUsers: userLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    } catch (error) {
      console.error("Error updating likes: ", error);
    }
  };
  const goToProfile = (userEmail) => {
    const userEmailWithoutDomain = userEmail.split("@")[0];

    if (!userEmail) return;
    navigate(`/profile/${encodeURIComponent(userEmailWithoutDomain)}`);
  };
  const handleDoubleTap = (imageId, likedUsers) => {
    const userLiked = likedUsers?.includes(user?.uid);
    handleLike(imageId, likedUsers);

    if (userLiked) {
      setShowBrokenHeart(imageId);
      setTimeout(() => setShowBrokenHeart(null), 1000);
    } else {
      setShowHeart(imageId);
      setTimeout(() => setShowHeart(null), 1000);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {/* <h2>Gallery</h2> */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {images.length > 0 ? (
          images.map((image) => (
            <div
              key={image.id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "10px",
                boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
                textAlign: "center",
                position: "relative",
              }}
              onDoubleClick={() =>
                handleDoubleTap(image.id, image.likedUsers || [])
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                {/* User Profile */}
                <Link
                  to={`/profile/${encodeURIComponent(
                    image.userEmail.split("@")[0]
                  )}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "10px",
                      cursor: "pointer",
                    }}
                  >
                    {image.userPhoto ? (
                      <img
                        src={image.userPhoto}
                        alt="User"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "#ccc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                        }}
                      >
                        ?
                      </div>
                    )}
                    <div style={{ textAlign: "left" }}>
                      <strong>{image.userName || "Unknown User"}</strong>
                      <p
                        style={{ fontSize: "12px", color: "#666", margin: "0" }}
                      >
                        {image.userEmail || "No email"}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              <div style={{ position: "relative" }}>
                <img
                  src={image.imageBase64}
                  alt="Uploaded"
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    borderRadius: "5px",
                    objectFit: "cover",
                  }}
                />
                <h3 style={{ fontSize: "14px", marginBottom: "5px" }}>
                  {image.title || "Untitled"}
                </h3>

                {showHeart === image.id && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%) scale(1)",
                      fontSize: "50px",
                      color: "#dc3545",
                      opacity: "0.8",
                      animation: "growFade 1s forwards",
                    }}
                  >
                    ❤️
                  </div>
                )}
                {showBrokenHeart === image.id && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%) scale(1)",
                      fontSize: "50px",
                      color: "#dc3545",
                      opacity: "0.8",
                      animation: "growFade 1s forwards",
                    }}
                  >
                    💔
                  </div>
                )}
              </div>

              <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
                📅 Uploaded on:{" "}
                {image.uploadedAt?.seconds
                  ? new Date(image.uploadedAt.seconds * 1000).toLocaleString()
                  : "Unknown Date"}
              </p>

              <div
                onClick={() => handleLike(image.id, image.likedUsers || [])}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  gap: "5px",
                  marginTop: "10px",
                }}
              >
                <span
                  style={{
                    color: image.likedUsers?.includes(user?.uid)
                      ? "#dc3545"
                      : "#aaa",
                  }}
                >
                  {image.likedUsers?.includes(user?.uid) ? "❤️" : "🤍"}
                </span>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {image.likedUsers?.length || 0}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p>No images uploaded yet.</p>
        )}
      </div>
      <style>
        {`
          @keyframes growFade {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default Gallery;
