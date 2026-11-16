const joi = require('joi');

const schema = {
    body: joi.object({
        username: joi.string()
            .required()
            .trim()
            .min(3)
            .max(30),

        nickname: joi.string()
            .trim()
            .max(20),
        
        photo: joi.string()
            .trim(),

        email: joi.string()
            .required()
            .email()
            .trim()
            .lowercase()
            .max(254),

        password: joi.string()
            .required()
            .trim()
            .pattern(/[!@#$%^&*(),.?":{}|<>]/)
            .min(8)
            .max(30)
    })
}

module.exports = schema