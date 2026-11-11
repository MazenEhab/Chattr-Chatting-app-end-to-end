const joi = require('joi');

const schema = {
    body: joi.object({
        username: joi.string()
            .required()
            .trim()
            .min(3)
            .max(30),

        email: joi.string()
            .required()
            .trim()
            .lowercase()
            .email()
            .max(50),

        password: joi.string()
            .required()
            .trim()
            .pattern(/[!@#$%^&*(),.?":{}|<>]/)
            .min(8)
            .max(30)
    })
}

module.exports = schema