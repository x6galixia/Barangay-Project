const Joi = require('joi');

const requestSchema = Joi.object({
    id: Joi.string().required().optional().allow(null),
    purpose: Joi.string().required().optional().allow(null)
});

const residentSchema = Joi.object({
    last_name: Joi.string().optional().allow(null),
    first_name: Joi.string().optional().allow(null),
    middle_name: Joi.string().optional().allow(null),
    gender: Joi.string().optional().allow(null),
    birthdate: Joi.date().optional().allow(null),
    age: Joi.number().integer().optional().allow(null),
    educAttainment: Joi.string().optional().allow(null),
    occupation: Joi.string().optional().allow(null),
    sectors: Joi.number().integer().optional().allow(null), // not available for non-residents
    placeOfBirth: Joi.string().optional().allow(null),
    grossIncome: Joi.number().integer().optional().allow(null),
    senior: Joi.boolean().valid(true, false).optional().allow(null), // not available for non-residents
    soloParent: Joi.boolean().valid(true, false).optional().allow(null), // not available for non-residents
    pwd: Joi.boolean().valid(true, false).optional().allow(null), // not available for non-residents
    youth: Joi.boolean().valid(true, false).optional().allow(null), // not available for non-residents
    is4ps: Joi.boolean().valid(true, false).optional().allow(null), // not available for non-residents
    isOutOfSchoolYouth: Joi.boolean().valid(true, false).optional().allow(null), // not available for non-residents
    isSkm: Joi.boolean().valid(true, false).optional().allow(null), // not available for non-residents
    isKm: Joi.boolean().valid(true, false).optional().allow(null), // not available for non-residents
    civilStatus: Joi.string().optional().allow(null),
    purok: Joi.string().optional().allow(null),
    street: Joi.string().optional().allow(null),
    barangay: Joi.string().optional().allow(null),
    city: Joi.string().optional().allow(null),
    province: Joi.string().optional().allow(null),
    isResident: Joi.string().required(),
    nonResidentAddress: Joi.when('isResident', {
        is: "non-resident",
        then: Joi.object({
            purok1: Joi.string().optional().allow(null),
            street1: Joi.string().optional().allow(null),
            barangay1: Joi.string().optional().allow(null),
            city1: Joi.string().optional().allow(null),
            province1: Joi.string().optional().allow(null),
            boardingHouse: Joi.string().optional().allow(null),
            landlord: Joi.string().optional().allow(null),
        }).optional(),
        otherwise: Joi.forbidden(),
    }),
    emergencyLastName: Joi.string().optional().allow(null),
    emergencyFirstName: Joi.string().optional().allow(null),
    emergencyMiddleName: Joi.string().optional().allow(null),
    emergencyContactNumber: Joi.string().optional().allow(null),
    emergencyPurok: Joi.string().optional().allow(null),
    emergencyStreet: Joi.string().optional().allow(null),
    emergencyBarangay: Joi.string().optional().allow(null),
    emergencyCity: Joi.string().optional().allow(null),
    emergencyProvince: Joi.string().optional().allow(null)
});

const inventorySchema = Joi.object({
    iName: Joi.string().optional().allow(null),
    quantity: Joi.number().integer().optional().allow(null),
    iPrice: Joi.number().integer().optional().allow(null),
    dateAdded: Joi.date().optional().allow(null),
    categoryName: Joi.string().optional().allow(null),
    isFunctional: Joi.boolean().valid(true, false).optional().allow(null)
});

const archiveSchema = Joi.object({
    parties1: Joi.string().optional().allow(null),
    parties2: Joi.string().optional().allow(null),
    date: Joi.date().optional().allow(null),
    docType: Joi.string().optional().allow(null),
});

module.exports = {
    requestSchema,
    residentSchema,
    inventorySchema,
    archiveSchema
}