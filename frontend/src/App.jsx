import "./App.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import HomePage from "./pages/HomePage/HomePage";
import UserPage from "./pages/UserPage/UserPage";
import PrivateRoute from "./routes/privateRoute";
import EditProfilepage from "./pages/UserPage/EditProfilePage/EditProfilePage";
import PostWithModal from "./components/postWithModal/postWithModal";
import ChatPage from "./pages/ChatPage/ChatPage";
import MessagesPage from "./pages/MessagesPage/MessagesPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* PROTECTED ROUTES */}

          <Route path="/:username" element={<UserPage />} />
          <Route
            path="/:username/edit"
            element={<PrivateRoute element={EditProfilepage} />}
          />
          <Route path="/:username/p/:postId" element={<UserPage />} />
          <Route path="/messages/" element={<MessagesPage />} />
          <Route path="/messages/:otherpersonId" element={<ChatPage />} />
          {/* <Route path="/:username/p/:postId" element={<PostWithModal />} /> */}
          {/* <Route path="/:username/edit" element={<EditProfilepage />} /> */}
        </Routes>
      </Router>
    </>
  );
}

export default App;
