const path = require("path");
const jwt = require(path.join(__dirname, "..", "util", "jwt.util.js"));

const TokenAuthorization = async (req, res, next) => {
    try {
        const token = req.cookies?.chattr_access_token;
        const {user, decoded} = await jwt.verifyToken(token)

        req.decoded = decoded
        req.token = token
        req.user = user
        next();
    } catch (error) {
        console.error("Authorization error:");
        next(error);
    }
}

module.exports = {
    TokenAuthorization
};
