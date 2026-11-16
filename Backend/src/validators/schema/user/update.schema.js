const joi = require("joi");

const schema = {
    body: joi.object({
        nickname: joi.string()
            .trim()
            .max(20),

        photo: joi.string()
            .trim()
            .allow(""),

        lastSeen: joi.boolean(),

        receipts: joi.boolean(),
    })
}

module.exports = schema