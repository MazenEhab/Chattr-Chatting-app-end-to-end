module.exports = {
    authorizationMiddleware: require("./authorization.middleware.js"),
    validationMiddleware: require("./validation.middleware.js"),
    errorHandlerMiddleware: require("./error.middleware.js"),
    debugMiddleware: require("./debug.middleware.js")
}