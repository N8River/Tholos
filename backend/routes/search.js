const express = require("express");
const router = express.Router();
const searchController = require("../controller/search");
const middleware = require("../middleware/is-auth");
const validator = require("../middleware/validator");

router.get(
  "/search",
  middleware.authMiddleware,
  validator.searchValidator,
  validator.validatePagination,
  validator.handleValidationErrors,
  searchController.search
);

module.exports = router;
