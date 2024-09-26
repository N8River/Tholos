import React, { createContext, useState, useContext } from "react";
import AlertMessage from "../components/alertMessage/alertMessage";

const FeedbackContext = createContext();

export const useFeedback = () => useContext(FeedbackContext);

export const FeedbackProvider = ({ children }) => {
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (message, type = "info") => {
    setFeedback({ message, type });
  };

  const closeFeedback = () => setFeedback(null);

  return (
    <FeedbackContext.Provider value={{ showFeedback }}>
      {children}
      {feedback && (
        <AlertMessage
          message={feedback.message}
          type={feedback.type}
          onClose={closeFeedback}
        />
      )}
    </FeedbackContext.Provider>
  );
};
