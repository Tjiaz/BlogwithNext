import React, { useState, useEffect } from "react";
import styles from "./comments.module.css";
import EmojiPicker from "emoji-picker-react";
import { useSession } from "next-auth/react";
import Comment from "./Comment";
import { FiMessageCircle } from "react-icons/fi";
import { FaRegSmile, FaTimes } from "react-icons/fa";

const Comments = ({ articleId }) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await fetch("/api/comments");
        if (response.ok) {
          const data = await response.json();
          // Ensure we're working with an array
          setComments(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to fetch comments");
          setComments([]); // Set empty array if request fails
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    }
    if (articleId) fetchComments();
  }, [articleId]);

  // Handle new comment submission
  async function handleSubmit(e) {
    e.preventDefault();
    if (!session) {
      alert("You need to be logged in to comment!");
      return;
    }

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment,articleId }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments((prevComments) => [newCommentData, ...prevComments]);
        setNewComment("");
      } else {
        console.error("Failed to submit comment");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  }

  function onEmojiClick(emojiObject) {
    setNewComment((prevComment) => prevComment + emojiObject.emoji);
  }

  return (
    <div className={styles.commentSection}>
      <h2>What do you think</h2>

      {session ? (
        <form className={styles.commentInput} onSubmit={handleSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            required
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            {showEmojiPicker ? <FaTimes /> : <FaRegSmile />}
          </button>
          {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick} />}
          <button type="submit">Comment</button>
        </form>
      ) : (
        <p>Please log in to leave a comment.</p>
      )}

      {/* <ul className={styles.commentList}>
        {Array.isArray(comments) &&
          comments.map((comment) => (
            <li key={comment.id}>
              <strong>
                {comment.user?.name || comment.userEmail || "Anonymous"}
              </strong>
              : {comment.content}
            </li>
          ))}
      </ul> */}

      <ul className={styles.commentList}>
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </ul>
    </div>
  );
};

export default Comments;
