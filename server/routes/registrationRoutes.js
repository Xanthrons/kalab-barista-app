const express = require("express");
const { registerApplicant } = require("../controllers/registrationController");

const router = express.Router();

router.post("/", registerApplicant);

module.exports = router;
