const bcrypt = require("bcryptjs");
const path = require("path");

const User = require(path.join(__dirname, "..", "..", "database", "models", "user.model.js"));

const verifyAccount = async ({email, otp}) => {
    const user = await User.findOne({email}).select("-password");

    if (!user) {
        throw new Error ("Account was not found");
    }

    if (user.isEmailVerified) {
        throw new Error ("Email is already verified");
    }

    const confirmationOtp = user.otps?.confirmation

    if (!confirmationOtp?.code || !confirmationOtp?.expiresAt) {
        throw new Error("No verification OTP found. Please request a new one.");
    }

    if (confirmationOtp?.attempts >= 5) {
        throw new Error("Too many attempts. Request a new OTP.");
    }

    const otpMatched = await bcrypt.compare(otp, user.otps.confirmation.code);

    if (!otpMatched) {
        confirmationOtp.attempts += 1;
        await user.save();

        throw new Error ("In valid otp");
    }

    if (Date.now() > user.otps.confirmation.expiresAt.getTime()) {
        throw new Error ("Otp expired")
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

module.exports = {
    verifyAccount
}