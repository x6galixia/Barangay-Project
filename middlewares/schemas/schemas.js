const Joi = require('joi');

const requestSchema = Joi.object({
    id: Joi.string().required(),
    purpose: Joi.string().required()
});

module.exports = {
    requestSchema
}