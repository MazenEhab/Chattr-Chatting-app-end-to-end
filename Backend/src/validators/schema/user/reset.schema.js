const joi = require('joi');

const schema = {
    body: joi.object({
        password: joi.string()
            .required()
            .trim()
            .pattern(/[!@#$%^&*(),.?":{}|<>]/)
            .min(8)
            .max(30),

        token: joi.string()
            .required()
    })
}

module.exports = schema;