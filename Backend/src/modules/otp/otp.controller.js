const path = require("path");

const service = require(path.join(__dirname, "otp.service.js"));
const emailService = require(path.join(__dirname, "..", "email", "email.service.js"));

const verifyAccount = async (req, res, next) => {
    try {
        const email = req.body.email;
        const otp = req.body.otp;
        
        const {user, result} = await service.verifyAccount({email, otp});

        await emailService.sendEmail({to: user.email, subject: "Welcome to chattr", template: "welcome", data: {
            name: user.username,
            username: user.username,
            email: user.email,
        }});

        res.status(200).json({
            status: "success",
            message: "Account verified successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    verifyAccount
}