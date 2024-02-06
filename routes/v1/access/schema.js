const Joi = require('joi')

const schema = Object.freeze({
    signIn: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    })
});

exports.schema = schema;