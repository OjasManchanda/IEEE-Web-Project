const Joi = require("joi");

module.exports.ticketSchema = Joi.object({
  ticket: Joi.object({
    eventName: Joi.string().required(),
    eventDate: Joi.date().required(),
    pricePerTicket: Joi.number().required().min(1),
    ticketsAvailable: Joi.number().required().min(1),
    location: Joi.string().required(),
    eventCategory: Joi.string().valid(
      "Concert",
      "Sports",
      "Theatre",
      "Festival",
      "Comedy",
      "Other"
    ),
    description: Joi.string().allow(""),
  }).required(),
});