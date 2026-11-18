const { sign } = require("crypto");
const authService = require("./auth.service.js");
const emailService = require("../email/email.service.js");

const authMe = async (req, res, next) => {
    try {
        const { user } = await authService.authMe({
            userId: req.user._id
        });

        return res.status(200).json({
            status: "success",
            message: "User retrieved successfully",
            user
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { user } = await authService.updateProfile({
            ...req.body,
            userId: req.user._id
        });

        return res.status(200).json({
            status: "success",
            message: "User updated successfully",
            user
        });
    } catch (error) {
        next(error);
    }
}

const logout = async (req, res, next) => {
    try {
        await authService.logout({
            token: req.token,
            expiresAt: new Date(req.decoded.exp * 1000),
        });

        res.clearCookie("chattr_access_token", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        return res.status(200).json({
            status: "success",
            message: "Logged out successfully",
        });
    } catch (error) {
        next(error);
    }
}

const forgetPassword = async (req, res, next) => {
    try {
        const result = await authService.forgetPassword(req.body);

        if (result) {
            try {
                await emailService.sendEmail({
                    to: result.user.email, subject: "Password Reset", template: "passwordReset", data: {
                        name: result.user.username,
                        email: result.user.email,
                        code: result.otp.code,
                        minutes: result.otp.expiresAt
                    }
                });
            } catch (error) {
                console.error("Error sending email:", error);
            }
        }

        return res.status(200).json({
            status: "success",
            message: "Password reset email sent successfully",
        });
    } catch (error) {
        next(error);
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { user } = await authService.resetPassword({
            userId: req.decoded.userId,
            password: req.body.password
        });

        return res.status(200).json({
            status: "success",
            message: "Password reset successfully",
        });
    } catch (error) {
        next(error);
    }
}

const resendOtp = async (req, res, next) => {
    try {
        const { email, purpose } = req.body;

        const result = await authService.resendOtp({
            email,
            purpose
        });

        const isEmailVerification = purpose === "email-verification";

        await emailService.sendEmail({
            to: result.user.email,
            subject: isEmailVerification
                ? "Verify Your Email"
                : "Password Reset",
            template: isEmailVerification
                ? "emailVerification"
                : "passwordReset",
            data: {
                name: result.user.username,
                email: result.user.email,
                code: result.otp.code,
                minutes: result.otp.expiresAt
            }
        });

        return res.status(200).json({
            status: "success",
            message: "OTP sent successfully"
        });

    } catch (error) {
        next(error);
    }
};
const signUp = async (req, res, next) => {
    try {
        const { user, otp } = await authService.signUp(req.body);

        await emailService.sendEmail({
            to: user.email, subject: "Email Verification", template: "verification", data: {
                name: user.username,
                email: user.email,
                code: otp.code,
                minutes: otp.expiresAt
            }
        });

        return res.status(201).json({
            status: "success",
            message: "Account created successfully",
            data: {
                user,
            },
        })
    } catch (error) {
        next(error);
    }
}

const signIn = async (req, res, next) => {
    try {
        const { user, accessToken, requiresVerification, otp } = await authService.signIn(req.body);

        if (requiresVerification) {
            await emailService.sendEmail({
                to: user.email, subject: "Email Verification", template: "verification", data: {
                    name: user.username,
                    email: user.email,
                    code: otp.code,
                    minutes: otp.expiresAt
                }
            });

            return res.status(200).json({
                status: "success",
                requiresVerification: true,
                message: "Please verify your email.",
                redirectTo: "/otp"
            });
        }

        res.cookie("chattr_access_token", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: parseInt(process.env.JWT_EXPIRES_IN) * 60 * 1000,
        })

        return res.status(201).json({
            status: "success",
            message: "Logged in successfully",
            user
        })

    } catch (error) {
        next(error);
    }
}

module.exports = {
    authMe,
    updateProfile,
    logout,
    forgetPassword,
    resetPassword,
    resendOtp,
    signUp,
    signIn,
};
