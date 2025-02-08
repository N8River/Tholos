const JWT = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

  try {
    const decodedToken = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken; // Attach decoded token to the request object
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Unauthorized: Token expired" });
    } else {
      res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
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
