const express = require("express");
const router = express.Router();

const authController = require("../controller/auth");
const middleware = require("../middleware/is-auth");
const validator = require("../middleware/validator");

router.post(
  "/login",
  validator.loginValidator,
  validator.handleValidationErrors,
  authController.login
);

router.post(
  "/signup",
  validator.signUpValidator,
  validator.handleValidationErrors,
  authController.signUp
);

router.post(
  "/verify-token",
  middleware.authMiddleware,
  authController.verifyToken
);

module.exports = router;
