import React from "react";

const SubscribeModal = ({ onClose, show }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
          padding: "20px",
          width: "90%",
          maxWidth: "400px",
          borderRadius: "10px",
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
        <p style={{ fontWeight: "bold", fontSize: "18px" }}>
          Get the FREE eBook & Cheat Sheets!
        </p>
        <form>
          <input
            type="email"
            placeholder="Your Email"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
            required
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              backgroundColor: "#0B73B1",
              color: "#fff",
              fontWeight: "bold",
              textTransform: "uppercase",
              border: "none",
              cursor: "pointer",
              borderRadius: "5px",
            }}
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubscribeModal;
