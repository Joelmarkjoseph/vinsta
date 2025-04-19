import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import "./Profile.css";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";

const Profile = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the logged-in user
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [postsCount, setPostsCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  useEffect(() => {
    const fetchUserByEmail = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("email", "==", `${email}@gmail.com`)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          setUserData(userDoc.data());
          setProfileUserId(userDoc.id);
        } else {
          console.log("No user found with this email.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchPostsCount = async () => {
      try {
        const imagesQuery = query(
          collection(db, "images"),
          where("userEmail", "==", `${email}@gmail.com`)
        );
        const imagesSnapshot = await getDocs(imagesQuery);
        setPostsCount(imagesSnapshot.size);
      } catch (error) {
        console.error("Error fetching posts count:", error);
      }
    };

    const checkFollowingStatus = async () => {
      if (!user || !profileUserId) return;

      try {
        const profileUserRef = doc(db, "users", profileUserId);
        const profileUserSnap = await getDoc(profileUserRef);

        if (profileUserSnap.exists()) {
          const profileUserData = profileUserSnap.data();
          setIsFollowing(
            profileUserData.followers?.includes(user.email) || false
          );
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };

    fetchUserByEmail();
    fetchPostsCount();
    checkFollowingStatus();
  }, [email, user, profileUserId]);

  const fetchUserImages = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "images"),
        where("userEmail", "==", `${email}@gmail.com`)
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

  useEffect(() => {
    if (email) fetchUserImages();
  }, [email]);

  const handleFollowToggle = async () => {
    if (!user || !profileUserId) return;

    const currentUserRef = doc(db, "users", user.uid);
    const profileUserRef = doc(db, "users", profileUserId);

    try {
      if (isFollowing) {
        await updateDoc(currentUserRef, {
          following: arrayRemove(`${email}@gmail.com`),
        });
        await updateDoc(profileUserRef, {
          followers: arrayRemove(user.email),
        });
        setIsFollowing(false);
      } else {
        await updateDoc(currentUserRef, {
          following: arrayUnion(`${email}@gmail.com`),
        });
        await updateDoc(profileUserRef, {
          followers: arrayUnion(user.email),
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  // Fetch followers/following lists
  const fetchFollowersAndFollowing = async () => {
    try {
      const profileUserRef = doc(db, "users", profileUserId);
      const profileUserSnap = await getDoc(profileUserRef);

      if (profileUserSnap.exists()) {
        const profileUserData = profileUserSnap.data();
        setFollowersList(profileUserData.followers || []);
        setFollowingList(profileUserData.following || []);
      }
    } catch (error) {
      console.error("Error fetching followers/following:", error);
    }
  };

  // Toggle modal visibility
  const toggleFollowersModal = () => {
    setShowFollowersModal(!showFollowersModal);
    if (!showFollowersModal) fetchFollowersAndFollowing();
  };

  const toggleFollowingModal = () => {
    setShowFollowingModal(!showFollowingModal);
    if (!showFollowingModal) fetchFollowersAndFollowing();
  };

  if (!userData) return <p>Loading user profile...</p>;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>{userData.name || "User Profile"}</h2>
      <img
        src={userData.photoURL || "depic.jpeg"}
        alt="User"
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "10px",
        }}
      >
        <div>
          <strong>{postsCount}</strong>
          <p>Posts</p>
        </div>
        <div onClick={toggleFollowersModal} style={{ cursor: "pointer" }}>
          <strong>{userData.followers?.length || 0}</strong>
          <p>Followers</p>
        </div>
        <div onClick={toggleFollowingModal} style={{ cursor: "pointer" }}>
          <strong>{userData.following?.length || 0}</strong>
          <p>Following</p>
        </div>
      </div>

      {user && user.email !== userData.email && (
        <button
          onClick={handleFollowToggle}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            borderRadius: "8px",
            backgroundColor: isFollowing ? "red" : "#007bff",
            color: "white",
            fontSize: "16px",
            border: "none",
            cursor: "pointer",
            transition: "0.3s",
          }}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}

      <h3>Posts</h3>
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
            </div>
          ))}
        </div>
      ) : (
        <p>No images uploaded yet.</p>
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "80%",
              maxWidth: "400px",
            }}
          >
            <h3>Followers</h3>
            <ul>
              {followersList.map((follower, index) => (
                <li key={index}>{follower}</li>
              ))}
            </ul>
            <button onClick={toggleFollowersModal}>❌</button>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "80%",
              maxWidth: "400px",
            }}
          >
            <h3>Following</h3>
            <ul>
              {followingList.map((follow, index) => (
                <li key={index}>{follow}</li>
              ))}
            </ul>
            <button onClick={toggleFollowingModal}>❌</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
