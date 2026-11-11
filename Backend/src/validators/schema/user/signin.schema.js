const joi = require('joi');

const schema = { 
    body: joi.object({
        email: joi.string()
            .required()
            .trim()
            .lowercase()
            .email()
            .max(50),

        password: joi.string()
            .required()
            .trim()
            .min(6)
            .max(30)
    })
}

module.exports = schema;