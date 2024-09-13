export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const JSON_HEADERS = {
  "Content-Type": "application/json",
};

export const AUTH_HEADER = (token) => ({
  Authorization: `Bearer ${token}`,
});
