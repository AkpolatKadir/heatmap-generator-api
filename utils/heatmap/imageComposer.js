var Jimp = require("jimp");

Load_Image = imageToLoad => {
  return new Promise((resolve, reject) => {
    let baseImage = Jimp.read(imageToLoad)
      .then(image => {
        resolve(image);
      })
      .catch(err => {
        console.error("Reading error: " + err);
        reject("Not a valid image to load.");
      });
  });
};

module.exports = {
  //Heatmap filter always be an Jimp image, so no need to load it with Jimp.
  composeImages: (originalImage, heatmapFilter, callback, options) => {
    Load_Image(originalImage)
      .then(image => {
        image.quality(Number(options.quality));
        image.resize(Number(options.width), Number(options.height)); // resize

        const compositedImage = image.composite(heatmapFilter, 0, 0);
        console.log("composited image is : ", compositedImage);
        callback(compositedImage);
        return;
      })
      .catch(err => console.log(err));
  }
};
