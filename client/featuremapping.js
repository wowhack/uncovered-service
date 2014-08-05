var quantize = require('./quantize');
var fft = require('./fft');

// Returns an array of arrays that for each pixel gives how much the
// pixel contributes to that color in a 16 color palettized
// version of the image
function extractPalettized(pixels, width, height) {
  var maxColors = 16;
  var cmap = quantize.quantize(pixels, maxColors);
  var palette = cmap.palette();
  var counts = {};
  for (var i = 0; i < pixels.length; i += 4) {
    var pixel = cmap.map([pixels[i], pixels[i+1], pixels[i+2]]);
    counts[pixel] = counts[pixel] ? counts[pixel] + 1 : 1;
  }
  var output = [
    new Float64Array(pixels.length / 4),
    new Float64Array(pixels.length / 4),
    new Float64Array(pixels.length / 4),
    new Float64Array(pixels.length / 4),
    new Float64Array(pixels.length / 4),
    new Float64Array(pixels.length / 4),
    new Float64Array(pixels.length / 4),
    new Float64Array(pixels.length / 4),
    new Float64Array(pixels.length / 4),
    new Float64Array(pixels.length / 4),
    new Float64Array(pixels.length / 4),
    new Float64Array(pixels.length / 4),
    new Float64Array(pixels.length / 4),
    new Float64Array(pixels.length / 4),
    new Float64Array(pixels.length / 4)
  ];
  var ix = 0;
  for (var j = 0; j < pixels.length; j += 4) {
    var pixel = cmap.map([pixels[j], pixels[j+1], pixels[j+2]]);
    var pix = palette.indexOf(pixel);
    output[pix][ix++] = 1.0 / counts[pixel];
  };
  return output;
}

// Returns an array of arrays that for each pixel gives how much
// the pixel contributes to that frequency band
function extractFrequencies(pixels, width, height) {
  var xblocks = Math.floor(width / 8);
  var yblocks = Math.floor(height / 8);
  var numblocks = xblocks * yblocks;
  var blocks = [
    new Float64Array(yblocks * xblocks),
    new Float64Array(yblocks * xblocks),
    new Float64Array(yblocks * xblocks),
    new Float64Array(yblocks * xblocks),
    new Float64Array(yblocks * xblocks),
    new Float64Array(yblocks * xblocks),
    new Float64Array(yblocks * xblocks),
    new Float64Array(yblocks * xblocks),
    new Float64Array(yblocks * xblocks),
    new Float64Array(yblocks * xblocks),
    new Float64Array(yblocks * xblocks),
    new Float64Array(yblocks * xblocks)
  ];
  for (var by = 0; by < yblocks; ++by) {
    for (var bx = 0; bx < xblocks; ++bx) {
      var re = [];
      var im = [];
      for (var y = 0; y < 8; y++) {
        var i = (y + by * 8) * width;
        var outi = y * 8;
        for (var x = 0; x < 8; x++) {
          var start = (i << 2) + ((x + bx * 8) << 2);
          if (start < pixels.length) {
            var R = pixels[start];
            var G = pixels[start + 1];
            var B = pixels[start + 2];
            var luminance = (0.2126*R + 0.7152*G + 0.0722*B);
            re[outi + x] = luminance;
          } else {
            re[outi + x] = 0.0;
          }
          im[outi + x] = 0.0;
        }
      }
      fft.init(8);
      fft.fft2d(re, im);
      var powrad = {};
      var totpow = 0.0;
      for (var py = 0; py < 8; py++) {
        var i = py * 8;
        for (var px = 0; px < 8; px++) {
          var pow = Math.sqrt(re[i + px] * re[i + px] + im[i + px] * im[i + px]);
          totpow += pow;
          var radius = Math.round(Math.sqrt(px*px + py*py));
          if (radius in powrad) {
            var val = powrad[radius];
            powrad[radius] = {pow: val.pow + pow, cnt: val.cnt + 1};
          } else {
            powrad[radius] = {pow: pow, cnt: 1};
          }
        }
      }
      for (k in powrad) {
        var blk = blocks[k];
        var val = totpow > 0 ? (powrad[k].pow / powrad[k].cnt) / totpow : 0.0;
        blk[by * xblocks + bx] = val;
      }
    }
  }
  var images = [];
  for (k in blocks) {
    var blk = blocks[k];
//    var sum = blk.reduce(function(pv, cv) { return pv + cv; }, 0);
    // reduce not working for typed arrays?
    var sum = 0.0;
    for (var x = 0; x < blk.length; ++x) {
      sum += blk[x];
    }
    var img = new Float64Array(pixels.length / 4);
    for (var iby = 0; iby < yblocks; ++iby) {
      for (var ibx = 0; ibx < xblocks; ++ibx) {
        var ix = iby * xblocks + ibx;
        var pxval = sum ? blk[ix] / (64 * sum) : 0.0;
        // Fill the 8x8 block
        var imxstart = ibx * 8;
        var imystart = iby * 8;
        for (var imy = 0; imy < 8; ++imy) {
          var yoffs = imystart + imy;
          if (yoffs >= height)
            break;
          for (var imx = 0; imx < 8; ++imx) {
            var xoffs = imxstart + imx;
            if (xoffs >= width)
              break;
            img[yoffs * width + xoffs] = pxval;
          }
        }
      }
    }
    images[k] = img;
  }
  return images;
}

module.exports = function() {
  return {
    extractPalettized: extractPalettized,
    extractFrequencies: extractFrequencies
  };
};