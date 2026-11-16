const path = require("path");
const express = require("express");

const controller = require(path.join(__dirname, "auth.controller.js"));
const validationMiddleware = require(path.join(__dirname, "..", "..", "middleware", "validation.middleware.js"))
const authorizationMiddleware = require(path.join(__dirname, "..", "..", "middleware", "Authorization.middleware.js"))

const signupSchema = require(path.join(__dirname, "..", "..", "validators", "schema", "user","signup.schema.js"))
const signinSchema = require(path.join(__dirname, "..", "..", "validators", "schema", "user","signin.schema.js"))
const updateSchema = require(path.join(__dirname, "..", "..", "validators", "schema", "user","update.schema.js"))
const resetPasswordSchema = require(path.join(__dirname, "..", "..", "validators", "schema", "user","resetpassword.schema.js"))

const router = express.Router();

router.get("/me", authorizationMiddleware.TokenAuthorization, controller.authMe)
.patch("/me", validationMiddleware(updateSchema),
        authorizationMiddleware.TokenAuthorization,
        controller.updateProfile
    );
router.post("/reset-password", validationMiddleware(resetPasswordSchema), controller.resetPassword);
router.post("/logout", authorizationMiddleware.TokenAuthorization, controller.logout);
router.post("/signup", validationMiddleware(signupSchema), controller.signUp);
router.post("/login", validationMiddleware(signinSchema), controller.signIn);

module.exports = router;
