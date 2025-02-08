import { useNavigate } from "react-router-dom";
import "./profile.css";
import { IoIosSettings } from "react-icons/io";
import { BACKEND_URL, JSON_HEADERS, AUTH_HEADER } from "../../config/config";
import { useEffect, useState } from "react";
import UserProfilePostCard from "../userProfilePostCard/userProfilePostCard";
import { jwtDecode } from "jwt-decode";
import { IoCamera } from "react-icons/io5";

import Loader from "../loader/loader";
import LoginModal from "../loginModal/loginModal";

import { useCallback } from "react";
import _ from "lodash";
import FollowList from "../followList/followList";
import { BsFileLockFill, BsLock, BsShieldLock } from "react-icons/bs";

import useResponsive from "../../hooks/useResponsive";
import useTokenVerification from "../../hooks/useTokenVerification";
import useTokenValidation from "../../hooks/useTokenVerification";
import ProfileSkeleton from "./profileSkeleton";

function Profile({ isOwner, user, postCount, mutualFollowers }) {
  // console.log("🔴 User", user);
  // console.log("IS OWNER", isOwner);
  // console.log("🔴 MUTUAL FOLLOWERS", mutualFollowers);
  const isMobileProfileDetails = useResponsive(640);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const {
    isValid,
    decodedToken,
    loading: tokenLoading,
  } = useTokenValidation(token);

  useEffect(() => {
    if (!tokenLoading && !isValid && token) {
      localStorage.removeItem("token");
      navigate("/explore");
    }
  }, [navigate, isValid, tokenLoading, decodedToken]);

  const headers = token
    ? {
        ...JSON_HEADERS,
        ...AUTH_HEADER(token),
      }
    : {
        ...JSON_HEADERS,
      };

  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followRequestPending, setFollowRequestPending] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false); // Modal state
  const [showFollowList, setShowFollowList] = useState(false);
  const [followList, setFollowList] = useState(false);
  const [type, setType] = useState(false);

  const [page, setPage] = useState(1); // Track the current page for pagination
  const limit = 12; // Number of posts per page
  const [hasMore, setHasMore] = useState(true); // Flag to check if more posts exist
  const [isFetching, setIsFetching] = useState(false);

  const loggedInUserId = token && jwtDecode(token).userId;
  const [profilePrivateError, setProfilePrivateError] = useState(false); // State for handling private profile error

  const [showSkeleton, setShowSkeleton] = useState(false);
  useEffect(() => {
    // If user data doesn't load within 250ms, show skeleton
    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, 250);

    // If data arrives before 150ms, clear timer so skeleton never shows
    return () => clearTimeout(timer);
  }, []);

  const isLoading =
    tokenLoading || isFollowingLoading || !user || !user.userName;

  const fetchUserPosts = async () => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);

    try {
      const url = new URL(
        `${BACKEND_URL}/api/post/user-posts/${user.userName}`
      );
      url.searchParams.append("isOwner", isOwner);

      // Add `currentUserId` only if the user is logged in
      if (loggedInUserId) {
        url.searchParams.append("currentUserId", loggedInUserId);
      }

      url.searchParams.append("page", page);
      url.searchParams.append("limit", limit);

      const response = await fetch(url.toString(), { headers });

      if (!response.ok) {
        if (response.status === 403) {
          const errorData = await response.json();
          // console.log(errorData);
          setProfilePrivateError(true);
          // Don't throw an error here to avoid redundant logs
          return;
        }
        throw new Error("Failed to fetch user posts");
      }

      const responseData = await response.json();

      if (responseData.length < limit) {
        setHasMore(false);
      }

      setUserPosts((prevPosts) => [
        ...prevPosts,
        ...responseData.filter(
          (post) => !prevPosts.some((p) => p._id === post._id)
        ),
      ]);

      setProfilePrivateError(false);
    } catch (error) {
      if (error.message !== "This account is private.") {
        console.error("Error fetching user's post:", error);
      }
    } finally {
      setIsFetching(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!token) {
      setIsFollowing(false);
      setIsFollowingLoading(false);
      return;
    }
    setIsFollowingLoading(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/user/${user._id}/is-following`,
        {
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check follow status");
      }

      const { isFollowing, followRequestPending } = await response.json();
      setIsFollowing(isFollowing);
      setFollowRequestPending(followRequestPending);
    } catch (error) {
      console.log("Error checking follow status:", error);
    } finally {
      setIsFollowingLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.userName) {
      checkFollowStatus();
      fetchUserPosts(); // Load the first batch of posts on mount
    }
  }, [user, token, isOwner, loggedInUserId]);

  useEffect(() => {
    if (page > 1) fetchUserPosts(); // Fetch posts when page changes
  }, [page]);

  // console.log("🧑🏽‍🦱 USER", user);

  const handleFollow = async () => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/user/${user._id}/follow`,
        {
          method: "POST",
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to follow the user");
      }

      const result = await response.json();

      // Check if the follow request was sent or if the user is now following
      if (result.message === "Follow request sent successfully") {
        setFollowRequestPending(true); // Show "Requested" if follow request is pending
      } else if (result.message === "Followed user successfully") {
        setIsFollowing(true); // Show "Unfollow" if the user is now following
      }
    } catch (error) {
      console.error("Error following user", error);
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/user/${user._id}/unfollow`,
        {
          method: "POST",
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to unfollow the user");
      }

      // Update the local user state to reflect the new follower count
      // setCurrentUser((prevUser) => ({
      //   ...prevUser,
      //   followers: prevUser.followers.filter(
      //     (followerId) => followerId !== loggedInUserId // Remove the current logged-in user's ID from the followers list
      //   ),
      // }));

      setIsFollowing(false);
    } catch (error) {
      console.error("Error unfollowing user", error);
    }
  };

  const handleScroll = useCallback(
    _.debounce(() => {
      if (!hasMore || isFetching) return; // Stop if no more posts or already fetching

      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 250
      ) {
        if (token) setPage((prevPage) => prevPage + 1);
        else setShowLoginModal(true);
      }
    }, 300), // Debounce with a 300ms delay
    [hasMore, isFetching, token]
  );

  const renderMutualFollowers = () => {
    if (mutualFollowers.length === 0) return null;

    const followerUsernames = mutualFollowers.map(
      (follower) => follower.userName
    );

    // Show first 2 names and "and X more" if there are more than 3 mutuals
    if (followerUsernames.length > 3) {
      return `${followerUsernames.slice(0, 2).join(", ")} and ${
        followerUsernames.length - 2
      } more`;
    } else {
      return followerUsernames.join(", ");
    }
  };

  const handleFollowList = async (type, max_mutuals, max_other_followers) => {
    // Block access if profile is private and user is not following
    if (user.profileVisibility === "Private" && !isFollowing && !isOwner) {
      // Display a message instead of opening the follow list
      alert("This account is private. You need to follow to see this list.");
      return;
    }

    const endpoint =
      type === "Followers"
        ? `${BACKEND_URL}/api/user/${user._id}/followers?maxMutuals=${max_mutuals}&maxOtherFollowers=${max_other_followers}`
        : `${BACKEND_URL}/api/user/${user._id}/following?maxMutuals=${max_mutuals}&maxOtherFollowers=${max_other_followers}`;

    try {
      const response = await fetch(endpoint, { headers });
      if (!response.ok) throw new Error("Failed to fetch follow list");

      const followUsers = await response.json();
      setFollowList(followUsers);
      setShowFollowList(true);
      setType(type);
    } catch (error) {
      console.error("Error fetching follow list:", error);
    }
  };

  const toggleFollowListVisibility = () => {
    setShowFollowList(!showFollowList);
  };

  const handlePostDeletion = (deletedPostId) => {
    setUserPosts((prevPosts) =>
      prevPosts.filter((post) => post._id !== deletedPostId)
    );
  };

  const handleLogOut = () => {
    // Clear the token
    localStorage.removeItem("token");

    // Reset states related to the profile page
    setUserPosts([]);
    setIsFollowing(false);
    setFollowRequestPending(false);
    setShowLoginModal(false);
    setShowFollowList(false);
    setFollowList(false);

    // Optional: disconnect socket or other connections if applicable
    // socket.disconnect(); // Uncomment if socket is used in this component

    // Navigate to the home page or reload
    if (window.location.pathname === "/") {
      window.location.reload(); // Full reload ensures complete cleanup
    } else {
      navigate("/"); // Navigate to home page
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, isFetching]);

  if (isLoading && !showSkeleton) {
    // For the first 150ms, show nothing (avoid referencing user at all).
    return null;
  }

  if (isLoading && showSkeleton) {
    // If we're still loading *after* 150ms, show skeleton
    return <ProfileSkeleton isMobile={isMobileProfileDetails} />;
  }

  return (
    <>
      {/* <ProfileSkeleton isMobile={isMobileProfileDetails} /> */}
      <div className="profile">
        <div className="profileInfo">
          {isMobileProfileDetails ? (
            <div className="profileDetails-mobile">
              <div className="profileDetailsHeader-mobile">
                <div className="profilePic-mobile">
                  <img src={user.avatar} alt="" />{" "}
                </div>
                <div className="profileDescHeader-mobile">
                  <h4>{user.userName}</h4>

                  <button
                    className="btn"
                    onClick={() => {
                      if (isOwner) {
                        navigate(`/${user.userName}/edit`);
                      } else {
                        if (isFollowing) {
                          handleUnfollow();
                        } else if (followRequestPending) {
                          console.log("Follow request already sent");
                        } else {
                          handleFollow();
                        }
                      }
                    }}
                  >
                    {isOwner ? (
                      <big>Edit Profile</big>
                    ) : isFollowing ? (
                      <big>Unfollow</big>
                    ) : followRequestPending ? (
                      <big>Requested</big>
                    ) : (
                      <big>Follow</big>
                    )}
                  </button>

                  {isOwner ? (
                    <button className="btn" onClick={handleLogOut}>
                      <IoIosSettings />
                    </button>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <div className="profileDetailsMiddle-mobile">
                <div className="profileDescBio-mobile">
                  <big>{user.fullName}</big>
                  <p>{user.bio}</p>{" "}
                </div>
                {mutualFollowers.length > 0 && (
                  <div className="mutualFollowers-mobile">
                    <small>
                      Followed by <strong>{renderMutualFollowers()}</strong>
                    </small>
                  </div>
                )}
              </div>
              <div className="profileDetailsFooter-mobile">
                <div className="profileDescSubHeader-mobile">
                  <p>
                    {postCount === 0 ? (
                      <>
                        <strong>{postCount}</strong> Posts
                      </>
                    ) : postCount === 1 ? (
                      <>
                        <strong>{postCount}</strong> Post
                      </>
                    ) : (
                      <>
                        <strong>{postCount}</strong> Posts
                      </>
                    )}
                  </p>
                  <p
                    className="followListBtns-mobile"
                    onClick={() => {
                      handleFollowList("Followers", 10, 15);
                    }}
                  >
                    {user.followers.length === 0 ? (
                      <>
                        <strong>{user.followers.length}</strong> Followers
                      </>
                    ) : user.followers.length === 1 ? (
                      <>
                        <strong>{user.followers.length}</strong> Follower
                      </>
                    ) : (
                      <>
                        <strong>{user.followers.length}</strong> Followers
                      </>
                    )}
                  </p>
                  <p
                    className="followListBtns-mobile"
                    onClick={() => {
                      handleFollowList("Following", 10, 15);
                    }}
                  >
                    {user.following.length === 0 ? (
                      <>
                        <strong>{user.following.length}</strong> Following
                      </>
                    ) : user.following.length === 1 ? (
                      <>
                        <strong>{user.following.length}</strong> Following
                      </>
                    ) : (
                      <>
                        <strong>{user.following.length}</strong> Following
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="profileDetails">
              <div className="profilePic">
                <img src={user.avatar} alt="" />{" "}
              </div>
              <div className="profileDesc">
                <div className="profileDescHeader">
                  <h4>{user.userName}</h4>

                  <button
                    className="btn"
                    onClick={() => {
                      if (isOwner) {
                        navigate(`/${user.userName}/edit`);
                      } else {
                        if (isFollowing) {
                          handleUnfollow();
                        } else if (followRequestPending) {
                          console.log("Follow request already sent");
                        } else {
                          handleFollow();
                        }
                      }
                    }}
                  >
                    {isOwner ? (
                      <big>Edit Profile</big>
                    ) : isFollowing ? (
                      <big>Unfollow</big>
                    ) : followRequestPending ? (
                      <big>Requested</big>
                    ) : (
                      <big>Follow</big>
                    )}
                  </button>

                  {isOwner ? (
                    <button className="btn" onClick={handleLogOut}>
                      <IoIosSettings />
                    </button>
                  ) : (
                    ""
                  )}
                </div>
                <div className="profileDescSubHeader">
                  <p>
                    {postCount === 0 ? (
                      <>
                        <strong>{postCount}</strong> Posts
                      </>
                    ) : postCount === 1 ? (
                      <>
                        <strong>{postCount}</strong> Post
                      </>
                    ) : (
                      <>
                        <strong>{postCount}</strong> Posts
                      </>
                    )}
                  </p>
                  <p
                    className="followListBtns"
                    onClick={() => {
                      handleFollowList("Followers", 10, 15);
                    }}
                  >
                    {user.followers.length === 0 ? (
                      <>
                        <strong>{user.followers.length}</strong> Followers
                      </>
                    ) : user.followers.length === 1 ? (
                      <>
                        <strong>{user.followers.length}</strong> Follower
                      </>
                    ) : (
                      <>
                        <strong>{user.followers.length}</strong> Followers
                      </>
                    )}
                  </p>
                  <p
                    className="followListBtns"
                    onClick={() => {
                      handleFollowList("Following", 10, 15);
                    }}
                  >
                    {user.following.length === 0 ? (
                      <>
                        <strong>{user.following.length}</strong> Following
                      </>
                    ) : user.following.length === 1 ? (
                      <>
                        <strong>{user.following.length}</strong> Following
                      </>
                    ) : (
                      <>
                        <strong>{user.following.length}</strong> Following
                      </>
                    )}
                  </p>
                </div>

                <div className="profileDescBio">
                  <big>{user.fullName}</big>
                  <p>{user.bio}</p>{" "}
                </div>
                {mutualFollowers.length > 0 && (
                  <div className="mutualFollowers">
                    <small>
                      Followed by <strong>{renderMutualFollowers()}</strong>
                    </small>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {isLoading && page === 1 ? ( // Show full page loader only for initial load
          <></>
        ) : profilePrivateError ? (
          <p className="privateErrorMessage">
            <BsShieldLock /> This account is private. Follow to see the posts.
          </p>
        ) : (
          <>
            <div className="profilePosts">
              {userPosts &&
                (postCount === 0 ? (
                  <div className="userHasNoPostsMessage">
                    <IoCamera />
                    No Posts Yet
                  </div>
                ) : (
                  userPosts.map((post) => (
                    <UserProfilePostCard
                      post={post}
                      key={post._id}
                      onDelete={handlePostDeletion}
                    />
                  ))
                ))}
            </div>
            {/* {isFetching && <Loader />}{" "} */}
            {/* Show loader only when fetching more posts */}
          </>
        )}

        {/* <div className="profilePosts">
          {isLoading ? (
            <Loader />
          ) : profilePrivateError ? (
            <p className="privateErrorMessage">
              This account is private. Follow to see the posts.
            </p>
          ) : (
            userPosts &&
            userPosts.map((post) => (
              <UserProfilePostCard post={post} key={post._id} />
            ))
          )}
        </div> */}
      </div>

      {showFollowList && (
        <FollowList
          isVisible={showFollowList}
          followUsers={followList}
          type={type}
          totalFollowers={user.followers.length}
          totalFollowing={user.following.length}
          toggleVisibility={toggleFollowListVisibility}
          user={user}
        />
      )}
      {showLoginModal && <LoginModal user={user} />}
    </>
  );
}

export default Profile;
