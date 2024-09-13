import "./EditProfileForm.css";
import useUserInfo from "../../../../hooks/useUserInfo";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AUTH_HEADER,
  BACKEND_URL,
  JSON_HEADERS,
} from "../../../../config/config";

function EditProfileForm() {
  const { username } = useParams();

  const userInfo = useUserInfo(username);
  const [user, setUser] = useState({});

  const [avatarUrl, setAvatarUrl] = useState("");
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [bio, setBio] = useState("");
  const [privacy, setPrivacy] = useState("Public");

  const token = localStorage.getItem("token");

  const headers = {
    ...JSON_HEADERS,
    ...AUTH_HEADER(token),
  };

  useEffect(() => {
    if (userInfo) {
      setUser(userInfo);
      // user ? console.log("⭕", user.avatar !== "") : " ";

      setAvatarUrl(user.avatar);
      setName(user.fullName);
      setUserName(user.userName);
      setBio(user.bio);
      setPrivacy(user.profileVisibility);
    }
  }, [userInfo]);

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
    } catch (error) {
      console.log("Error updating account info:", error);
    }
  };

  return (
    <>
      <div className="editProfileForm">
        <form>
          <div className="inputContainer">
            <div className="avatarLabel">
              {user.avatar !== "" ? <img src={user.avatar} alt="" /> : ""}
            </div>
            <input
              type="text"
              name="avatarUrl"
              value={avatarUrl}
              onChange={(e) => {
                setAvatarUrl(e.target.value);
              }}
            />
          </div>
          <div className="inputContainer">
            <div className="label">Name</div>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
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
          <div className="changeVisibility">
            <big>Change profile visibility</big>
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
          <div className="btn" onClick={handleSubmit}>
            Submit
          </div>
        </form>
      </div>
    </>
  );
}

export default EditProfileForm;
