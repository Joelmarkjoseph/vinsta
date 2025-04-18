import React, { useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  increment,
  setDoc,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";

const Upload = () => {
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [showTitleInput, setShowTitleInput] = useState(false);

  const compressImage = (file, targetSizeKB, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let scaleFactor = Math.sqrt((targetSizeKB * 1024) / file.size);
        scaleFactor = Math.min(scaleFactor, 1);
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            callback(blob);
          },
          "image/jpeg",
          0.7
        );
      };
    };
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Only image files are allowed.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreview(reader.result);
    };

    if (file.size > 900 * 1024) {
      setMessage("Image is too large! Compressing...");
      compressImage(file, 600, (compressedBlob) => {
        setImage(compressedBlob);
        setMessage("Image compressed to 600KB.");
      });
    } else {
      setImage(file);
      setMessage("");
    }

    setShowTitleInput(true);
  };

  const handleUpload = async () => {
    if (!image) return setMessage("Please select an image first.");
    if (!title.trim()) return setMessage("Title is required.");
    if (title.length > 100)
      return setMessage("Title must be less than 100 characters.");
    if (!user) return setMessage("You must be logged in to upload an image.");

    setUploading(true);
    setMessage("");

    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onloadend = async () => {
      const base64String = reader.result;

      try {
        await addDoc(collection(db, "images"), {
          title: title.trim(),
          imageBase64: base64String,
          uploadedAt: serverTimestamp(),
          userEmail: user.email,
          userName: user.displayName,
          userPhoto: user.photoURL,
        });

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          await updateDoc(userRef, { postCount: increment(1) });
        } else {
          await setDoc(userRef, { postCount: 1 }, { merge: true });
        }

        setMessage("✅ Image uploaded successfully! Check Gallery.");
        setImage(null);
        setPreview(null);
        setTitle("");
        setShowTitleInput(false);
      } catch (error) {
        setMessage("❌ Error uploading image: " + error.message);
      } finally {
        setUploading(false);
      }
    };
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "0 auto",
        padding: "30px",
        backgroundColor: "#f9f9f9",
        borderRadius: "12px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
      }}
    >
      <h2 style={{ color: "#333", marginBottom: "10px" }}>📸 Upload Image</h2>
      <p style={{ fontSize: "14px", color: "#888" }}>
        Only images related to college & events are allowed. Posts are reviewed
        by faculty.
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{
          margin: "15px 0",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          width: "100%",
        }}
      />

      {preview && (
        <div style={{ marginBottom: "10px" }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              maxWidth: "100%",
              height: "auto",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          />
        </div>
      )}

      {showTitleInput && (
        <input
          type="text"
          placeholder="Enter image title (max 100 characters)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength="100"
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #bbb",
            fontSize: "15px",
          }}
        />
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          backgroundColor: uploading ? "#aaa" : "#007BFF",
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          borderRadius: "6px",
          cursor: uploading ? "not-allowed" : "pointer",
          fontWeight: "bold",
          fontSize: "16px",
          transition: "background-color 0.3s",
        }}
        onMouseOver={(e) =>
          !uploading && (e.target.style.backgroundColor = "#0056b3")
        }
        onMouseOut={(e) =>
          !uploading && (e.target.style.backgroundColor = "#007BFF")
        }
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {message && (
        <p
          style={{
            marginTop: "15px",
            color: message.includes("successfully") ? "green" : "red",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Upload;
