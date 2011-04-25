var Color = function(r,g,b,a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};

Color.prototype.toString = function() {
  return "rgb("+Math.round(this.r)+","+Math.round(this.g)+","+Math.round(this.b)+")";
}

Color.prototype.isWhite = function() {
  return this.r+this.g+this.b >= 3*255;
}

Color.prototype.brightness = function() {
  return (this.r+this.g+this.b)/3;
}


//################################################################################

var Pixmap = function(canvas) {
  this.canvas = canvas;
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.context = this.canvas.getContext('2d');
  this._pixels = this.context.getImageData(0,0,this.canvas.width,this.canvas.height).data;
}

Pixmap.prototype.colorAt = function(x,y) {
  var index = 4*(x + this.width*y);
  return new Color( this._pixels[index],
                     this._pixels[index+1],
                     this._pixels[index+2],
                     this._pixels[index+3] );
};

//################################################################################

Pixmap.prototype.colorAverageAt = function( x, y, radius ) {
  var index;
  var resultR=0.0, resultG=0.0, resultB=0.0;
  var count=0;

  for (var i=-radius; i<=radius; i++) {
    for (var j=-radius; j<=radius; j++) {
      if (x+i>=0 && x+i<this.width && y+j>=0 && y+j<this.height) {
        count++;
        index = 4*((x+i)+this.width*(y+j));
        resultR+=this._pixels[index];
        resultG+=this._pixels[index+1];
        resultB+=this._pixels[index+2];
      }
    }
  }
  return new Color(resultR/count, resultG/count, resultB/count, 1);
};

Pixmap.prototype.brightnessAverageAt = function(x, y, radius) {
  return this.colorAverageAt(x,y,radius).brightness();
}

