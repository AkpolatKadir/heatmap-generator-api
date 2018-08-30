const Joi = require("joi");
const schema = Joi.object().keys({
  imageUrl: Joi.string().required(),
  positions: Joi.array().items(
    Joi.object({
      x: Joi.number()
        .min(0)
        .max(1)
        .required(),
      y: Joi.number()
        .min(0)
        .max(1)
        .required(),
      width: Joi.number()
        .min(0)
        .max(1)
        .required(),
      height: Joi.number()
        .min(0)
        .max(1)
        .required()
    })
  )
});

module.exports = schema;
