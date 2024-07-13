class Color {
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  toString() {
    return "rgb("+Math.round(this.r)+","+Math.round(this.g)+","+Math.round(this.b)+")";
  }

  isWhite() {
    return this.r+this.g+this.b >= 3*255;
  }

  brightness() {
    return (this.r+this.g+this.b)/3;
  }
}


//################################################################################

class Pixmap {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.context = this.canvas.getContext('2d');
    this._pixels = this.context.getImageData(0,0,this.canvas.width,this.canvas.height).data;
  }

  colorAverageAt( x, y, radius ) {
    let index;
    let resultR=0.0, resultG=0.0, resultB=0.0;
    let count=0;

    for (let i = -radius; i <= radius; i++) {
      for (let j = -radius; j <= radius; j++) {
        if (x + i >= 0 && x + i < this.width && y + j >= 0 && y + j < this.height) {
          count++;
          index = 4*((x+i)+this.width*(y+j));
          if (this._pixels[index+3] === 0) {
            resultR += 255;
            resultG += 255;
            resultB += 255;
          } else {
            resultR+=this._pixels[index];
            resultG+=this._pixels[index+1];
            resultB+=this._pixels[index+2];
          }
        }
      }
    }
    if (count === 0) {
      return new Color(255, 255, 255, 1);
    } else {
      return new Color(resultR/count, resultG/count, resultB/count, 1);
    }
  }

  brightnessAverageAt(x, y, radius) {
    return this.colorAverageAt(x,y,radius).brightness();
  }
}
