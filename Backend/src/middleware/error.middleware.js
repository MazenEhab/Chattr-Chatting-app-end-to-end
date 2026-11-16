const error = (err, req, res, next) => {
    const statusCode = err.statusCode || 401;
    
    res.status(401).json({
        status: "error",
        statusCode,
        message: err.message || "Internal Server Error"
    });
} 

module.exports = error;