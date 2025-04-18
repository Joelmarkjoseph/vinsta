import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";
import "./ChatRoom.css";

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const auth = getAuth();
  const user = auth.currentUser;
  const bottomRef = useRef(null); // 👈 Create ref

  const messagesRef = collection(db, "messages");

  useEffect(() => {
    const q = query(messagesRef, orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  // 👇 Auto-scroll when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    if (!user) return;

    await addDoc(messagesRef, {
      text: input,
      name: user.displayName || user.email || "User",
      createdAt: serverTimestamp(),
    });

    setInput("");
  };

  return (
    <div className="chat-room-container">
      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${
              user && msg.name === (user.displayName || user.email)
                ? "sent"
                : "received"
            }`}
          >
            <span className="sender">{msg.name}</span>
            <p className="text">{msg.text}</p>
          </div>
        ))}
        <div ref={bottomRef} /> {/* 👈 Invisible div to scroll into view */}
      </div>
      <form onSubmit={sendMessage} className="chat-form">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="chat-send-button" type="submit">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
