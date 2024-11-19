const Joi = require('joi');

const requestSchema = Joi.object({
    id: Joi.string().required(),
    purpose: Joi.string().required()
});

const residentSchema = Joi.object({
    last_name: Joi.string().optional(),
    first_name: Joi.string().optional(),
    middle_name: Joi.string().optional(),
    gender: Joi.string().optional(),
    birthdate: Joi.date().optional(),
    age: Joi.number().integer().optional(),
    educAttainment: Joi.string().optional(),
    occupation: Joi.string().optional(),
    sectors: Joi.number().integer().optional(), // not availble for non-residents
    placeOfBirth: Joi.string().optional(),
    grossIncome: Joi.number().integer().optional(),
    senior: Joi.boolean().valid(true, false).optional(), // not availble for non-residents
    soloParent: Joi.boolean().valid(true, false).optional(), // not availble for non-residents
    pwd: Joi.boolean().valid(true, false).optional(), // not availble for non-residents
    youth: Joi.boolean().valid(true, false).optional(), // not availble for non-residents
    is4ps: Joi.boolean().valid(true, false).optional(), // not availble for non-residents
    civilStatus: Joi.string().optional(),
    address: Joi.object({
        purok: Joi.string().optional(),
        street: Joi.string().optional(),
        barangay: Joi.string().optional(),
        city: Joi.string().optional(),
        province: Joi.string().optional(),
    }),
    nonResidentAddress: Joi.object({ // non-residents only
        purok1: Joi.string().optional(),
        street1: Joi.string().optional(),
        barangay1: Joi.string().optional(),
        city1: Joi.string().optional(),
        province1: Joi.string().optional(),
    }),
    boardingHouse: Joi.string().optional(), // non-residents only not applicable for residents
    landlord: Joi.string().optional(), // non-residents only not applicable for residents
    emergencyLastName: Joi.string().optional(),
    emergencyFirstName: Joi.string().optional(),
    emergencyMiddleName: Joi.string().optional(),
    emergencyContactNumber: Joi.string().optional(),
    emergencyPurok: Joi.string().optional(),
    emergencyStreet: Joi.string().optional(),
    emergencyBarangay: Joi.string().optional(),
    emergencyCity: Joi.string().optional(),
    emergencyProvince: Joi.string().optional()
});

module.exports = {
    requestSchema,
    residentSchema
}