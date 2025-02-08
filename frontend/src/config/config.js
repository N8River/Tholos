export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const JSON_HEADERS = {
  "Content-Type": "application/json",
};

export const AUTH_HEADER = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const MAX_POST_IMAGES = 5; // Maximum number of images a user can add

export const MAX_COMMENT_SIZE = 500;
