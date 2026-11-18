const service = require("./otp.service.js");
const emailService = require("../email/email.service.js");

const verifyOtp = async (req, res, next) => {
    try {
        const result = await service(req.body);

        if (!result) {
            return res.status(400).json({
                status: "error",
                message: "Invalid or expired verification code.",
            });
        }

        if (req.body.purpose === "email-verification") {
            await emailService.sendEmail({
                to: result.user.email, subject: "Welcome to chattr", template: "welcome", data: {
                    name: result.user.username,
                    username: result.user.username,
                    email: result.user.email,
                }
            });
        }

        const response = {
            status: "success",
            message: "Verification successful.",
        };

        if (req.body.purpose === "password-reset") {
            response.resetToken = result;
        } else {
            response.user = result.user;
        }

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

module.exports = verifyOtp;
