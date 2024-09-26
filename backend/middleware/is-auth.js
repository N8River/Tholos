const JWT = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const decodedToken = JWT.verify(token, process.env.JWT_SECRET);
    // console.log("🔴", decodedToken);

    req.user = decodedToken;

    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to authorize", error: error.message });
  }
};

exports.optionalAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decodedToken = JWT.verify(token, process.env.JWT_SECRET);
      req.user = decodedToken;
    } catch (error) {
      console.log("Invalid token:", error.message);
    }
  }

  // If no token or token is invalid, proceed without attaching user info
  next();
};
