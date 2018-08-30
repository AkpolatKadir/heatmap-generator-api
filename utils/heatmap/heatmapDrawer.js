var Jimp = require("jimp");
class Color {
  constructor(red, blue, green) {
    this.red = parseInt(red);
    this.green = parseInt(green);
    this.blue = parseInt(blue);
  }
}

class HeatmapDrawer {
  constructor(threshold, frequencyMapSize) {
    this.colorStart = new Color(0, 0, 255);
    this.colorStop = new Color(255, 0, 0);
    this.binaryThreshold = threshold;
    this.frequencyMapSize = frequencyMapSize;
  }

  getValueBetweenTwoFixedColors(value) {
    var heatmapColor = new Color(0, 0, 0);
    const red =
      (this.colorStop.red - this.colorStart.red) * value + this.colorStart.red;

    const green =
      (this.colorStop.green - this.colorStart.green) * value +
      this.colorStart.green;

    const blue =
      (this.colorStop.blue - this.colorStart.blue) * value +
      this.colorStart.blue;

    let calculatedColor = new Color(red, green, blue);
    return calculatedColor;
  }

  drawHeatmap(frequencyMap, callback) {
    var self = this;
    var heatmapImage = new Jimp(
      this.frequencyMapSize.width,
      this.frequencyMapSize.height,
      function(err, image) {
        // this image is 640 x 480, every pixel is set to 0x00000000
        let maxValue = frequencyMap.reduce(function(a, b) {
          return Math.max(a, b);
        });
        for (let row = 0; row != self.frequencyMapSize.height; ++row) {
          const offset = row * self.frequencyMapSize.width;
          for (let col = 0; col != self.frequencyMapSize.width; ++col) {
            const index = offset + col;
            const value = frequencyMap[index] / maxValue;

            let calculatedColor = self.getValueBetweenTwoFixedColors(value);

            let hexValue = Jimp.rgbaToInt(
              calculatedColor.red,
              calculatedColor.green,
              calculatedColor.blue,
              100
            ); // Get it as 0xFFFFFFF
            image.setPixelColor(hexValue, col, row); // Set the pixel color.
          }
        }
        callback(image.opacity(0.8));
        return;
      }
    );
  }
}

module.exports = HeatmapDrawer;
