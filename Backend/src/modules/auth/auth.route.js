const path = require("path");
const express = require("express");

const controller = require(path.join(__dirname, "auth.controller.js"));
const validationMiddleware = require(path.join(__dirname, "..", "..", "middleware", "validation.middleware.js"))

const signupSchema = require(path.join(__dirname, "..", "..", "validators", "schema", "user","signup.schema.js"))
const signinSchema = require(path.join(__dirname, "..", "..", "validators", "schema", "user","signin.schema.js"))

const router = express.Router();

router.post("/signup", validationMiddleware(signupSchema), controller.signUp);
router.post("/signin", validationMiddleware(signinSchema), controller.signIn);

module.exports = router;