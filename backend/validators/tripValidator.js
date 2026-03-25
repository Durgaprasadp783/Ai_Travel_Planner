const Joi = require("joi");

const tripSchema = Joi.object({
    destination: Joi.string()
        .min(2)
        .max(50)
        .required(),

    days: Joi.number()
        .integer()
        .min(1)
        .max(15)
        .required(),

    budget: Joi.number()
        .min(100)
        .max(1000000)
        .required(),

    mode: Joi.string()
        .valid('solo', 'couples', 'friends', 'family', 'business')
        .lowercase()
        .required(),

    origin: Joi.string()
        .allow('', null),

    interests: Joi.array()
        .items(Joi.string())
        .optional(),

    startDate: Joi.date()
        .required(),

    endDate: Joi.date()
        .required(),

    peopleCount: Joi.number()
        .min(1)
        .max(10)
        .required()
});

module.exports = {
    tripSchema
};