import "./EditProfileForm.css";
import useUserInfo from "../../../../hooks/useUserInfo";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AUTH_HEADER,
  BACKEND_URL,
  JSON_HEADERS,
} from "../../../../config/config";
import { BsGlobeCentralSouthAsia, BsShieldLock } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { debounce } from "lodash";
import useTokenVerification from "../../../../hooks/useTokenVerification";
import useTokenValidation from "../../../../hooks/useTokenVerification";

function EditProfileForm() {
  const { username } = useParams();

  const navigate = useNavigate();

  const { user } = useUserInfo(username);
  // const [user, setUser] = useState({});

  const [newAvatarVisibility, setNewAvatarVisibility] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(""); // URL for preview in the modal

  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [bio, setBio] = useState("");
  const [privacy, setPrivacy] = useState("Public");
  const [isValidImage, setIsValidImage] = useState(false); // Check if the image URL is valid

  const token = localStorage.getItem("token");

  const { isValid, loading: tokenLoading } = useTokenValidation(token);

  useEffect(() => {
    if (!isValid && !tokenLoading) {
      localStorage.removeItem("token");
      navigate("/explore");
    }
  }, [navigate, isValid, tokenLoading]);

  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };

  useEffect(() => {
    if (user) {
      setAvatarUrl(user.avatar);
      setName(user.fullName);
      setUserName(user.userName);
      setBio(user.bio);
      setPrivacy(user.profileVisibility);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/user/profile/edit-profile`,
        {
          method: "PUT",
          headers: headers,
          body: JSON.stringify({
            fullName: name,
            userName: userName,
            avatar: avatarUrl,
            bio: bio,
            visibility: privacy,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed updating account info");
      }

      const responseData = await response.json();
      console.log("Profile updated successfully:", responseData);
      navigate(`/${userName}`);
    } catch (error) {
      console.log("Error updating account info:", error);
    }
  };

  const handleAvatarInputVisibility = () => {
    setNewAvatarVisibility(!newAvatarVisibility);
  };

  const handleAvatarChange = (e) => {
    const newUrl = e.target.value;
    setPreviewAvatarUrl(newUrl); // Update the preview URL in real-time
    debouncedValidateImageUrl(newUrl); // Validate the input URL
  };

  const saveNewAvatar = () => {
    if (isValidImage) {
      setAvatarUrl(previewAvatarUrl); // Save the previewed avatar as the actual avatar
      handleAvatarInputVisibility(); // Close the modal
    }
  };

  const debouncedValidateImageUrl = debounce((url) => {
    const img = new Image();
    img.onload = () => setIsValidImage(true); // URL is valid if image loads
    img.onerror = () => setIsValidImage(false); // URL is invalid if image fails to load
    img.src = url;
  }, 300); // 300 milliseconds delay

  return (
    <>
      <h5 className="editProfileHeader">Editing Profile</h5>
      {user && (
        <div className="editProfileForm">
          <div className="editProfileUserHeader">
            <div className="editProfileAvatar">
              {user.avatar !== "" ? <img src={avatarUrl} alt="" /> : ""}
            </div>
            <div className="editProfileUserName">
              <p>{user.userName}</p>
              <p
                className="changeProfilePhotoBtn"
                onClick={handleAvatarInputVisibility}
              >
                Change Profile Photo
              </p>
            </div>
          </div>
          <div className="inputContainer">
            <div className="label">Name</div>
            <div className="inputWrapper">
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <p>
                Help people discover your account by using the name you're known
                by: either your full name, nickname, or business name
              </p>
            </div>
          </div>
          <div className="inputContainer">
            <div className="label">Username</div>
            <input
              type="text"
              name="userName"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
              }}
            />
          </div>
          <div className="inputContainer">
            <div className="label">Bio</div>
            <input
              type="text"
              name="bio"
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
              }}
            />
          </div>
          <div className="inputContainer">
            <div className="label">Profile visibility</div>
            <div className="profileVisibilityOptionWrapper">
              <div className="profileVisibilityOptions">
                <div className="profileVisibilityOption">
                  <input
                    type="radio"
                    name="privacy"
                    value="Public"
                    checked={privacy === "Public"} // Set checked based on state
                    onChange={(e) => setPrivacy(e.target.value)}
                  />
                  <p>Public</p>
                </div>
                <div className="profileVisibilityOption">
                  <input
                    type="radio"
                    name="privacy"
                    value="Private"
                    checked={privacy === "Private"} // Set checked based on state
                    onChange={(e) => setPrivacy(e.target.value)}
                  />
                  <p>Private</p>
                </div>
              </div>
              <p>
                <span>
                  <BsGlobeCentralSouthAsia />
                  Public: Anyone can see your profile.
                </span>
                <span>
                  <BsShieldLock />
                  Private: Only approved followers can view your profile.
                </span>
              </p>
            </div>
          </div>
          <div className="btn" onClick={handleSubmit}>
            Save Changes
          </div>
        </div>
      )}
      {newAvatarVisibility && (
        <>
          <div className="avatarInputModalOverlay"></div>
          <div className="avatarInputModal">
            <div className="avatarInputModalHeader">
              <button
                className="submitAvatar"
                onClick={saveNewAvatar} // Save the avatar on button click
                disabled={!isValidImage} // Disable button if image is invalid
                style={{
                  cursor: isValidImage ? "pointer" : "not-allowed",
                  color: isValidImage
                    ? "var(--primary-color)"
                    : "var(--grey50)",
                }}
              >
                Save
              </button>
              <p>Change Profile Photo</p>
              <button onClick={handleAvatarInputVisibility}>
                <IoClose />
              </button>
            </div>
            <div className="avatarInputWrapper">
              <div className="avatarInputImgPreview">
                <img
                  src={isValidImage ? previewAvatarUrl : user.avatar}
                  alt="Avatar Preview"
                />
              </div>
              <div className="avatarInput">
                <input
                  type="text"
                  value={previewAvatarUrl === "" ? avatarUrl : previewAvatarUrl}
                  onChange={handleAvatarChange} // Make sure to validate the input
                  placeholder="Enter new avatar URL"
                />
              </div>
              <small>Enter a new URL for your profile picture.</small>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default EditProfileForm;
