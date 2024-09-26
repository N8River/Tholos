import React, { useEffect, useState } from "react";
import "./alertMessage.css";

function AlertMessage({ message, type = "info", onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);

      // Delay the actual close to allow the fade-out effect
      setTimeout(() => {
        onClose();
      }, 300); // Duration matches the CSS transition time
    }, 60000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      <div
        className={`alertMessageOverlay ${visible ? "show" : ""}`}
        onClick={() => setVisible(false)}
      ></div>
      <div
        className={`alertMessage alertMessage--${type} ${
          visible ? "show" : ""
        }`}
      >
        <p>{message}</p>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300); // Allow fade-out before closing
          }}
        >
          &times;
        </button>
      </div>
    </>
  );
}

export default AlertMessage;
