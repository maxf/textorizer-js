var Excoffizer = {

  // public

  excoffize: function(params, debug) {
    "use strict";
    this.debug = debug;
    this._params = params;
    this.inputPixmap = new Pixmap(params.inputCanvas);
    this._wiggleFrequency = this._params.waviness/100.0;
    this._wiggleAmplitude = this._wiggleFrequency===0 ? 0 : 0.5/this._wiggleFrequency;
    this._params.theta *= Math.PI/180; // degrees to radians
    this._blur = params.blur;

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
    const L=Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));

    const px=(x2-x1)*r/L;
    const py=(y2-y1)*r/L;
    const result = [x1-py-(px/20), y1+px-(py/20), x1+py-(px/20), y1-px-(py/20)];

    return result;
  },

  _excoffize: function() {
    "use strict";
    var inputWidth   = this.inputPixmap.width,
        inputHeight  = this.inputPixmap.height,
        outputWidth  = 500,
        outputHeight = 500*inputHeight/inputWidth,
        lineHeight   = this._params.line_height,
        margin       = this._params.margin,
        corner1, corner2, corner3, corner4, minX, minY, maxX, maxY, stepx, stepy, x, y,
        imageP, rx, ry, imageP2, rx2, ry2, radius, radius2, sidePoints, sidePoints2, zoom;
    let outputSvg = `
    <svg id="svg" width="${outputWidth}" height="${outputHeight}" viewBox="${-margin} ${-margin} ${outputWidth+2*margin} ${outputHeight+2*margin}">
    `;

    // boundaries of the image in sine space

    // TODO: make this independent of the input picture's resolution

    corner1 = this._P2S(0,0);
    corner2 = this._P2S(inputWidth,0);
    corner3 = this._P2S(inputWidth,inputHeight);
    corner4 = this._P2S(0,inputHeight);
    minX=Math.min(corner1[0],corner2[0],corner3[0],corner4[0]);
    minY=Math.min(corner1[1],corner2[1],corner3[1],corner4[1]);
    maxX=Math.max(corner1[0],corner2[0],corner3[0],corner4[0]);
    maxY=Math.max(corner1[1],corner2[1],corner3[1],corner4[1]);

    // from the min/max bounding box, we know which sines to draw

    stepx=1;
    stepy=lineHeight;

    for (y=minY-this._wiggleAmplitude ;y<maxY+this._wiggleAmplitude;y+=stepy) {

      const leftPoints = [];
      const rightPoints = [];

      for (x=minX;x<maxX;x+=stepx) {
        imageP=this._S2P(x,y+this._wiggle(x));
        rx=imageP[0];
        ry=imageP[1];

        // rx2,ry2 is the next point ahead
        // we need it to compute the side points as they should stick out from segment (rx1, ry1), (rx2, ry2)
        imageP2=this._S2P(x+stepx,y+this._wiggle(x+stepx));
        rx2=imageP2[0];
        ry2=imageP2[1];

        if (rx  >= 0 && rx  < inputWidth && ry  >= 0 && ry  < inputHeight) {

          radius=20/(40+this.inputPixmap.brightnessAverageAt(Math.floor(rx), Math.floor(ry), this._blur));

          sidePoints=this._sidePoints(rx,ry,rx2,ry2,radius);

          zoom=outputWidth/inputWidth;
          sidePoints[0]*=zoom;
          sidePoints[1]*=zoom;
          sidePoints[2]*=zoom;
          sidePoints[3]*=zoom;

          rightPoints.push({ x: sidePoints[0], y: sidePoints[1] });
          leftPoints.push({ x: sidePoints[2], y: sidePoints[3] });

          if (this.debug) {
            outputSvg += `
              <circle cx="${sidePoints[0]}" cy="${sidePoints[1]}" r=".5" fill="blue" />
              <circle cx="${sidePoints[2]}" cy="${sidePoints[3]}" r=".5" fill="blue" />
            `;
          }
        }
      }

      const polygonPoints = leftPoints.concat(rightPoints.reverse());

      if (polygonPoints.length > 4) {
        // outputSvg += `<path d="M${polygonPoints[0].x},${polygonPoints[0].y}"/>`;
        const m = `M${polygonPoints[0].x} ${polygonPoints[0].y}`;
        const q = `L${polygonPoints[1].x} ${polygonPoints[1].y} L${polygonPoints[2].x} ${polygonPoints[2].y}`;
        polygonPoints.shift();
        polygonPoints.shift();
        polygonPoints.shift();
        const l = polygonPoints.map(point => ` L ${point.x} ${point.y}`).join(' ');

        if (this.debug) {
          outputSvg += `<path d="${m} ${q} ${l}" stroke="black" stroke-width=".3" opacity="0.5" fill="#ddd"/>`;
        } else {
          outputSvg += `<path d="${m} ${q} ${l}" stroke="none" fill="black"/>`;
        }
      }
    }
    outputSvg += `</svg>`;
    return outputSvg;
  }
};
