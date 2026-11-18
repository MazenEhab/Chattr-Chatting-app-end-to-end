const express = require('express');
const router = express.Router();

const otpController = require("./otp.controller.js");
const validationMiddleware = require("../../middleware/validation.middleware.js")

const verifySchema = require("../../validators/schema/otp/verify.schema.js");

router.post("/verify", validationMiddleware(verifySchema), otpController);

module.exports = router;
