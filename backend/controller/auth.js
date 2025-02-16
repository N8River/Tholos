const User = require("../model/user");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

exports.signUp = async (req, res, next) => {
  try {
    // Check env variable instead of hardcoding
    if (process.env.SIGNUPS_DISABLED === "true") {
      return res
        .status(403)
        .json({ message: "Signups are temporarily disabled." });
    }

    const { fullName, userName, email, password } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const existingUsername = await User.findOne({ userName });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      fullName: fullName,
      userName: userName,
      email: email,
      password: hashedPw,
    });

    const savedUser = await user.save();
    res
      .status(201)
      .json({ message: "User created successfully", user: savedUser });
  } catch (error) {
    console.log("Error signing up:", error);
    res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { userName: identifier }],
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid email/username or password" });
    }

    // Fetch the list of allowed users from the environment variable
    if (process.env.ALLOWED_USERS) {
      const allowedUsers = process.env.ALLOWED_USERS
        ? process.env.ALLOWED_USERS.split(",")
        : [];

      // Check if the user is in the allowed list
      if (
        !allowedUsers.includes(user.email) &&
        !allowedUsers.includes(user.userName)
      ) {
        return res
          .status(403)
          .json({ message: "Access restricted to certain accounts only." });
      }

      const passwordCorrect = await bcrypt.compare(password, user.password);
      if (!passwordCorrect) {
        return res
          .status(400)
          .json({ message: "Invalid email/username or password" });
      }
    }

    const token = JWT.sign(
      {
        email: user.email,
        userId: user._id.toString(),
        userName: user.userName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error logging in:", error);
    res.status(500).json({ message: "Failed to login", error: error.message });
  }
};

exports.verifyToken = async (req, res, next) => {
  res.status(200).json({ message: "Token is valid" });
};
