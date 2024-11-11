const Joi = require('joi');

const requestSchema = Joi.object({
    id: Joi.number().integer().required(),
    dateAdded: Joi.date().required(),
    purpose: Joi.string().required()
});

module.exports = {
    requestSchema
}