import React, { useState, useEffect } from "react";
import { db, storage } from "../firebaseConfig"; // adjust the path
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const EditProfile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setProfilePicUrl(data.photoURL || "");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      let updatedFields = { name };

      // Handle profile picture upload
      if (profilePic) {
        const storageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadBytes(storageRef, profilePic);
        const downloadURL = await getDownloadURL(storageRef);
        updatedFields.photoURL = downloadURL;
        setProfilePicUrl(downloadURL);
      }

      await updateDoc(userRef, updatedFields);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Edit Profile</h2>
      <div style={styles.profileSection}>
        <img
          src={profilePicUrl || "https://via.placeholder.com/150"}
          alt="Profile"
          style={styles.profilePic}
        />
        <input type="file" accept="image/*" onChange={handleProfilePicChange} />
      </div>
      <div style={styles.inputSection}>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          placeholder="Enter your name"
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <button style={styles.button} onClick={handleSaveChanges}>
        Save Changes
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "40px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
  },
  profileSection: {
    marginBottom: "20px",
  },
  profilePic: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "10px",
  },
  inputSection: {
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default EditProfile;
