import "./userProfilePostCard.css";
import { useNavigate } from "react-router-dom";

function UserProfilePostCard({ post }) {
  const navigate = useNavigate();

  return (
    <>
      <div
        className="userProfilePostCard"
        onClick={() => {
          navigate(`/${post.user.userName}/p/${post._id}`);
        }}
      >
        <div className="userProfilePostCardImgWrapper">
          <img src={post.image} alt={post.content} />
        </div>
      </div>
    </>
  );
}

export default UserProfilePostCard;
