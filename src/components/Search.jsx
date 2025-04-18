import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const secretKey = "your-secret-key"; // Replace with your actual secret key

  const decryptUserId = (encryptedId) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedId, secretKey);
      const originalId = bytes.toString(CryptoJS.enc.Utf8);
      return originalId;
    } catch (error) {
      console.error("Decryption failed: ", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const allUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const decryptedUsers = allUsers.map((user) => ({
        ...user,
        decryptedId: decryptUserId(user.id),
      }));

      setUsers(decryptedUsers);
    };

    fetchUsers();
  }, []);

  const filteredUsers =
    searchTerm.length > 0
      ? users.filter((user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const handleUserClick = (userEmail) => {
    const userEmailWithoutDomain = userEmail.split("@")[0];
    navigate(`/profile/${encodeURIComponent(userEmailWithoutDomain)}`);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <input
        type="text"
        placeholder="Search for users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "10px",
          width: "80%",
          fontSize: "16px",
          marginBottom: "20px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      {searchTerm.length > 0 &&
        (filteredUsers.length > 0 ? (
          <div>
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                style={{
                  margin: "10px 0",
                  textAlign: "left",
                  cursor: "pointer",
                }}
                onClick={() => handleUserClick(user.email)}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={user.photoURL || "default-photo-url.jpg"}
                    alt="User Avatar"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      marginRight: "10px",
                    }}
                  />
                  <strong>{user.name}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No users found</p>
        ))}
    </div>
  );
};

export default Search;
