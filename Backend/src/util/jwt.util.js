    const jwt = require("jsonwebtoken");
    const path = require("path");

    const User = require(path.join(__dirname, "..", "..", "database", "models", "user.model.js"));
    const scret = process.env.JWT_SECRET;

    const generateToken = (payload) => {
        return jwt.sign(payload, scret, { expiresIn: process.env.JWT_EXPIRES_IN });
    }

    const verifyToken = async (req, res, next) => {
        try {
            const token = req.cookies?.chattr_access_token;

            if (!token) {
                return next(new Error("Authentication required", 401));
            }

            const decoded = jwt.verify(token, scret);

            if (!decoded || !decoded.userId) {
                return next(new Error("Invalid token", 401));
            }

            const user = await User.findById(decoded.userId).select("-password");

            if (!user) {
                return next(new Error("User not found", 404));
            }

            req.user = user;

            next();
        } catch (error) {
            return next(new Error("Invalid token", 401));
        }
    }

    module.exports = {
        verifyToken,
        generateToken
    }