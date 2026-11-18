const express = require("express");

const controller = require("./auth.controller.js");

const schemaIndex = require("../../validators/schema/user/index.js");
const middlewareIndex = require("../../middleware/index.js");

const router = express.Router();

router.get("/me", middlewareIndex.authorizationMiddleware.TokenAuthorization, controller.authMe)
router.patch(
    "/me",
    middlewareIndex.authorizationMiddleware.TokenAuthorization,
    middlewareIndex.validationMiddleware(schemaIndex.update),
    controller.updateProfile
);
router.post("/forget", middlewareIndex.validationMiddleware(schemaIndex.forgetPassword), controller.forgetPassword);
router.post(
    "/reset-password",
    middlewareIndex.validationMiddleware(schemaIndex.resetPassword),
    middlewareIndex.authorizationMiddleware.resetPasswordToken,
    controller.resetPassword
);
router.post("/resend", middlewareIndex.debugMiddleware, middlewareIndex.validationMiddleware(schemaIndex.resend), controller.resendOtp);
router.post("/logout", middlewareIndex.authorizationMiddleware.TokenAuthorization, controller.logout);
router.post("/signup", middlewareIndex.validationMiddleware(schemaIndex.signup), controller.signUp);
router.post("/login", middlewareIndex.validationMiddleware(schemaIndex.signin), controller.signIn);

module.exports = router;
