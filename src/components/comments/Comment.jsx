import React, { useState, useEffect } from "react";
import styles from "./comments.module.css";
import EmojiPicker from "emoji-picker-react";
import { useSession } from "next-auth/react";
import { FaRegSmile, FaTimes } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";

const Comment = ({ comment }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      setReplies([...replies, replyText]); // Add reply to the list
      setReplyText("");
    }
  };

  const onEmojiClick = (emojiObject) => {
    setReplyText((prev) => prev + emojiObject.emoji);
  };

  return (
    <li>
      <strong>{comment.user?.name || "Anonymous"}</strong>: {comment.content}
      <div className={styles.commentActions}>
        <button
          className={styles.emojiButton}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          {showEmojiPicker ? <FaTimes /> : <FaRegSmile />}
        </button>
        <button
          className={styles.replyButton}
          onClick={() => setShowReplyInput(!showReplyInput)}
        >
          {" "}
          <FiMessageCircle className={styles.icon} /> Reply
        </button>

        {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick} />}
      </div>
      {showReplyInput && (
        <form onSubmit={handleReplySubmit}>
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className={styles.commentFrom}
          />
          <button type="submit" className={styles.button}>
            Submit Reply
          </button>
        </form>
      )}
      <ul>
        {replies.map((reply, index) => (
          <li key={index}>{reply}</li>
        ))}
      </ul>
    </li>
  );
};

export default Comment;
