import { useNavigate } from "react-router-dom";
import "./comment.css";

function Comment({ comment }) {
  // console.log("🔴 Comment", comment);
  const navigate = useNavigate();

  return (
    <>
      <div className="comment">
        <div
          className="commentUserAvatar"
          onClick={() => {
            navigate(`/${comment.user.userName}`);
          }}
        >
          <img src={comment.user.avatar} alt="" />
        </div>

        <div className="inline-block">
          <strong
            onClick={() => {
              navigate(`/${comment.user.userName}`);
            }}
          >
            {comment.user.userName}
          </strong>
          {comment.text}
        </div>
      </div>
    </>
  );
}

export default Comment;
