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

      return `<path d="${m} ${l}" stroke="black" stroke-width=".1" fill="none" />`;
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
        corner1, corner2, corner3, corner4, minX, minY, maxX, maxY, stepx, stepy,
        p, p2, radius, radius2, sidePoints, sidePoints2;
    let outputSvg = `
    <svg id="svg" width="${outputWidth}" height="${outputHeight}" viewBox="${-margin} ${-margin} ${outputWidth+2*margin} ${outputHeight+2*margin}">
    `;

    // boundaries of the image in sine space
    corner1 = this._P2S({x: 0, y: 0});
    corner2 = this._P2S({x: inputWidth, y: 0});
    corner3 = this._P2S({x: inputWidth, y: inputHeight});
    corner4 = this._P2S({x: 0, y: inputHeight});
    minX=Math.min(corner1.x,corner2.x,corner3.x,corner4.x);
    minY=Math.min(corner1.y,corner2.y,corner3.y,corner4.y);
    maxX=Math.max(corner1.x,corner2.x,corner3.x,corner4.x);
    maxY=Math.max(corner1.y,corner2.y,corner3.y,corner4.y);

    // from the min/max bounding box, we know which sines to draw


    // TODO:
    //  2. increase frequency (decrease stepx) with darkness


    stepx=1;
    stepy=lineHeight;

    for (let y = minY - this._wiggleAmplitude; y < maxY + this._wiggleAmplitude; y += stepy) {

      const hatchPoints2 = [];

      let counter = 0;

      for (let x = minX; x < maxX; x += stepx) {
        p = this._S2P({x, y: y+this._wiggle(x)});

        // next point ahead
        // we need it to compute the side points as they should stick out from segment [p1, p2]
        p2 = this._S2P({ x: x + stepx, y: y + this._wiggle(x+stepx)});

        if ((p.x >= 0 && p.x  < inputWidth && p.y  >= 0 && p.y  < inputHeight) || (p2.x >= 0 && p2.x < inputWidth && p2.y >= 0 && p2.y < inputHeight)) {

          const imageLevel = this.inputPixmap.brightnessAverageAt(Math.floor(p.x), Math.floor(p.y), this._blur)

          radius = lineHeight * ( 1 - imageLevel / 255) / 2 - 0.05;

          const zoom=outputWidth/inputWidth;

          if (radius < 0.3) {
            p.x *= zoom;
            p.y *= zoom;
            hatchPoints2.push(p);
          } else {
            const [ sidePoint1, sidePoint2 ] = this._sidePoints(p, p2, radius);
            sidePoint1.x *= zoom;
            sidePoint1.y *= zoom;
            sidePoint2.x *= zoom;
            sidePoint2.y *= zoom;

            if (counter++ % 2) {
              hatchPoints2.push(sidePoint2);
            } else {
              hatchPoints2.push(sidePoint1);
            }
          }
          
          outputSvg += this._poly2path(hatchPoints2); // broken

          if (this.debug) {
            outputSvg += `
              <circle cx="${hatchpoints2.x}" cy="${hatchpoints2.y}" r=".5" fill="blue" />
            `;
          }
        }
      }
    }
    outputSvg += `</svg>`;
    return outputSvg;
  }
};
