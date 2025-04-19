import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const allUsers = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Firestore document ID
          ...doc.data(), // All user fields
        }));

        console.log("Fetched Users:", allUsers); // ✅ DEBUG LOG HERE

        setUsers(allUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers =
    searchTerm.trim() === ""
      ? []
      : users.filter((user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

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

      {filteredUsers.length > 0 ? (
        <div>
          {filteredUsers.map((user) => (
            <div
              key={user.uid || user.id}
              onClick={() => handleUserClick(user.email)}
              style={{
                margin: "10px 0",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "10%",
                }}
              >
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
      )}
    </div>
  );
};

export default Search;
