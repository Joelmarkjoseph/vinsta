import React, { useState, useEffect } from "react";
import { db, storage } from "../firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AdminDashboard = ({ onLogout }) => {
  const [images, setImages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newImage, setNewImage] = useState(null);

  // Fetch Images
  const fetchAllImages = async () => {
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
  };

  // Fetch Messages
  const fetchAllMessages = async () => {
    try {
      const q = query(collection(db, "messages"), orderBy("createdAt"));
      const snapshot = await getDocs(q);
      const allMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(allMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAllImages(), fetchAllMessages()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const handleDeleteImage = async (id) => {
    try {
      await deleteDoc(doc(db, "images", id));
      setImages((prev) => prev.filter((image) => image.id !== id));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await deleteDoc(doc(db, "messages", id));
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (error) {
      console.error("Error deleting message:", error);
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
      fetchAllImages();
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Admin Panel</h2>

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
                onClick={() => handleDeleteImage(image.id)}
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

      <h3 style={{ marginTop: "40px" }}>All Messages</h3>
      {messages.length > 0 ? (
        <div style={{ maxHeight: "300px", overflowY: "auto", margin: "20px" }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                border: "1px solid #888",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "10px",
                textAlign: "left",
              }}
            >
              <strong>{msg.name || "Anonymous"}</strong>
              <p>{msg.text}</p>
              <small>
                {msg.createdAt?.seconds &&
                  new Date(msg.createdAt.seconds * 1000).toLocaleString()}
              </small>
              <br />
              <button
                onClick={() => handleDeleteMessage(msg.id)}
                style={{
                  backgroundColor: "crimson",
                  color: "white",
                  border: "none",
                  padding: "4px 8px",
                  marginTop: "5px",
                  cursor: "pointer",
                }}
              >
                Delete Message
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No messages found.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
