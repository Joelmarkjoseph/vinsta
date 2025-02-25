import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import navigate
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
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the logged-in user
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false); // Fixed loading state
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
          where("userEmail", "==", `${email}@gmail.com`) // Filter by profile user
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
          console.log(
            "Following status:",
            profileUserData.followers?.includes(user.email)
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
        where("userEmail", "==", `${email}@gmail.com`) // Fetch images of profile user
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
      <h3>Posts</h3>
      {loading ? (
        <p>Loading images...</p>
      ) : images.length > 0 ? (
        <div>
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
                {/* <p>
                  {new Date(image.uploadedAt?.seconds * 1000).toLocaleString()}
                </p> */}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No images uploaded yet.</p>
      )}
    </div>
  );
};

export default Profile;
