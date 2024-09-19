import { useNavigate } from "react-router-dom";
import "./searchResult.css";

function SearchResult({ user, post }) {
  const navigate = useNavigate();
  console.log(post);

  return (
    <>
      <div className="searchResult">
        {user ? (
          <div
            className="searchResultUser"
            onClick={() => {
              navigate(`/${user.userName}`);
            }}
          >
            <div className="searchResultUserAvatar">
              <img src={user.avatar} alt={"user avatar"} />
            </div>
            <div className="searchResultUserName">
              <p>{user.userName}</p>
              <p className="grey">{user.fullName}</p>
            </div>
          </div>
        ) : null}

        {post ? (
          <div
            className="searchResultPost"
            onClick={() => {
              navigate(`/${post.user.userName}/p/${post._id}`);
            }}
          >
            <div className="searchResultPostWrapper">
              <img src={post.images[0]} alt={post.content} />
            </div>
            <div className="searchResultPostUser">
              <div className="searchResultUserAvatar">
                <img src={post.user.avatar} alt={"user avatar"} />
              </div>
              <div className="searchResultUserName">
                <p>{post.user.userName}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default SearchResult;
