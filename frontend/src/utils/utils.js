import { jwtDecode } from "jwt-decode";

export function getAspectRatioClass(width, height) {
  const aspectRatio = width / height;
  const tolerance = 0.05; // 5% tolerance for considering as square

  if (Math.abs(aspectRatio - 1) <= tolerance) {
    return "aspect-ratio-1-1"; // Square
  } else if (aspectRatio > 1.7) {
    return "aspect-ratio-16-9"; // Landscape 16:9
  } else if (aspectRatio > 1.3) {
    return "aspect-ratio-4-3"; // Landscape 4:3
  } else if (aspectRatio < 0.7) {
    return "aspect-ratio-9-16"; // Tall Portrait 9:16
  } else {
    return "aspect-ratio-3-4"; // Portrait 3:4
  }
}

export const isTokenExpired = (token) => {
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // in seconds
    return decodedToken.exp < currentTime; // check if expiration time is in the past
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // assume token is expired if there's an error
  }
};

export const getRelativeTime = (timestamp) => {
  const now = new Date();
  const postDate = new Date(timestamp);
  const timeDifference = now - postDate;

  const minutes = Math.floor(timeDifference / 60000);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
};

export const formatDateHeader = (dateString) => {
  const date = new Date(dateString);
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString(undefined, options);
};
