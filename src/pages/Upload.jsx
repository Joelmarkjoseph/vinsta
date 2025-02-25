import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { doc, updateDoc, getDoc, increment } from "firebase/firestore";

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
        scaleFactor = Math.min(scaleFactor, 1); // Ensure image is not enlarged

        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            callback(blob);
          },
          "image/jpeg",
          0.7 // Adjust quality
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

    // Preview the image
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreview(reader.result);
    };

    // Check file size
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
    if (!image) {
      setMessage("Please select an image first.");
      return;
    }
    if (!title.trim()) {
      setMessage("Title is required.");
      return;
    }
    if (title.length > 100) {
      setMessage("Title must be less than 100 characters.");
      return;
    }
    if (!user) {
      setMessage("You must be logged in to upload an image.");
      return;
    }

    setUploading(true);
    setMessage("");

    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onloadend = async () => {
      const base64String = reader.result;

      try {
        // Upload image to Firestore
        await addDoc(collection(db, "images"), {
          title: title.trim(),
          imageBase64: base64String,
          uploadedAt: serverTimestamp(),
          userEmail: user.email,
          userName: user.displayName,
          userPhoto: user.photoURL,
        });

        // Update user's post count
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          await updateDoc(userRef, {
            postCount: increment(1),
          });
        } else {
          // If user document doesn't exist, create one
          await setDoc(userRef, { postCount: 1 }, { merge: true });
        }

        setMessage("Image uploaded successfully! Check Gallery.");
        setImage(null);
        setPreview(null);
        setTitle("");
        setShowTitleInput(false);
      } catch (error) {
        setMessage("Error uploading image: " + error.message);
      } finally {
        setUploading(false);
      }
    };
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Upload Image</h2>
      <h3>
        These pictures are under surveillance of college professors, so be
        careful while posting images.
      </h3>
      <h4>Post images related to college and its events only.</h4>
      <input type="file" accept="image/*" onChange={handleImageChange} />

      {preview && (
        <div style={{ marginTop: "10px" }}>
          <img src={preview} alt="Preview" width="200" />
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
            width: "90%",
            padding: "10px",
            marginTop: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
      )}

      <br />
      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          backgroundColor: uploading ? "#6c757d" : "#28a745",
          color: "white",
          padding: "12px 20px",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: uploading ? "not-allowed" : "pointer",
          transition: "0.3s ease-in-out",
          boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
          marginTop: "10px",
        }}
        onMouseOver={(e) =>
          !uploading && (e.target.style.backgroundColor = "#218838")
        }
        onMouseOut={(e) =>
          !uploading && (e.target.style.backgroundColor = "#28a745")
        }
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Upload;
