var heatmapDrawer = require("./heatmapDrawer");
var frequencyMapGenerator = require("./frequencyMapGenerator");
var imageComposer = require("./imageComposer");
var Jimp = require("jimp");

const createFrequencyMap = (roi_vector, options) => {
  return new Promise((resolve, reject) => {
    if (!roi_vector) {
      reject(
        "createFrequencyMap: Roi vector is not valid, can't create frequency map."
      );
    }
    let frequencyMap = new frequencyMapGenerator(options.width, options.height);
    let frequencyVector = frequencyMap.createFrequencyMap(roi_vector);

    // Bundle up the results and pass it to the next promise.
    let frequencyData = {
      frequencyMap: frequencyMap,
      frequencyVector: frequencyVector
    };
    resolve(frequencyData); // Send the created frequency map.
  });
};

// Create heatmap filter from frequency data.
const createHeatmap = frequencyData => {
  return new Promise((resolve, reject) => {
    if (!frequencyData.frequencyMap) {
      reject("Frequency Map is not valid. Can't create heatmap.");
    }
    let heatmapObject = new heatmapDrawer(
      0,
      frequencyData.frequencyMap.getFrequencyMapSize()
    );
    heatmapObject.drawHeatmap(frequencyData.frequencyVector, heatmapFilter => {
      // In this block, we are sure that we got the heatmap.
      resolve(heatmapFilter);
    });
  });
};

// Apply the filter.
const composeImages = (originalImage, heatmapFilter, options) => {
  return new Promise((resolve, reject) => {
    imageComposer.composeImages(
      originalImage,
      heatmapFilter,
      filteredImage => {
        console.log("Filtered image is : ", filteredImage);
        if (!filteredImage) {
          console.log(filteredImage);
          reject("Filtered image is not valid. Compose Error");
        }
        console.log("Image is filtered");
        resolve(filteredImage);
      },
      options
    );
  });
};

// Prepare base64 image to be send with response.
const getBufferedImage = (image, imageFormat) => {
  return new Promise((resolve, reject) => {
    if (!isValidFormat(imageFormat)) {
      reject("Invalid image format");
    }

    switch (imageFormat) {
      case "PNG":
        image.getBase64(Jimp.MIME_PNG, (err, resultImage) => {
          resolve(resultImage);
        }); // Send png image.
        break;

      case "JPEG":
        image.getBase64(Jimp.MIME_JPEG, (err, resultImage) => {
          resolve(resultImage); // Send png image.
        });
        break;

      case "BMP":
        image.getBase64(Jimp.MIME_BMP, (err, resultImage) => {
          resolve(resultImage); // Send png image.
        });
        break;

      default:
        console.log("Invalid format.");
        reject("Invalid Format.");
    }
  });
};

const isValidFormat = format => {
  return (
    format !== undefined &&
    (format === "PNG" || format === "JPEG" || format === "BMP")
  );
};

module.exports = {
  composeImages,
  createHeatmap,
  createFrequencyMap,
  getBufferedImage,
  isValidFormat
};
