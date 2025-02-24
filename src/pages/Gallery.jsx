import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

const Gallery = () => {
  const [images, setImages] = useState([]);

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

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>📸 Image Gallery</h2>
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
              }}
            >
              {/* Display User Info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
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
                  <p style={{ fontSize: "12px", color: "#666", margin: "0" }}>
                    {image.userEmail || "No email"}
                  </p>
                </div>
              </div>

              {/* Image Title */}
              <h3 style={{ fontSize: "14px", marginBottom: "5px" }}>
                {image.title || "Untitled"}
              </h3>

              {/* Uploaded Image */}
              <img
                src={image.imageBase64}
                alt="Uploaded"
                style={{
                  width: "100%",
                  borderRadius: "5px",
                  objectFit: "cover",
                }}
              />

              {/* Timestamp */}
              <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
                📅 Uploaded on:{" "}
                {image.uploadedAt?.seconds
                  ? new Date(image.uploadedAt.seconds * 1000).toLocaleString()
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
