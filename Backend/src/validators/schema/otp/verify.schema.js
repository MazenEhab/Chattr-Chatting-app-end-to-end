const joi = require('joi');

const schema = {
    body: joi.object({
        otp: joi.string()
            .required()
            .trim()
            .min(6)
            .max(6),

        email: joi.string()
            .required()
            .email()
            .trim()
            .lowercase()
            .max(50)
    })
}

module.exports = schema;