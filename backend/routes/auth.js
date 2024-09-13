const express = require("express");

const authController = require("../controller/auth");
const middleware = require("../middleware/is-auth");

const router = express.Router();

router.post("/login", authController.login);

router.post("/signup", authController.signUp);

module.exports = router;
