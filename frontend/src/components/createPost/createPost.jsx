import { useState } from "react";
import "./createPost.css";
import { BsImage } from "react-icons/bs";
import { IoCloseOutline } from "react-icons/io5";
import { AUTH_HEADER, BACKEND_URL, JSON_HEADERS } from "../../config/config";

function CreatePost({ isVisible, handleCreatePostVisibilty }) {
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState();

  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/post/create`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          content: caption,
          image: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post.");
      }

      const responseData = await response.json();
      console.log("Post created:", responseData);

      setCaption("");
      setImageUrl("");
      handleCreatePostVisibilty();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`createPost ${isVisible ? "show" : ""}`}>
        <div className="createPostHeader">
          <button
            className="btn share"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Sharing..." : "Share"}
          </button>
          <p>Create New Post</p>
          <button className="btn close" onClick={handleCreatePostVisibilty}>
            <IoCloseOutline />
          </button>
        </div>
        <div className="createPostForm">
          <div className="createPostFormLeft">
            <div className="imgPreviewWrapper">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Preview"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <BsImage />
              )}
            </div>

            <big>Use image url or upload from your device</big>
            <input
              type="text"
              placeholder="IMAGE URL"
              name="imageUrl"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
              }}
            />
            <button className="btn">Upload from device</button>
          </div>

          <div className="createPostFormRight">
            <input
              type="text"
              placeholder="CAPTION"
              name="caption"
              value={caption}
              onChange={(e) => {
                setCaption(e.target.value);
              }}
              maxLength={256}
            />
            <p className="charCount">{caption.length} / 256</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreatePost;
