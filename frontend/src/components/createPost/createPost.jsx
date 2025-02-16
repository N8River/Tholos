import { useState, useEffect } from "react";
import "./createPost.css";
import { BsImage } from "react-icons/bs";
import { IoCloseOutline } from "react-icons/io5";
import { AUTH_HEADER, BACKEND_URL, JSON_HEADERS } from "../../config/config";
import Loader from "../loader/loader";

import { getAspectRatioClass } from "../../utils/utils";
import { MAX_POST_IMAGES } from "../../config/config";
import useTokenVerification from "../../hooks/useTokenVerification";
import useTokenValidation from "../../hooks/useTokenVerification";
import { useNavigate } from "react-router-dom";

function CreatePost({ isVisible, handleCreatePostVisibilty }) {
  const [imageUrls, setImageUrls] = useState([]); // Array to store multiple image URLs
  const [currentImageUrl, setCurrentImageUrl] = useState(""); // Current input URL
  const [aspectRatios, setAspectRatios] = useState([]); // Array to store aspect ratios for each image

  const [caption, setCaption] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // For image preview selection
  const token = localStorage.getItem("token");

  const { isValid, loading: tokenLoading } = useTokenValidation(token);

  const navigate = useNavigate();

  useEffect(() => {
    if (!tokenLoading) {
      if (!isValid) {
        localStorage.removeItem("token");
        navigate("/explore");
      }
    }
  }, [isValid, tokenLoading]);

  const [loading, setLoading] = useState(false);

  const [captionError, setCaptionError] = useState("");
  const [imageError, setImageError] = useState("");

  const [isImageLoading, setIsImageLoading] = useState(false); // Track image loading status
  const [imagePreviewError, setImagePreviewError] = useState(""); // Track image preview errors

  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };

  useEffect(() => {
    if (currentImageUrl.trim() === "") {
      // Reset states when input is empty
      setIsImageLoading(false);
      setImagePreviewError("");
      return;
    }

    // Start loading
    setIsImageLoading(true);
    setImagePreviewError("");

    const img = new Image();
    img.src = currentImageUrl;

    img.onload = () => {
      setIsImageLoading(false);
      setImagePreviewError("");
    };

    img.onerror = () => {
      setIsImageLoading(false);
      setImagePreviewError("Unable to load image. Please check the URL.");
    };

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [currentImageUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;

    // Reset error messages before validation
    setCaptionError("");
    setImageError("");

    // Validate images
    if (imageUrls.length === 0) {
      setImageError("You must add at least one image.");
      hasError = true;
    } else if (imageUrls.length > MAX_POST_IMAGES) {
      setImageError("You can add a maximum of 5 images.");
      hasError = true;
    }

    // Validate caption
    if (caption.trim() === "") {
      setCaptionError("Caption is required.");
      hasError = true;
    }

    // Ensure all image URLs are valid
    const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
    const invalidImageUrls = imageUrls.filter((url) => !urlPattern.test(url));
    if (invalidImageUrls.length > 0) {
      setImageError("One or more of your image URLs is invalid.");
      hasError = true;
    }

    if (hasError) return; // Stop if there are validation errors

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
      setImageUrls([]);
      handleCreatePostVisibilty();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  const addImageUrl = () => {
    if (
      currentImageUrl.trim() &&
      imageUrls.length < MAX_POST_IMAGES &&
      !imagePreviewError
    ) {
      setImageUrls((prevUrls) => [currentImageUrl, ...prevUrls]);
      setCurrentImageUrl("");
    }
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

  function applyAspectRatioClass(element, width, height) {
    const aspectRatioClasses = [
      "aspect-ratio-1-1",
      "aspect-ratio-16-9",
      "aspect-ratio-4-3",
      "aspect-ratio-3-4",
      "aspect-ratio-9-16",
    ];

    aspectRatioClasses.forEach((className) => {
      element.classList.remove(className);
    });

    const aspectRatioClass = getAspectRatioClass(width, height);

    element.classList.add(aspectRatioClass);
  }

  return (
    <>
      <div className={`createPost ${isVisible ? "show" : ""}`}>
        <div className="createPostHeader">
          <button
            className="btn share"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <p>"Sharing..."</p> <Loader />
              </>
            ) : (
              "Share"
            )}
          </button>
          <p>Create New Post</p>
          <button className="btn close" onClick={handleCreatePostVisibilty}>
            <IoCloseOutline />
          </button>
        </div>
        <div className="createPostForm">
          <div className="createPostFormLeft">
            {/* <div className="currentImgPreview">
              <div className="imgPreviewWrapper">
                {currentImageUrl.trim() !== "" ? (
                  isImageLoading ? (
                    // Show loader while image is loading
                    <Loader />
                  ) : imagePreviewError ? (
                    // Show error message if there's an error
                    <p className="errorMessage">{imagePreviewError}</p>
                  ) : (
                    // Display the image preview
                    <img
                      src={currentImageUrl}
                      alt="Preview"
                      onLoad={(e) => {
                        const width = e.target.naturalWidth;
                        const height = e.target.naturalHeight;
                        console.log("Image:", width, height);
                        applyAspectRatioClass(
                          e.target.parentNode,
                          width,
                          height
                        );
                      }}
                    />
                  )
                ) : (
                  // Default content when no URL is entered
                  <BsImage />
                )}
              </div>
            </div> */}
            <div className="currentImgPreview">
              <div className="imgPreviewWrapper">
                {currentImageUrl.trim() !== "" ? (
                  isImageLoading ? (
                    // Show loader while image is loading
                    <Loader />
                  ) : imagePreviewError ? (
                    // Show error message if there's an error
                    <p className="errorMessage">{imagePreviewError}</p>
                  ) : (
                    // Display the image preview of currentImageUrl
                    <img
                      src={currentImageUrl}
                      alt="Preview"
                      onLoad={(e) => {
                        const width = e.target.naturalWidth;
                        const height = e.target.naturalHeight;
                        console.log("Image:", width, height);
                        applyAspectRatioClass(
                          e.target.parentNode,
                          width,
                          height
                        );
                      }}
                    />
                  )
                ) : imageUrls.length > 0 ? (
                  // Display the selected image from imageUrls
                  <img
                    src={imageUrls[selectedImageIndex]}
                    alt="Preview"
                    onLoad={(e) => {
                      const width = e.target.naturalWidth;
                      const height = e.target.naturalHeight;
                      console.log("Image:", width, height);
                      applyAspectRatioClass(e.target.parentNode, width, height);
                    }}
                  />
                ) : (
                  // Default content when no URL is entered and no images added
                  <BsImage />
                )}
              </div>
            </div>

            {/* <div className="imgPreviewList">
              <div className="imageList">
                {imageUrls.slice(1).map((url, index) => (
                  <div key={index} className="imgPreviewWrapper-small">
                    <img
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      onLoad={(e) => {
                        const width = e.target.naturalWidth;
                        const height = e.target.naturalHeight;
                        console.log(`Small Image:`, width, height);
                        applyAspectRatioClass(
                          e.target.parentNode,
                          width,
                          height
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
            </div> */}
            <div className="imgPreviewList">
              <div className="imageList">
                {imageUrls.map((url, index) => (
                  <div
                    key={index}
                    className={`imgPreviewWrapper-small ${
                      index === selectedImageIndex ? "selected" : ""
                    }`}
                    onClick={() => handleImageSelection(index)}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      onLoad={(e) => {
                        const width = e.target.naturalWidth;
                        const height = e.target.naturalHeight;
                        console.log(`Small Image:`, width, height);
                        applyAspectRatioClass(
                          e.target.parentNode,
                          width,
                          height
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="createPostFormRight">
            <div className="postInput">
              <div className="imageInput">
                {imageUrls.length >= MAX_POST_IMAGES ? (
                  <p className="maxImageMessage">
                    Maximum amount of images reached
                  </p>
                ) : (
                  <>
                    <input
                      className={`addImgInput ${
                        imageUrls.length >= MAX_POST_IMAGES ? "inactive" : ""
                      }`}
                      type="text"
                      placeholder={
                        imageUrls.length >= MAX_POST_IMAGES
                          ? "Max amount of images reached"
                          : "Image URL"
                      }
                      value={currentImageUrl}
                      onChange={(e) => setCurrentImageUrl(e.target.value)}
                      disabled={imageUrls.length >= MAX_POST_IMAGES} // Disable the input when max images are reached
                    />
                    <button
                      className={`addImgBtn ${
                        imageUrls.length >= MAX_POST_IMAGES ? "inactive" : ""
                      } ${currentImageUrl.length > 0 ? "on" : "off"}`}
                      onClick={addImageUrl}
                      disabled={imageUrls.length >= MAX_POST_IMAGES}
                    >
                      Add this image
                    </button>
                    {imageError && (
                      <p className="errorMessageImagePost">{imageError}</p>
                    )}{" "}
                    {/* Show image error */}
                  </>
                )}
              </div>
              <div className="captionInput">
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
                {captionError && (
                  <p className="errorMessageCaption">{captionError}</p>
                )}{" "}
                {/* Show caption error */}
              </div>
            </div>
            <p>You can post upto 5 images</p>
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
