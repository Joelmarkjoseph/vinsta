// src/components/Message.jsx
import React from "react";

const Message = ({ message }) => {
  return (
    <div style={{ marginBottom: "10px" }}>
      <strong>{message.name || "Anonymous"}:</strong> {message.text}
    </div>
  );
};

export default Message;
