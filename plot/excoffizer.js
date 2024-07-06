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

  _S2P: function({x, y}) {
    // transform x,y from "sine space" to picture space
    // rotation ('theta'), scaling (sx,sy), translation (tx, ty)
    var c=Math.cos(this._params.theta),
        s=Math.sin(this._params.theta),
        sx=this._params.sx, sy=this._params.sy,
        tx=this._params.tx, ty=this._params.ty;
    return {
      x: x*sx*c - y*sy*s + tx*sx*c - ty*sy*s,
      y: x*sx*s + y*sy*c + tx*sx*s + ty*sy*c
    };
  },

  _P2S: function({x, y}) {
    // convert x,y from picture space to  "sine space"

    var c=Math.cos(-this._params.theta),
        s=Math.sin(-this._params.theta),
        sx = 1/this._params.sx, sy = 1/this._params.sy,
        tx = -this._params.tx, ty = -this._params.ty;

    return {
      x: x*sx*c - y*sx*s + tx,
      y: x*sy*s + y*sy*c + ty
    };
  },

  _sidePoints: function(p1, p2, r) {
    const L=Math.sqrt((p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y));

    const px=(p2.x-p1.x)*r/L;
    const py=(p2.y-p1.y)*r/L;
    return [
      { x: p1.x-py-(px/20), y: p1.y+px-(py/20) },
      { x: p1.x+py-(px/20), y: p1.y-px-(py/20) }
    ];
  },

  _poly2path: function(polygon) {
    if (polygon.length > 4) {
      const m = `M${polygon[0].x} ${polygon[0].y}`;
      polygon.shift();
      const l = polygon.map(point => ` L ${point.x} ${point.y}`).join(' ');

      return `<path d="${m} ${l}" stroke="black" stroke-width="1" fill="none" />`;
    }
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

    corner1 = this._P2S({x: 0, y: 0});
    corner2 = this._P2S({x: inputWidth, y: 0});
    corner3 = this._P2S({x: inputWidth, y: inputHeight});
    corner4 = this._P2S({x: 0, y: inputHeight});
    minX=Math.min(corner1.x,corner2.x,corner3.x,corner4.x);
    minY=Math.min(corner1.y,corner2.y,corner3.y,corner4.y);
    maxX=Math.max(corner1.x,corner2.x,corner3.x,corner4.x);
    maxY=Math.max(corner1.y,corner2.y,corner3.y,corner4.y);

    // from the min/max bounding box, we know which sines to draw

    stepx=1;
    stepy=lineHeight;

    for (y=minY-this._wiggleAmplitude ;y<maxY+this._wiggleAmplitude;y+=stepy) {

      const leftPoints = [];
      const rightPoints = [];
      const hatchPoints1 = [];
      const hatchPoints2 = [];

      let counter = 0;

      for (x=minX;x<maxX;x+=stepx) {
        imageP = this._S2P({x, y: y+this._wiggle(x)});

        // next point ahead
        // we need it to compute the side points as they should stick out from segment (rx1, ry1), (rx2, ry2)
        imageP2 = this._S2P({ x: x + stepx, y: y + this._wiggle(x+stepx)});

        if ((imageP.x >= 0 && imageP.x  < inputWidth && imageP.y  >= 0 && imageP.y  < inputHeight) || (imageP2.x >= 0 && imageP2.x < inputWidth && imageP2.y >= 0 && imageP2.y < inputHeight)) {

          const imageLevel = this.inputPixmap.brightnessAverageAt(Math.floor(imageP.x), Math.floor(imageP.y), this._blur)

          radius = lineHeight * ( 1 - imageLevel / 255) / 2 - 0.05;

          const [ sidePoint1, sidePoint2 ] = this._sidePoints(imageP, imageP2, radius);

          zoom=outputWidth/inputWidth;
          sidePoint1.x *= zoom;
          sidePoint1.y *= zoom;
          sidePoint2.x *= zoom;
          sidePoint2.y *= zoom;

          rightPoints.push({ x: sidePoint1.x, y: sidePoint1.y });
          leftPoints.push({ x: sidePoint2.x, y: sidePoint2.y });

          if (counter++ % 2) {
            hatchPoints1.push(sidePoint1);
            hatchPoints2.push(sidePoint2);
          } else {
            hatchPoints1.push(sidePoint2);
            hatchPoints2.push(sidePoint1);
          }


          // const polygonPoints = leftPoints.concat(rightPoints.reverse());

//          outputSvg += this._poly2path(leftPoints);
//          outputSvg += this._poly2path(rightPoints);
//          outputSvg += this._poly2path(hatchPoints1);
          outputSvg += this._poly2path(hatchPoints2); // broken

          if (this.debug) {
            outputSvg += `
              <circle cx="${sidePoints[0]}" cy="${sidePoints[1]}" r=".5" fill="blue" />
              <circle cx="${sidePoints[2]}" cy="${sidePoints[3]}" r=".5" fill="blue" />
            `;
          }
        }
      }
    }
    outputSvg += `</svg>`;
    return outputSvg;
  }
};
