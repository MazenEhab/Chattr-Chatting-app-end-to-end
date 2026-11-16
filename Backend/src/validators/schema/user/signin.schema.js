const joi = require('joi');

const schema = { 
    body: joi.object({
        email: joi.string()
            .required()
            .email()
            .trim()
            .lowercase()
            .max(254),

        password: joi.string()
            .required()
            .trim()
            .min(6)
            .max(30)
    })
}

module.exports = schema;