const reqKeys = ["body", "params", "query", "headers"];

const validateMiddleware = (schema) => {
    return (req, res, next) => {
        for (const key of reqKeys) {
            if (schema[key]) {
                const { error, value } = schema[key].validate(req[key]);

                if (error) {
                    return next(error);
                }

                if (key === "body" || key === "params") {
                    req[key] = value;
                }
            }
        }
        
        next();
    }
}

module.exports = validateMiddleware;