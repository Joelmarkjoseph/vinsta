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
    if (!userEmail || !user) return;

    const userEmailWithoutDomain = userEmail.split("@")[0];

    if (user.email === userEmail) {
      navigate("/dashboard");
    } else {
      navigate(`/profile/${encodeURIComponent(userEmailWithoutDomain)}`);
    }
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
    <div style={{ textAlign: "center", padding: "5px" }}>
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
                padding: "5px",
                borderRadius: "10px",
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
                  cursor: "pointer",
                }}
                onClick={() => goToProfile(image.userEmail)}
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
                      fontSize: "14px",
                    }}
                  >
                    ?
                  </div>
                )}
                <div style={{ textAlign: "left" }}>
                  <strong>{image.userName || "Unknown User"}</strong>
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <img
                  src={image.imageBase64}
                  alt="Uploaded"
                  style={{
                    width: "100%",
                    aspectRatio: "4/5",
                    borderRadius: "5px",
                    objectFit: "cover",
                  }}
                />
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

              <div
                onClick={() => handleLike(image.id, image.likedUsers || [])}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "10px",
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
              <p
                style={{
                  fontSize: "14px",
                  marginBottom: "5px",
                  textAlign: "left",
                }}
              >
                <strong>{image.userName}</strong> {image.title || "Untitled"}
              </p>

              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "10px",
                  textAlign: "left",
                }}
              >
                {image.uploadedAt?.seconds
                  ? new Date(
                      image.uploadedAt.seconds * 1000
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })
                  : "Unknown Date"}
              </p>
            </div>
          ))
        ) : (
          <p>No images uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default Gallery;
