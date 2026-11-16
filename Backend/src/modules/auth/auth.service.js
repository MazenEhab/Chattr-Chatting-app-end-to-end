const bcrypt = require("bcryptjs");
const nanoid = require("nanoid");
const path = require("path");

const jwtUtil = require(path.join(__dirname, "..", "..", "util", "jwt.util.js"));
const User = require(path.join(__dirname, "..", "..", "database", "models", "user.model.js"));
const Blacklist = require(path.join(__dirname, "..", "..", "database", "models", "blacklist.model.js"));

const authMe = async ({ userId }) => {
    const user = await User.findById(userId).select("-password").select("-otps")

    if (!user) {
        throw new Error("User not found");
    }

    if (user.accountStatus == "suspended") {
        throw new Error("Account suspended")
    }

    if (user.accountStatus == "deactivated") {
        throw new Error("Account deactivated");
    }

    if (user.isEmailVerified == false) {
        throw new Error("Please verifiy your email");
    }

    return {
        user: {
            userId: user._id,
            username: user.username,
            name: user.username,
            nick: user.nickname,
            lastSeen: user.showOnlineStatus,
            receipts: user.readReceipts,
            email: user.email,
            photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUw7yz0WHmZ5vrO8S7t7VqvpVArTAf5fahbCofT_FQiw&s=10",
        },

        userObject: user
    }
}

const updateProfile = async ({ userId, nickname, photo, lastSeen, receipts }) => {
    const { userObject } = await authMe({ userId });

    if (nickname !== undefined)
        userObject.nickname = nickname;

    if (photo !== undefined)
        userObject.photo = photo;

    if (lastSeen !== undefined)
        userObject.showOnlineStatus = lastSeen;

    if (receipts !== undefined)
        userObject.readReceipts = receipts;

    await userObject.save();

    return {
        user: {
            nick: userObject.nickname,
            lastSeen: userObject.showOnlineStatus,
            receipts: userObject.readReceipts,
            photo: userObject.photo,
        }
    }
}

const logout = async ({ token, expiresAt }) => {
    if (!token || !(expiresAt instanceof Date) || Number.isNaN(expiresAt.getTime())) {
        throw new Error("Token has no expiration");
    }

    await Blacklist.create({
        token,
        expiresAt
    });
}

const resetPassword = async ({ email }) => {
    const user = await User.findOne({ email });

    if (!user) {
        return null;
    }

    if (!user.isEmailVerified) {
        return null;
    }

    if (user.accountStatus === "suspended") {
        return null;
    }

    const otp = nanoid.nanoid(6);
    const hashedOtp = await bcrypt.hash(otp, 12);
    const minutes = 10;

    user.otps.resetPassword = {
        code: hashedOtp,
        expiresAt: new Date(Date.now() + minutes * 60 * 1000),
        attempts: 0,
    }

    await user.save();

    return {
        user: {
            userId: user._id,
            username: user.username,
            email: user.email,
        },

        otp: {
            code: otp,
            expiresAt: minutes
        }
    }
}

const signUp = async ({ username, email, password, nickname }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
        throw new Error("This email exist", 409);
    }

    if (existingUser && !existingUser.isEmailVerified) {
        await User.deleteOne({ email });
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const otp = nanoid.nanoid(6);
    const hashedOtp = await bcrypt.hash(otp, 12);
    const minutes = 10;

    const user = await User.create({
        username,
        nickname: nickname || username,
        email,
        password: hashedPassword,
        otps: {
            confirmation: {
                code: hashedOtp,
                expiresAt: new Date(Date.now() + minutes * 60 * 1000)
            }
        }
    })

    return {
        user: {
            userId: user._id,
            username: user.username,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            accountStatus: user.accountStatus,
            lastSeen: user.lastSeen,
            createdAt: user.createdAt,
        },

        otp: {
            code: otp,
            expiresAt: minutes
        }
    }
}

const signIn = async ({ email, password }) => {
    console.log(email.toLowerCase())
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new Error("User does not exist.");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        throw new Error("Invalid password.");
    }

    const accessToken = jwtUtil.generateToken({ userId: user._id });

    if (!user.isEmailVerified) {
        const otp = nanoid.nanoid(6);
        const hashedOtp = await bcrypt.hash(otp, 12);
        const minutes = 10;

        user.otps.confirmation = {
            code: hashedOtp,
            expiresAt: new Date(Date.now() + minutes * 60 * 1000)
        }

        user.save();

        return {
            requiresVerification: true,

            user: {
                userId: user._id,
                username: user.username,
                name: user.username,
                nick: user.nickname,
                lastSeen: user.lastSeen,
                receipts: user.readReceipts,
                email: user.email,
            },

            otp: {
                code: otp,
                expiresAt: minutes
            }
        };
    }

    return {
        user: {
            userId: user._id,
            username: user.username,
            name: user.username,
            nick: user.nickname,
            lastSeen: user.lastSeen,
            receipts: user.readReceipts,
            email: user.email,
            photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUw7yz0WHmZ5vrO8S7t7VqvpVArTAf5fahbCofT_FQiw&s=10",
        },
        accessToken
    };
}

module.exports = {
    authMe,
    updateProfile,
    logout,
    resetPassword,
    signIn,
    signUp
}
