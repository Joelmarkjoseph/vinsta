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
import { FaTelegramPlane } from "react-icons/fa";

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const auth = getAuth();
  const user = auth.currentUser;
  const bottomRef = useRef(null);
  const messagesRef = collection(db, "messages");

  useEffect(() => {
    const q = query(messagesRef, orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

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

  const formatDate = (timestamp) => {
    const date = timestamp?.toDate?.();
    if (!date) return "";
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  let lastDate = null;

  return (
    <div className="chat-room-container">
      <div className="chat-messages">
        {messages.map((msg, index) => {
          const createdAt = msg.createdAt?.toDate?.();
          const msgDate = createdAt ? createdAt.toDateString() : "Invalid date";

          const showDate =
            msgDate !== lastDate ? (
              <div className="date-separator" key={`date-${index}`}>
                {formatDate(msg.createdAt)}
              </div>
            ) : null;

          lastDate = msgDate;

          const time = createdAt
            ? createdAt.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            : "";

          const isSent = user && msg.name === (user.displayName || user.email);

          return (
            <React.Fragment key={msg.id}>
              {showDate}
              <div className={`chat-message ${isSent ? "sent" : "received"}`}>
                <div className="message-bubble">
                  {!isSent && <span className="sender-name">{msg.name}</span>}
                  <p className="text">{msg.text}</p>
                  <span className="timestamp">{time}</span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-form">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="chat-send-button" type="submit">
          <FaTelegramPlane style={{ fontSize: "20px" }} />
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
