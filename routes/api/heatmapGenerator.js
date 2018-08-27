const heatmapCreator = require("../../utils/heatmap/heatmapCreator");
const fs = require("fs");
const express = require("express");
const router = express.Router();
const validationSchema = require("../../utils/validationSchema");
const Joi = require("joi");
const logger = require("../../utils/Logger");

router.post("/generate", function(req, res, next) {
  const isValid = Joi.validate(req.body, validationSchema);

  if (req.body.positions.length === 0) {
    return res.status(400).end("Positions must not be empty.");
  }
  console.log(isValid);
  if (isValid.error) {
    return res.status(400).end("Invalid request format.");
  }

  if (!checkQueryParameters(req, res)) {
    logger.log("Invalid query parameters received.", "ERROR");
    return;
  }
  if (!isImageExists("cam_default_images/" + req.body.cameraName + ".jpg")) {
    //Check if camera image is saved before.
    logger.log("Camera name does not exist.", "ERROR");
    return res.status(404).end("Camera name does not exist.");
  }

  let roi_splitted = [];
  let roiVector = req.body.positions.map((val, index, arr) => {
    roi_splitted[0] = val.x;
    roi_splitted[1] = val.y;
    roi_splitted[2] = val.width;
    roi_splitted[3] = val.height;

    let roi_element = roi_splitted;
    return roi_element;
  });

  logger.log(
    `Camera name: ${req.body.cameraName}, Position data length: ${
      roiVector.length
    }.`,
    "INFO"
  );

  var heatmapPromise = heatmapCreator.createFrequencyMap(roiVector, {
    width: Number(req.query.width),
    height: Number(req.query.height)
  });

  heatmapPromise
    .then(frequencyData => {
      heatmapCreator.createHeatmap(frequencyData).then(heatmapFilter => {
        heatmapCreator
          .composeImages(
            "cam_default_images/" + req.body.cameraName + ".jpg",
            heatmapFilter,
            {
              width: req.query.width,
              height: req.query.height,
              quality: req.query.quality
            }
          ) // There must be a fixed prefix for the images path.
          .then(filteredImage => {
            heatmapCreator
              .getBufferedImage(filteredImage, req.query.format)
              .then(base64Image => {
                res.json({ heatMap: base64Image });
              });
          });
      });
    })
    .catch(err => {
      logger.log(`Exception Thrown: ${err}.`, "ERROR");

      res.status(500).send(err);
    });
});

const checkQueryParameters = (req, res) => {
  if (isEmpty(req.query.width)) {
    res.status(400).end("Please provide a width paramater");
    return false;
  } else if (!Number.isInteger(Number(req.query.width))) {
    res.status(400).end("Please provide a integer width paramater");
    return;
  }
  if (isEmpty(req.query.height)) {
    res.status(400).end("Please provide a height paramater");
    return false;
  } else if (!Number.isInteger(Number(req.query.height))) {
    res.status(400).end("Please provide a integer height paramater");
    return false;
  }
  if (isEmpty(req.query.quality)) {
    res.status(400).end("Please provide a quality paramater");
    return false;
  } else if (!Number.isInteger(Number(req.query.quality))) {
    res.status(400).end("Please provide a integer quality paramater");
    return false;
  }
  if (!heatmapCreator.isValidFormat(req.query.format)) {
    res.status(400).end("Please provide valid image format.");
    return false;
  }
  return true;
};
const isEmpty = value => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
  );
};

const isImageExists = imagePath => {
  return fs.existsSync(imagePath);
};

module.exports = router;
