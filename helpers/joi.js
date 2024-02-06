const Joi = require('joi');

const validator = (schema, source) => async (req, res, next) => {
    try {
        const { error } = await schema.validate(req[source]);
        if (!error) return next();

        const { details } = error;
        const message = details.map(i => i.message.replace(/['"]+/g, '')).join(',');
        return (next(res.status(400).json({
            message
        })));

    } catch (error) {
        return next(res.status(500).json({
            message: 'Internal Server Error'
        }));
    }
}

exports.validator = validator;