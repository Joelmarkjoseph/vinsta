import React, { useState, useEffect } from "react";
import { db, storage } from "../firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AdminDashboard = ({ onLogout }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    fetchAllImages();
  }, []);

  const fetchAllImages = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "images"));
      const allImages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setImages(allImages);
    } catch (error) {
      console.error("Error fetching images:", error);
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

  const handleUpload = async () => {
    if (!newImage) {
      alert("Please select an image first!");
      return;
    }

    const storageRef = ref(storage, `images/${newImage.name}`);
    try {
      await uploadBytes(storageRef, newImage);
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "images"), {
        imageBase64: imageUrl,
        uploadedAt: new Date(),
        userEmail: "admin@panel.com",
      });

      setNewImage(null);
      fetchAllImages(); // Refresh images list
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Admin Panel</h2>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        style={{ backgroundColor: "red", color: "white", padding: "10px" }}
      >
        Logout
      </button>

      <h3>Upload a New Image</h3>
      <input type="file" onChange={(e) => setNewImage(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      <h3>All Uploaded Images</h3>
      {loading ? (
        <p>Loading images...</p>
      ) : images.length > 0 ? (
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
      ) : (
        <p>No images found.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
