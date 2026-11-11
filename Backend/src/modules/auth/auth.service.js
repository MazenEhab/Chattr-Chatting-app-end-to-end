const bcrypt = require("bcryptjs");
const path = require("path");

const jwtUtil = require(path.join(__dirname, "..", "..", "util", "jwt.util.js"));
const User = require(path.join(__dirname, "..", "..", "database", "models", "user.model.js"));

const signUp = async ({ username, email, password }) => {
    const existingUser = await User.findOne({email});
    if (existingUser) {
        throw new Error ("This email exist", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
        username,
        email,
        password: hashedPassword
    })

    return {
        userId: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt
    }
}

const signIn = async ({email, password}) => {
    console.log(email.toLowerCase())
    const user = await User.findOne({email: email.toLowerCase()}).select("-password");

    if (!user) {
        throw new Error ("User does not exist.");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        throw new Error ("Invalid password.");
    }

    const accessToken = jwtUtil.generateToken({ userId: user._id });

    return {
        user: {
            userId: user._id,
            username: user.username,
            email: user.email,
        },
        accessToken
    };
}

module.exports = { 
    signIn,
    signUp
}