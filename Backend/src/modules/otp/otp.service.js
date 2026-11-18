const bcrypt = require("bcryptjs");
const User = require("../../database/models/user.model.js");
const jwtUtil = require("../../util/jwt.util.js");

const verifyOtp = async ({ email, otp, purpose }) => {
    switch (purpose) {
        case "email-verification":
            return await verifyAccount({ email, otp });
        case "password-reset":
            return await verifyForget({ email, otp });
        default:
            return null;
    }
}

const verifyAccount = async ({email, otp}) => {
    const user = await User.findOne({email}).select("-password");

    if (!user) {
        return null;
    }

    if (user.isEmailVerified) {
        return null;
    }

    const confirmationOtp = user.otps?.confirmation

    if (!confirmationOtp?.code || !confirmationOtp?.expiresAt) {
        return null;
    }

    if (confirmationOtp?.attempts >= 5) {
        return null;
    }

    if (Date.now() > user.otps.confirmation.expiresAt.getTime()) {
        return null;
    }

    const otpMatched = await bcrypt.compare(otp, user.otps.confirmation.code);

    if (!otpMatched) {
        confirmationOtp.attempts += 1;
        await user.save();

        throw new Error ("In valid otp");
    }

    user.isEmailVerified = true;
    user.otps.confirmation = null;

    await user.save();

    return {
        user: {
            userId: user._id,
            username: user.username,
            email: user.email,
            isEmailVerified: user.isEmailVerified
        }
    }
}

const verifyForget = async ({email, otp}) => {
    const user = await User.findOne({email});

    if (!user || !user.isEmailVerified) {
        return null;
    }

    if (user.accountStatus === "suspended") {
        return null;
    }

    const forgetOtp = user.otps?.resetPassword

    if (!forgetOtp?.code || !forgetOtp?.expiresAt) {
        return null;
    }

    if (Date.now() > user.otps.resetPassword.expiresAt.getTime()) {
        return null;
    }
    
    if (user.otps.resetPassword.attempts >= 5) {
        return null;
    }

    const otpMatched = await bcrypt.compare(otp, user.otps.resetPassword.code);

    if (!otpMatched) {
        user.otps.resetPassword.attempts += 1;
        await user.save();
        return null;
    }

    const token = jwtUtil.generateToken(
        { 
            userId: user._id,
            purpose: "password-reset"
         },
        { expiresIn: "15m" }
        );
    user.otps.resetPassword = null;
    
    await user.save();

    return token
}

module.exports = verifyOtp
