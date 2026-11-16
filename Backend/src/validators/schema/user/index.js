const path = require("path");

module.exports = {
    signupSchema: require(path.join(__dirname, "signup.schema.js")),
    signinSchema: require(path.join(__dirname, "signin.schema.js")),
    updateSchema: require(path.join(__dirname, "update.schema.js")),
    resetPasswordSchema: require(path.join(__dirname, "resetpassword.schema.js"))
}