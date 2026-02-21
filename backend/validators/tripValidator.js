const Joi = require("joi");

const tripSchema = Joi.object({
    destination: Joi.string().min(2).max(50).required(),

    days: Joi.number()
        .integer()
        .min(1)
        .max(30)
        .required(),

    budget: Joi.number()
        .min(100)
        .max(1000000)
        .required()
});

module.exports = {
    tripSchema
};
