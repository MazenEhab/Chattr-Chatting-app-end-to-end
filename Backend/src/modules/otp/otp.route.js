const express = require('express');
const router = express.Router();
const path = require("path");

const controller = require(path.join(__dirname, "otp.controller.js"));
const validationMiddleware = require(path.join(__dirname, "..", "..", "middleware", "validation.middleware.js"))

const verifySchema = require(path.join(__dirname, "..", "..", "validators", "schema", "otp", "verify.schema.js"));

router.post("/verify", validationMiddleware(verifySchema), controller.verifyAccount);

module.exports = router;