const Joi = require('joi');

const requestSchema = Joi.object({
    id: Joi.string().required().optional().allow(null),
    purpose: Joi.string().required().optional().allow(null),
    lastname: Joi.string().required().optional().allow(null),
    firstname: Joi.string().required().optional().allow(null),
    middlename: Joi.string().required().optional().allow(null),
    age: Joi.string().required().optional().allow(null),
    birthdate: Joi.date().required().optional().allow(null),
    birthplace: Joi.string().optional().allow(""),
    civilStatus: Joi.string().required().optional().allow(null),
    purok: Joi.string().optional().allow(""),
    grossIncome: Joi.number().optional().allow("")
});

const nonResidentAddressSchema = Joi.object({
    purok1: Joi.string().optional().allow(""),
    street1: Joi.string().optional().allow(""),
    barangay1: Joi.string().optional().allow(null),
    city1: Joi.string().optional().allow(null),
    province1: Joi.string().optional().allow(null),
    boardingHouse: Joi.string().optional().allow(null),
    landlord: Joi.string().optional().allow(null),
});

const residentSchema = Joi.object({
    globalId: Joi.string().optional().allow(""),
    last_name: Joi.string().optional().allow(null),
    first_name: Joi.string().optional().allow(null),
    middle_name: Joi.string().optional().allow(null),
    gender: Joi.string().optional().allow(null),
    birthdate: Joi.date().optional().allow(null),
    age: Joi.number().integer().optional().allow(null),
    educAttainment: Joi.string().optional().allow(null),
    occupation: Joi.string().optional().allow(null),
    sectors: Joi.number().integer().optional().allow(null),
    placeOfBirth: Joi.string().optional().allow(null),
    grossIncome: Joi.number().integer().optional().allow(null),
    senior: Joi.boolean().optional().allow(null),
    soloParent: Joi.boolean().optional().allow(null),
    pwd: Joi.boolean().optional().allow(null),
    youth: Joi.boolean().optional().allow(null),
    is4ps: Joi.boolean().optional().allow(null),
    isOutOfSchoolYouth: Joi.boolean().optional().allow(null),
    isSkm: Joi.boolean().optional().allow(null),
    isKm: Joi.boolean().optional().allow(null),
    civilStatus: Joi.string().optional().allow(null),
    purok: Joi.string().optional().allow(null),
    street: Joi.string().optional().allow(null),
    barangay: Joi.string().optional().allow(null),
    city: Joi.string().optional().allow(null),
    province: Joi.string().optional().allow(null),
    isResident: Joi.string().required(),
    isPaid: Joi.boolean().optional().allow(null),
    nonResidentAddress: Joi.when('isResident', {
        is: "non-resident",
        then: nonResidentAddressSchema.optional(),
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
    emergencyProvince: Joi.string().optional().allow(null),
});

const inventorySchema = Joi.object({
    itemId: Joi.number().integer().optional().allow(""),
    iName: Joi.string().optional().allow(null),
    quantity: Joi.number().integer().optional().allow(null),
    iPrice: Joi.number().integer().optional().allow(null),
    dateAdded: Joi.date().optional().allow(null),
    categoryName: Joi.string().optional().allow(null),
    isFunctional: Joi.boolean().valid(true, false).optional().allow(null)
});

const archiveSchema = Joi.object({
    doctypeId: Joi.number().integer().required(),  // Doctype ID remains as is
    
    documentData: Joi.object({
        itemId: Joi.number().integer().optional().allow(""),
        docType: Joi.string().valid('Lupon', 'Ordinance', 'Panumduman', 'Regularization Minutes', 'Resolution').required(),
        // Common fields
        date: Joi.date().optional().allow(null),
        image: Joi.string().optional().allow(null),

        // Panumduman
        contractingPersons: Joi.when('doctypeId', {
            is: 1,
            then: Joi.string().required(),
            otherwise: Joi.optional().allow(null)
        }),
        parties1: Joi.string().optional().allow(null),
        parties2: Joi.string().optional().allow(null),

        // Lupon
        luponCaseNumber: Joi.when('doctypeId', {
            is: 2,
            then: Joi.string().required(),
            otherwise: Joi.optional().allow(null)
        }),
        complainant: Joi.when('doctypeId', {
            is: 2,
            then: Joi.string().required(),
            otherwise: Joi.optional().allow(null)
        }),
        respondent: Joi.when('doctypeId', {
            is: 2,
            then: Joi.string().required(),
            otherwise: Joi.optional().allow(null)
        }),
        dateFiled: Joi.when('doctypeId', {
            is: 2,
            then: Joi.date().required(),
            otherwise: Joi.optional().allow(null)
        }),
        caseType: Joi.when('doctypeId', {
            is: 2,
            then: Joi.string().required(),
            otherwise: Joi.optional().allow(null)
        }),
        caseStage: Joi.string().optional().allow(""),

        // Ordinance
        ordinanceNumber: Joi.when('doctypeId', {
            is: 3,
            then: Joi.string().required(),
            otherwise: Joi.optional().allow(null)
        }),
        ordinanceTitle: Joi.when('doctypeId', {
            is: 3,
            then: Joi.string().required(),
            otherwise: Joi.optional().allow(null)
        }),
        authors: Joi.when('doctypeId', {
            is: 3,
            then: Joi.string().required(),
            otherwise: Joi.optional().allow(null)
        }),
        author1: Joi.string().optional().allow(null),
        author2: Joi.string().optional().allow(null),
        author3: Joi.string().optional().allow(null),

        coAuthor1: Joi.string().optional().allow(null),
        coAuthor2: Joi.string().optional().allow(null),
        coAuthor3: Joi.string().optional().allow(null),

        sponsor1: Joi.string().optional().allow(null),
        sponsor2: Joi.string().optional().allow(null),
        sponsor3: Joi.string().optional().allow(null),

        coAuthors: Joi.string().optional().allow(null),
        sponsors: Joi.string().optional().allow(null),
        dateApproved: Joi.when('doctypeId', {
            is: 3,
            then: Joi.date().required(),
            otherwise: Joi.optional().allow(null)
        }),

        // Resolution
        resolutionNumber: Joi.when('doctypeId', {
            is: 4,
            then: Joi.string().required(),
            otherwise: Joi.optional().allow(null)
        }),
        yearSeries: Joi.when('doctypeId', {
            is: 4,
            then: Joi.number().integer().required(),
            otherwise: Joi.optional().allow(null)
        }),

        // Regularization Minutes
        regulationNumber: Joi.when('doctypeId', {
            is: 5,
            then: Joi.string().required(),
            otherwise: Joi.optional().allow(null)
        })
    }).required()
});

const houseClassification = Joi.object({
    surveyPurok: Joi.string().optional().allow(null),
    houseNumber: Joi.number().integer().positive().allow(null),
    houseRepresentative: Joi.string().max(255).required(),
    numberOfFamilies: Joi.number().integer().positive().required(),
    isWithCr: Joi.boolean().default(false),
    isWith40mZone: Joi.boolean().default(false),
    isEnergized: Joi.boolean().default(false),
    housingMaterials: Joi.string()
        .valid('Concrete', 'Semi-Concrete', 'Wood')
        .allow(null),
    deepWell: Joi.string().max(255).optional().allow(""),
    waterPump: Joi.string().max(255).optional().allow(""),
    mineral: Joi.string().max(255).optional().allow("")
});

const barangayOfficialsSchema = Joi.object({
    punongBarangayLastName: Joi.string().max(255).required(),
    punongBarangayFirstName: Joi.string().max(255).required(),
    punongBarangayMiddleName: Joi.string().max(255).allow(null, ''),
    kagawad1LastName: Joi.string().max(255).required(),
    kagawad1FirstName: Joi.string().max(255).required(),
    kagawad1MiddleName: Joi.string().max(255).allow(null, ''),
    kagawad2LastName: Joi.string().max(255).required(),
    kagawad2FirstName: Joi.string().max(255).required(),
    kagawad2MiddleName: Joi.string().max(255).allow(null, ''),
    kagawad3LastName: Joi.string().max(255).required(),
    kagawad3FirstName: Joi.string().max(255).required(),
    kagawad3MiddleName: Joi.string().max(255).allow(null, ''),
    kagawad4LastName: Joi.string().max(255).required(),
    kagawad4FirstName: Joi.string().max(255).required(),
    kagawad4MiddleName: Joi.string().max(255).allow(null, ''),
    kagawad5LastName: Joi.string().max(255).required(),
    kagawad5FirstName: Joi.string().max(255).required(),
    kagawad5MiddleName: Joi.string().max(255).allow(null, ''),
    kagawad6LastName: Joi.string().max(255).required(),
    kagawad6FirstName: Joi.string().max(255).required(),
    kagawad6MiddleName: Joi.string().max(255).allow(null, ''),
    kagawad7LastName: Joi.string().max(255).required(),
    kagawad7FirstName: Joi.string().max(255).required(),
    kagawad7MiddleName: Joi.string().max(255).allow(null, ''),
    SKChairpersonLastName: Joi.string().max(255).required(),
    SKChairpersonFirstName: Joi.string().max(255).required(),
    SKChairpersonMiddleName: Joi.string().max(255).allow(null, ''),
    barangaySecretaryLastName: Joi.string().max(255).required(),
    barangaySecretaryFirstName: Joi.string().max(255).required(),
    barangaySecretaryMiddleName: Joi.string().max(255).allow(null, ''),
    barangayTreasurerLastName: Joi.string().max(255).required(),
    barangayTreasurerFirstName: Joi.string().max(255).required(),
    barangayTreasurerMiddleName: Joi.string().max(255).allow(null, '')
});

module.exports = {
    requestSchema,
    residentSchema,
    inventorySchema,
    archiveSchema,
    houseClassification,
    barangayOfficialsSchema,
    houseClassification
}