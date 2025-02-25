import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";
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
import { useAuth } from "../AuthContext"; // Ensure correct path

const Profile = () => {
  const { email } = useParams();
  const { user } = useAuth(); // Get the logged-in user
  const [userData, setUserData] = useState(null);
  const [postsCount, setPostsCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null); // Store the profile user's UID

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
          setProfileUserId(userDoc.id); // Store the profile user's UID
          console.log("Profile user data:", userDoc.data());
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
          where("email", "==", `${email}@gmail.com`)
        );
        const imagesSnapshot = await getDocs(imagesQuery);
        setPostsCount(imagesSnapshot.size);
      } catch (error) {
        console.error("Error fetching posts count:", error);
      }
    };

    const checkFollowingStatus = async () => {
      if (!user) return;

      const currentUserRef = doc(db, "users", user.uid);
      const currentUserSnap = await getDoc(currentUserRef);

      if (currentUserSnap.exists()) {
        const currentUserData = currentUserSnap.data();
        setIsFollowing(
          currentUserData.following?.includes(`${email}@gmail.com`)
        );
        console.log(
          "Is following:",
          currentUserData.following?.includes(`${email}@gmail.com`)
        );
      }
    };

    fetchUserByEmail();
    fetchPostsCount();
    checkFollowingStatus();
  }, [email, user]);

  const handleFollowToggle = async () => {
    if (!user || !profileUserId) return;

    const currentUserRef = doc(db, "users", user.uid);
    const profileUserRef = doc(db, "users", profileUserId);

    try {
      if (isFollowing) {
        // Unfollow user
        await updateDoc(currentUserRef, {
          following: arrayRemove(`${email}@gmail.com`),
        });
        await updateDoc(profileUserRef, { followers: arrayRemove(user.email) });
        setIsFollowing(false);
      } else {
        // Follow user
        await updateDoc(currentUserRef, {
          following: arrayUnion(`${email}@gmail.com`),
        });
        await updateDoc(profileUserRef, { followers: arrayUnion(user.email) });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  if (!userData) return <p>Loading user profile...</p>;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>{userData.name || "User Profile"}</h2>
      <img
        src={userData.photoURL || "default-profile.png"}
        alt="User"
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
      <p>Email: {userData.email}</p>
      <p>Bio: {userData.bio || "No bio available."}</p>

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
        <div>
          <strong>{userData.followers?.length || 0}</strong>
          <p>Followers</p>
        </div>
        <div>
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
    </div>
  );
};

export default Profile;
