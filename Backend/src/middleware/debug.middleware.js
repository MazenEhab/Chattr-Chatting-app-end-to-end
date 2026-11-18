const debugMiddleware = (req, res, next) => {
    console.log("Request Method:", req.method);
    console.log("Request URL:", req.originalUrl);
    console.log("Request Headers:", req.headers);
    console.log("Request Body:", req.body);

    next();
}

module.exports = debugMiddleware;