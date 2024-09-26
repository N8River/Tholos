import "./App.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import HomePage from "./pages/HomePage/HomePage";
import UserPage from "./pages/UserPage/UserPage";
import PrivateRoute from "./routes/privateRoute";
import EditProfilepage from "./pages/UserPage/EditProfilePage/EditProfilePage";
import ChatPage from "./pages/ChatPage/ChatPage";
import MessagesPage from "./pages/MessagesPage/MessagesPage";
import ExplorePage from "./pages/ExplorePage/ExplorePage";
import { FeedbackProvider } from "./context/feedbackContext";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";

function App() {
  return (
    <>
      <FeedbackProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/:username" element={<UserPage />} />

            {/* <Route
              path="/:username/edit"
              element={<PrivateRoute element={EditProfilepage} />}
            />
            <Route path="/messages/" element={<MessagesPage />} />
            <Route path="/messages/:otherpersonId" element={<ChatPage />} /> */}

            <Route path="/:username/p/:postId" element={<UserPage />} />
            <Route path="/explore" element={<ExplorePage />} />

            {/* Private Routes */}
            <Route
              path="/:username/edit"
              element={<PrivateRoute element={EditProfilepage} />}
            />
            <Route
              path="/messages/"
              element={<PrivateRoute element={MessagesPage} />}
            />
            <Route
              path="/messages/:otherpersonId"
              element={<PrivateRoute element={ChatPage} />}
            />

            {/* Catch-All Route for 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </FeedbackProvider>
    </>
  );
}

export default App;
