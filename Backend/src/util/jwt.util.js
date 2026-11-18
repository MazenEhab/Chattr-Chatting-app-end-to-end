const jwt = require("jsonwebtoken");
const User = require("../database/models/user.model.js");
const Blacklist = require("../database/models/blacklist.model.js");
const scret = process.env.JWT_SECRET;

const generateToken = (payload) => {
    return jwt.sign(payload, scret, { expiresIn: process.env.JWT_EXPIRES_IN });
}

const verifyToken = async (token) => {
    if (!token) {
        console.log("No token provided");
        throw new Error("Authentication required", 401)
    }

    const blacklistedToken = await Blacklist.findOne({ token });

    if (blacklistedToken) {
        throw new Error("Token is blacklisted", 401)
    }

    const decoded = jwt.verify(token, scret);
    
    if (!decoded || !decoded.userId) {
        throw new Error("Invalid token", 401)
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
        throw new Error("User not found", 404)
    }

    return {
        user,
        decoded
    }
}

module.exports = {
    verifyToken,
    generateToken
}
