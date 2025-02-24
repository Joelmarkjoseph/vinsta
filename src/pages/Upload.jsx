import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../AuthContext"; // Import useAuth hook

const Upload = () => {
  const { user } = useAuth(); // Get logged-in user details
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [showTitleInput, setShowTitleInput] = useState(false); // Show title input after selecting an image

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Only image files are allowed.");
      return;
    }
    if (file.size > 900 * 1024) {
      setMessage("File size should be less than 900KB.");
      return;
    }

    setMessage("");
    setImage(file);
    setShowTitleInput(true); // Show title input after image selection

    // Preview the selected image
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreview(reader.result);
    };
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
        await addDoc(collection(db, "images"), {
          title: title.trim(),
          imageBase64: base64String,
          uploadedAt: serverTimestamp(),
          userEmail: user.email,
          userName: user.displayName,
          userPhoto: user.photoURL,
        });

        setMessage("Image uploaded successfully! \nCheck Gallery");
        setImage(null);
        setPreview(null);
        setTitle("");
        setShowTitleInput(false); // Hide title input after successful upload
      } catch (error) {
        setMessage("Error uploading image: " + error.message);
      } finally {
        setUploading(false);
      }
    };
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>📤 Upload Image</h2>
      <h3>
        These pictures is under surveillence of college professors. so be
        careful while posting images.
      </h3>
      <h4>Post images related to college and its events.</h4>
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
          backgroundColor: uploading ? "#6c757d" : "#28a745", // Gray when uploading, Green otherwise
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
