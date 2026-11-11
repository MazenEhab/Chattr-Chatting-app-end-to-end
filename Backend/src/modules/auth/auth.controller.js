const { sign } = require("crypto");
const path = require("path");
const authService = require(path.join(__dirname, "auth.service.js"));

const signUp = async (req, res, next) => {
    try {
        const user = await authService.signUp(req.body);
        
        return res.status(201).json({
            status: "success",
            message: "Account created successfully",
            data: {
                user,
            },
        })
    } catch (error) {
        next(error);
    }
}

const signIn = async (req, res, next) => {
    try { 
        console.log('1')
        const {user, accessToken} = await authService.signIn(req.body);

        res.cookie("chattr_access_token", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: parseInt(process.env.JWT_EXPIRES_IN) * 60 * 1000,
        })

        return res.status(201).json({
            status: "success",
            message: "Logged in successfully",
            data: {
                user,
            },
        })
        
    } catch (error) {
        next(error);
    }
}

module.exports = {
    signUp,
    signIn,
};