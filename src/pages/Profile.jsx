// this uses id
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const Profile = () => {
  const { id } = useParams(); // Decrypted user ID from URL
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const userRef = doc(db, "users", id);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data());
      } else {
        console.log("User not found");
      }
    };

    getUser();
  }, [id]);

  if (!userData) return <p>Loading profile...</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <img
        src={userData.photoURL || "default-photo.jpg"}
        alt="User"
        style={{ borderRadius: "50%", width: "100px", height: "100px" }}
      />
      <h2>{userData.name}</h2>
      <p>Email: {userData.email}</p>
      {/* Add more user info if needed */}
    </div>
  );
};

export default Profile;
