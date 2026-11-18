const joi = require('joi');

const schema = {
    body: joi.object({
        otp: joi.string()
            .required()
            .trim()
            .length(6),

        email: joi.string()
            .required()
            .email()
            .trim()
            .lowercase()
            .max(50),

        purpose: joi.string()
            .required()
            .valid("email-verification", "password-reset"),
    })
}

module.exports = schema;