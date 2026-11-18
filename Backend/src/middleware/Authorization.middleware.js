const jwt = require("../util/jwt.util.js");

const TokenAuthorization = async (req, res, next) => {
    try {
        const token = req.cookies?.chattr_access_token;
        const { user, decoded } = await jwt.verifyToken(token)

        if (decoded.purpose != "auth") {
            next(new Error("Not authorized"));
        }

        req.decoded = decoded
        req.token = token
        req.user = user
        next();
    } catch (error) {
        next(error);
    }
}

const resetPasswordToken = async (req, res, next) => {
    try {
        const token = req.body.token;
        const { user, decoded } = await jwt.verifyToken(token)

        if (decoded.purpose != "password-reset") {
            next(new Error("Not authorized"));
        }

        req.decoded = decoded
        req.token = token
        req.user = user
        next();
    } catch (error) {
        console.log(error)
        next(error);
    }
}

module.exports = {
    TokenAuthorization,
    resetPasswordToken
};
