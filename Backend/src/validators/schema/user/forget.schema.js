const joi = require("joi");

const schema = {
    body: joi.object({
        email: joi.string()
            .required()
            .email()
            .trim()
            .lowercase()
            .max(254)
    })
}

module.exports = schema;