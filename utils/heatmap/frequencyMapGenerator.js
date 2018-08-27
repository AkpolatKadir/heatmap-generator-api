var fs = require("fs");

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
class Rectangle {
  constructor(x, y, width, height) {
    this.point = new Point(parseInt(x), parseInt(y)); // x: topleft point of the rect, y:top left point of the rect
    this.width = parseInt(width);
    this.height = parseInt(height);
    this.initializePoints();
  }

  initializePoints() {
    this.topLeft = new Point(this.point.x, this.point.y);
    this.bottomRight = new Point(
      this.point.x + this.width,
      this.point.y + this.height
    );
  }

  setTopLeft(x, y) {
    this.topLeft = new Point(x, y);
  }

  setBottomRight(x, y) {
    this.bottomRight = new Point(x, y);
  }
}
class FrequencyMapGenerator {
  constructor(widthParam, heigthParam) {
    this.frequencyMapSize = {
      width: widthParam,
      height: heigthParam,
      size: widthParam * heigthParam
    };
  }

  createFrequencyMap(roiVector) {
    // Array generation for bigger size arrays
    console.time("Array Generation");
    var frequencyMap = new Array(this.frequencyMapSize.size);
    for (let i = 0; i < frequencyMap.length; i++) {
      frequencyMap[i] = 0;
    }
    console.timeEnd("Array Generation");

    var roi_elem;
    roiVector.map((roi_elem, index, arr) => {
      var scaledRoi = this.scaleRoi(roi_elem);
      let row_len = scaledRoi.point.y + scaledRoi.height;
      let col_len = scaledRoi.point.x + scaledRoi.width;

      if (row_len > this.frequencyMapSize.height) {
        row_len = this.frequencyMapSize.height;
      }
      if (col_len > this.frequencyMapSize.width) {
        col_len = this.frequencyMapSize.width;
      }

      for (var row = scaledRoi.point.y; row != row_len; ++row) {
        var offset = row * this.frequencyMapSize.width;
        for (var col = scaledRoi.point.x; col != col_len; ++col) {
          ++frequencyMap[offset + col];
        }
      }
    });

    return frequencyMap;
  }

  scaleRoi(roi) {
    // Roi is a normalized data.
    // Roi format is : x_top_left, y_top_left, roi_width, roi_heigth.

    var scaled_roi = new Rectangle(
      roi[0] * this.frequencyMapSize.width,
      roi[1] * this.frequencyMapSize.height,
      roi[2] * this.frequencyMapSize.width,
      roi[3] * this.frequencyMapSize.height
    );

    if (scaled_roi.topLeft.x < 0) {
      scaled_roi.setTopLeft(0, scaled_roi.topLeft.y);
    }
    if (scaled_roi.topLeft.y < 0) {
      scaled_roi.setTopLeft(scaled_roi.topLeft.x, 0);
    }
    if (scaled_roi.bottomRight.x >= this.frequencyMapSize.width) {
      scaled_roi.setBottomRight(
        this.frequencyMapSize.width - 1,
        scaled_roi.bottomRight.y
      );
    }
    if (scaled_roi.bottomRight.y >= this.frequencyMapSize.height) {
      scaled_roi.setBottomRight(
        scaled_roi.bottomRight.x,
        this.frequencyMapSize.height - 1
      );
    }

    return scaled_roi;
  }

  getFrequencyMapSize() {
    return this.frequencyMapSize;
  }
}

module.exports = FrequencyMapGenerator;
