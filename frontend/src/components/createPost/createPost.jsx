import { useState } from "react";
import "./createPost.css";
import { BsImage } from "react-icons/bs";
import { IoCloseOutline } from "react-icons/io5";
import { AUTH_HEADER, BACKEND_URL, JSON_HEADERS } from "../../config/config";

function CreatePost({ isVisible, handleCreatePostVisibilty }) {
  const [imageUrls, setImageUrls] = useState([""]); // Array to store multiple image URLs
  const [caption, setCaption] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // For image preview selection
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);

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
          images: imageUrls, // Send array of image URLs
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post.");
      }

      const responseData = await response.json();
      console.log("Post created:", responseData);

      setCaption("");
      setImageUrls([""]);
      handleCreatePostVisibilty();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  const addImageUrlInput = () => {
    setImageUrls([...imageUrls, ""]);
  };

  // Update a specific image URL in the array
  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  // Handle image selection for the preview
  const handleImageSelection = (index) => {
    setSelectedImageIndex(index);
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
              {imageUrls[selectedImageIndex] ? (
                <img
                  src={imageUrls[selectedImageIndex]}
                  alt="Preview"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <BsImage />
              )}
            </div>
          </div>

          <div className="createPostFormRight">
            <div className="imageList">
              {imageUrls.map((url, index) => (
                <div key={index} className="imageItem">
                  <img
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    onClick={() => handleImageSelection(index)}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <input
                    type="text"
                    placeholder={`IMAGE URL ${index + 1}`}
                    value={url}
                    onChange={(e) =>
                      handleImageUrlChange(index, e.target.value)
                    }
                  />
                </div>
              ))}
              <button onClick={addImageUrlInput}>+</button>
            </div>
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
      <div
        className={`createPostOverlay ${isVisible ? "show" : ""}`}
        onClick={handleCreatePostVisibilty}
      ></div>
    </>
  );
}

export default CreatePost;
