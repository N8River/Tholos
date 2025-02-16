const { body, param, query } = require("express-validator");
const { validationResult } = require("express-validator");
const User = require("../model/user");
const mongoose = require("mongoose");

exports.objectIdValidator = (field, location = "body") => {
  let validator;
  switch (location) {
    case "body":
      validator = body(field);
      break;
    case "param":
      validator = param(field);
      break;
    case "query":
      validator = query(field);
      break;
    default:
      throw new Error(`Invalid location specified for validation: ${location}`);
  }

  return validator
    .notEmpty()
    .withMessage(`${field} is required`)
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage(`${field} must be a valid ObjectId`);
};

exports.loginValidator = [
  // Check that the identifier is provided
  body("identifier")
    .notEmpty()
    .withMessage("Email or username is required")
    .isString()
    .withMessage("Identifier must be a valid string"),

  // Check that the password is provided and has a minimum length
  body("password").notEmpty().withMessage("Password is required"),
];

exports.signUpValidator = [
  // Full Name validation
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full Name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Full Name must be between 3 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Full Name must contain only letters and spaces"),

  // Username validation
  body("userName")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .custom(async (value) => {
      // Convert the value to lowercase for a case-insensitive search
      const existingUser = await User.findOne({
        userName: { $regex: new RegExp(`^${value}$`, "i") },
      });
      if (existingUser) {
        throw new Error("Username already exists (case-insensitive)");
      }
    }),

  // Email validation
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .custom(async (value) => {
      const existingEmail = await User.findOne({ email: value });
      if (existingEmail) {
        throw new Error("Email already exists");
      }
    }),

  // Password validation
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

exports.createPostValidator = [
  // Validate caption (required and max length 256)
  body("content")
    .notEmpty()
    .withMessage("Caption is required")
    .isString()
    .withMessage("Caption must be a valid string")
    .isLength({ max: 256 })
    .withMessage("Caption must be less than 256 characters"),

  // Validate images array (must be at least one and no more than 5)
  body("images")
    .isArray({ min: 1, max: 5 })
    .withMessage(
      "Post must contain at least 1 image and a maximum of 5 images"
    ),

  // Validate that each image is a valid URL
  body("images.*").isURL().withMessage("Each image must be a valid URL"),
];

exports.validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
];

exports.validateUserPosts = [
  param("userName").isString().withMessage("Username must be a valid string"),
  query("isOwner")
    .optional()
    .isBoolean()
    .withMessage("isOwner must be a boolean value"),
  query("currentUserId")
    .optional({ nullable: true }) // Accepts null or undefined
    .isMongoId()
    .withMessage("currentUserId must be a valid user ID"),
  ...exports.validatePagination,
];

exports.commentValidator = [
  body("comment")
    .notEmpty()
    .withMessage("Comment is required")
    .isString()
    .withMessage("Comment must be a string")
    .isLength({ max: 500 })
    .withMessage("Comment cannot exceed 500 characters"),
];

exports.searchValidator = [
  query("query")
    .trim()
    .notEmpty()
    .withMessage("Search query is required.")
    .isLength({ min: 1 })
    .withMessage("Search query must be at least 1 character long."),
];

exports.updateProfileValidator = [
  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Full Name must be between 3 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Full Name must contain only letters and spaces"),
  body("userName")
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .custom(async (value, { req }) => {
      const existingUser = await User.findOne({
        userName: { $regex: new RegExp(`^${value}$`, "i") },
        _id: { $ne: req.user.userId },
      });
      if (existingUser) {
        throw new Error("Username already exists");
      }
    }),
  body("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),
  body("bio")
    .optional()
    .isLength({ max: 160 })
    .withMessage("Bio cannot exceed 160 characters"),
  body("visibility")
    .optional()
    .isIn(["Public", "Private"])
    .withMessage("Visibility must be either 'Public' or 'Private'"),
];

exports.usernameValidator = [
  param("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
];

exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg, // Just return the first error message
    });
  }
  next();
};
