const joi = require('joi');

const schema = {
    body: joi.object({
        email: joi.string()
            .email()
            .required()
            .trim()
            .lowercase()
            .max(254),

        purpose: joi.string()
            .valid("email-verification", "password-reset")
            .required()
    })
}

module.exports = schema;