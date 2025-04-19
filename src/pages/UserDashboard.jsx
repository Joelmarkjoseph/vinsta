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
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { getAuth, signOut } from "firebase/auth";

const UserDashboard = () => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");

  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followList, setFollowList] = useState([]);
  const [modalType, setModalType] = useState(""); // 'followers' or 'following'

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserImages();
      fetchFollowData();
      fetchPostsCount();
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setDisplayName(userData.name || "No Name");
        setProfilePicUrl(userData.photoURL || "");
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const fetchPostsCount = async () => {
    if (!user) return;
    try {
      const imagesQuery = query(
        collection(db, "images"),
        where("userEmail", "==", user.email)
      );
      const imagesSnapshot = await getDocs(imagesQuery);
      setPostsCount(imagesSnapshot.size);
    } catch (error) {
      console.error("Error fetching posts count:", error);
    }
  };

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

  const fetchFollowData = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setFollowers(data.followers?.length || 0);
        setFollowing(data.following?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching follow data:", error);
    }
  };

  const fetchFollowList = async (type) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const list =
          type === "followers" ? data.followers || [] : data.following || [];
        setFollowList(list);
        setModalType(type);
        setShowFollowModal(true);
      }
    } catch (error) {
      console.error("Error fetching follow list:", error);
    }
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
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>{displayName}</h2>

      <div
        className="userdetails"
        style={{
          display: "flex",
          alignContent: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        {profilePicUrl && (
          <img
            src={profilePicUrl}
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "10px",
          }}
        >
          <div>
            <p>{postsCount}</p>
            <p>Posts</p>
          </div>
          <div
            onClick={() => fetchFollowList("followers")}
            style={{ cursor: "pointer" }}
          >
            <p>{followers}</p>
            <p>Followers</p>
          </div>
          <div
            onClick={() => fetchFollowList("following")}
            style={{ cursor: "pointer" }}
          >
            <p>{following}</p>
            <p>Following</p>
          </div>
        </div>
      </div>

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
              backgroundColor: "#28a745",
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
                  style={{
                    width: "100%",
                    aspectRatio: "4/5",
                    borderRadius: "5px",
                    objectFit: "cover",
                  }}
                />
                <h3 style={{ fontSize: "14px", marginBottom: "5px" }}>
                  {image.title || "Untitled"}
                </h3>
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
        </div>
      ) : (
        <div>
          <p>No images uploaded yet.</p>
          <button
            onClick={() => {
              navigate("/upload");
            }}
            style={{
              backgroundColor: "#28a745",
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

      {/* Modal for followers/following */}
      {showFollowModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "10px",
              maxWidth: "400px",
              width: "90%",
              maxHeight: "70vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <h3>{modalType === "followers" ? "Followers" : "Following"}</h3>
            <button
              onClick={() => setShowFollowModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "#ccc",
                border: "none",
                borderRadius: "50%",
                padding: "5px",
                cursor: "pointer",
              }}
            >
              ❌
            </button>
            <ul style={{ textAlign: "left", marginTop: "30px" }}>
              {followList.length > 0 ? (
                followList.map((uid, index) => (
                  <li key={index} style={{ marginBottom: "10px" }}>
                    {uid}
                  </li>
                ))
              ) : (
                <p>No users found</p>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
