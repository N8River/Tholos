import { useNavigate } from "react-router-dom";
import Chat from "../../components/chat/chat";
import { useEffect } from "react";

function ChatPage() {
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/explore");
    }
  }, [navigate, token]);

  return (
    <>
      <Chat />
    </>
  );
}

export default ChatPage;
