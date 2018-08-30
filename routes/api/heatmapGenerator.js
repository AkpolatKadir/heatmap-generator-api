const heatmapCreator = require("../../utils/heatmap/heatmapCreator");
const fs = require("fs");
const express = require("express");
const router = express.Router();
const logger = require("../../utils/Logger");

router.post("/generate", function(req, res, next) {
  let roi_splitted = [];
  let roiVector = req.body.positions.map(position => {
    roi_splitted[0] = position.x;
    roi_splitted[1] = position.y;
    roi_splitted[2] = position.width;
    roi_splitted[3] = position.height;

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
          .composeImages(req.body.imageUrl, heatmapFilter, {
            width: req.query.width,
            height: req.query.height,
            quality: req.query.quality
          }) // There must be a fixed prefix for the images path.
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

module.exports = router;
