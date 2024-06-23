var Excoffizer = {

  // public

  excoffize: function(params) {
    "use strict";
    this._params = params;
    this.inputPixmap = new Pixmap(params.inputCanvas);
    this._wiggleFrequency = this._params.waviness/100.0;
    this._wiggleAmplitude = this._wiggleFrequency===0 ? 0 : 0.5/this._wiggleFrequency;
    this._params.theta*=Math.PI/180; // degrees to radians

    return this._excoffize();
  },

  // private
  _wiggle: function(x) {
    "use strict";
    return this._wiggleAmplitude*Math.sin(x*this._wiggleFrequency);
  },

  _S2P: function(x,y) {
    "use strict";
    // transform x,y from "sine space" to picture space
    // rotation ('theta'), scaling (sx,sy), translation (tx, ty)
    var c=Math.cos(this._params.theta),
        s=Math.sin(this._params.theta),
        sx=this._params.sx, sy=this._params.sy,
        tx=this._params.tx, ty=this._params.ty;
    return [x*sx*c - y*sy*s + tx*sx*c - ty*sy*s, x*sx*s + y*sy*c + tx*sx*s + ty*sy*c];
  },

  _P2S: function(x,y) {
    "use strict";
    // convert x,y from picture space to  "sine space"

    var c=Math.cos(-this._params.theta),
        s=Math.sin(-this._params.theta),
        sx = 1/this._params.sx, sy = 1/this._params.sy,
        tx = -this._params.tx, ty = -this._params.ty;

    return [ x*sx*c - y*sx*s + tx, x*sy*s + y*sy*c + ty ];
  },

  _sidePoints: function(x1,y1,x2,y2,r) {
    "use strict";
    var L=Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1)),
        px=(x2-x1)*r/L,
        py=(y2-y1)*r/L;

    return [x1-py-(px/20), y1+px-(py/20), x1+py-(px/20), y1-px-(py/20)];
  },

  _excoffize: function() {
    "use strict";
    var inputWidth   = this.inputPixmap.width,
        inputHeight  = this.inputPixmap.height,
        outputWidth  = 500,
        outputHeight = 500,
        opacity      = this._params.opacity,
        lineHeight   = this._params.line_height,
        corner1, corner2, corner3, corner4, minX, minY, maxX, maxY, stepx, stepy, x, y,
        imageP, rx, ry, imageP2, rx2, ry2, radius, radius2, sidePoints, sidePoints2, zoom;
    let outputSvg = `
    <svg width="500" height="500">
    `;

    // boundaries of the image in sine space
    corner1 = this._P2S(0,0);
    corner2 = this._P2S(inputWidth,0);
    corner3 = this._P2S(inputWidth,inputHeight);
    corner4 = this._P2S(0,inputHeight);
    minX=Math.min(corner1[0],corner2[0],corner3[0],corner4[0]);
    minY=Math.min(corner1[1],corner2[1],corner3[1],corner4[1]);
    maxX=Math.max(corner1[0],corner2[0],corner3[0],corner4[0]);
    maxY=Math.max(corner1[1],corner2[1],corner3[1],corner4[1]);

    // from the min/max bounding box, we know which sines to draw

    stepx=2;
    stepy=lineHeight;

    for (y=minY-this._wiggleAmplitude ;y<maxY+this._wiggleAmplitude;y+=stepy) {
      for (x=minX;x<maxX;x+=stepx) {
        imageP=this._S2P(x,y+this._wiggle(x));
        rx=imageP[0];
        ry=imageP[1];

        // rx2,ry2 is the point ahead, to which we draw a segment
        imageP2=this._S2P(x+stepx,y+this._wiggle(x+stepx));
        rx2=imageP2[0];
        ry2=imageP2[1];

        if ((rx  >= 0 && rx  < inputWidth && ry  >= 0 && ry  < inputHeight)||(rx2 >= 0 && rx2 < inputWidth && ry2 >= 0 && ry2 < inputHeight)) {

          radius=100/(10+this.inputPixmap.brightnessAverageAt(Math.floor(rx), Math.floor(ry), 1));
          radius2=100/(10+this.inputPixmap.brightnessAverageAt(Math.floor(rx2), Math.floor(ry2), 1));

          sidePoints=this._sidePoints(rx,ry,rx2,ry2,radius);
          sidePoints2=this._sidePoints(rx2,ry2,rx,ry,radius2);
          // scale everything to output resolution
          zoom=outputWidth/inputWidth;
          sidePoints[0]*=zoom;
          sidePoints[1]*=zoom;
          sidePoints[2]*=zoom;
          sidePoints[3]*=zoom;
          sidePoints2[0]*=zoom;
          sidePoints2[1]*=zoom;
          sidePoints2[2]*=zoom;
          sidePoints2[3]*=zoom;
          outputSvg += `<path d="M${sidePoints[0]},${sidePoints[1]} L${sidePoints[2]},${sidePoints[3]} L${sidePoints2[0]},${sidePoints2[1]} L${sidePoints2[2]},${sidePoints2[3]}" stroke="none" fill="black"/>\n`;

        }
      }
    }
    outputSvg += `</svg>`;
    return outputSvg;
  }
};
