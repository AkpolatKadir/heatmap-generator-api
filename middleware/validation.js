const validationSchema = require("../utils/validationSchema");

const Joi = require("joi");

const checkQueryParameters = (req, res) => {
  const { width, height, quality, format } = req.query;
  if (isEmpty(width)) {
    res.status(400).end("Please provide a width paramater");
    return false;
  } else if (!Number.isInteger(Number(width))) {
    res.status(400).end("Please provide a integer width paramater");
    return;
  }
  if (isEmpty(height)) {
    res.status(400).end("Please provide a height paramater");
    return false;
  } else if (!Number.isInteger(Number(height))) {
    res.status(400).end("Please provide a integer height paramater");
    return false;
  }
  if (isEmpty(quality)) {
    res.status(400).end("Please provide a quality paramater");
    return false;
  } else if (!Number.isInteger(Number(quality))) {
    res.status(400).end("Please provide a integer quality paramater");
    return false;
  }
  if (!isValidFormat(format)) {
    res.status(400).end("Please provide valid image format.");
    return false;
  }
  return true;
};

const isValidFormat = format => {
  return (
    format !== undefined &&
    (format === "PNG" || format === "JPEG" || format === "BMP")
  );
};

module.exports = (req, res, next) => {
  console.log("From validation middleware");
  // Check request data and send to the next middleware if passes.

  const isValid = Joi.validate(req.body, validationSchema); // Validate request format.

  if (isValid.error) {
    return res.status(400).end("Invalid request format.");
  }
  if (req.body.positions.length === 0) {
    return res.status(400).end("Positions must not be empty.");
  }
  if (!checkQueryParameters(req, res)) {
    logger.log("Invalid query parameters received.", "ERROR");
    return;
  }
  next();
};

const isEmpty = value => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
  );
};
