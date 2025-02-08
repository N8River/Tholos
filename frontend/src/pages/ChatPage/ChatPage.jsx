import { useNavigate } from "react-router-dom";
import Chat from "../../components/chat/chat";
import { useEffect } from "react";
import useTokenVerification from "../../hooks/useTokenVerification";
import useTokenValidation from "../../hooks/useTokenVerification";

function ChatPage() {
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const { isValid, loading: tokenLoading } = useTokenValidation(token);

  useEffect(() => {
    if (!isValid && !tokenLoading) {
      navigate("/explore");
    }
  }, [navigate, isValid, tokenLoading]);

  return (
    <>
      <Chat />
    </>
  );
}

export default ChatPage;
