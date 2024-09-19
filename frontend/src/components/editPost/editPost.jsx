import { IoCloseOutline } from "react-icons/io5";
import "./editPost.css";

function EditPost({
  post,
  isVisible,
  updatedPostContent,
  setUpdatedPostContent,
  handleEditPost,
  handleEditPostVisibility,
}) {
  return (
    <>
      {isVisible && (
        <>
          <div className="editPost">
            <div className="editPostHeader">
              <button className="share btn" onClick={handleEditPost}>
                Save Changes
              </button>
              <p>Editing the post</p>
              <button className="btn close" onClick={handleEditPostVisibility}>
                <IoCloseOutline />
              </button>
            </div>

            <div className="editPostForm">
              <div className="editPostFormLeft">
                <div className="editPostImageWrapper">
                  <img src={post.image} alt="" />
                </div>
              </div>
              <div className="editPostFormRight">
                <input
                  type="text"
                  value={updatedPostContent}
                  onChange={(e) => setUpdatedPostContent(e.target.value)}
                />
                <p className="charCount">{updatedPostContent.length} / 256</p>
              </div>
            </div>
          </div>
          <div
            className="editPostOverlay"
            onClick={handleEditPostVisibility}
          ></div>
        </>
      )}
    </>
  );
}

export default EditPost;
