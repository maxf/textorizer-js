var CymkaColour, RgbaColour, Pixmap;

RgbaColour = (function () {
  "use strict";
  var _toCymka, _toString, _isWhite, _brightness;

  _toCymka = function () {
    var r = this.r/255, g = this.g/255, b = this.b/255, a = this.a/255,
        k = 1-Math.max(r,g,b),
        c = (1-r-k)/(1-k),
        m = (1-g-k)/(1-k),
        y = (1-b-k)/(1-k);
    return new CymkaColour(c,y,m,k,a);
  };

  _toString = function () {
    return "rgba("+Math.round(this.r)+","+Math.round(this.g)+","+Math.round(this.b)+","+Math.round(this.a)+")";
  };

  _isWhite = function () {
    return this.r+this.g+this.b >= 3*255;
  };

  _brightness = function () {
    return (this.r+this.g+this.b)/3;
  };

  return function(r,g,b,a) {
    this.r = r; // all components should be between 0 and 255
    this.g = g;
    this.b = b;
    this.a = a;
    this.toCymka = _toCymka;
    this.toString = _toString;
    this.brightness = _brightness;
    this.isWhite = _isWhite;
  };
}());

//################################################################################

CymkaColour = (function () { // all betweeo 0 and 1
  "use strict";

  var _toString, _toRgba;

  _toString = function () {
    return "cymka("+this.c+","+this.y+","+this.m+","+this.k+","+this.a+")";
  };

  _toRgba = function () {
    return new RgbaColour(255*(1-this.c)*(1-this.k), 255*(1-this.m)*(1-this.k), 255*(1-this.y)*(1-this.k), 255*this.a);
  };

  return function(c,y,m,k,a) {
    this.c = c; // all components should be between 0 and 1
    this.y = y;
    this.m = m;
    this.k = k;
    this.a = a;
    this.toRgba = _toRgba;
    this.toString = _toString;
  };

}());

//################################################################################

Pixmap = (function () {
  "use strict";
  var _colourAt, _colourAverageAt, _brightnessAverageAt;

  _colourAt = function(x,y) {
    var index = 4*(x + this.width*y);
    return new RgbaColour( this._pixels[index],
                           this._pixels[index+1],
                           this._pixels[index+2],
                           this._pixels[index+3] );
  };

  _colourAverageAt = function(x, y, radius) {
    var index, resultR=0.0, resultG=0.0, resultB=0.0, count=0, i, j;

    for (i=-radius; i<=radius; i++) {
      for (j=-radius; j<=radius; j++) {
        if (x+i>=0 && x+i<this.width && y+j>=0 && y+j<this.height) {
          count++;
          index = 4*((x+i)+this.width*(y+j));
          resultR+=this._pixels[index];
          resultG+=this._pixels[index+1];
          resultB+=this._pixels[index+2];
        }
      }
    }
    return new RgbaColour(resultR/count, resultG/count, resultB/count, 1);
  };


  _brightnessAverageAt = function(x, y, radius) {
    return this._colourAverageAt(x,y,radius).brightness();
  };


  return function(canvas) {
    this._context = canvas.getContext('2d');
    this._pixels = this._context.getImageData(0,0,canvas.width,canvas.height).data;

    this.colourAt = _colourAt;
    this.colourAverageAt = _colourAverageAt;

    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
  };

}());

//################################################################################
