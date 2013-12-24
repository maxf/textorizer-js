var Pixmap,
    Textorizer = [];

Textorizer[0] = {
  textorize: function(params) {
    "use strict";
    this._params = params;
    this.inputPixmap = new Pixmap(params.inputCanvas);
    this._textorize();
  },


  //==== private ====

  Sx: [[-1,0,1], [-2,0,2], [-1,0,1]],
  Sy: [[-1,-2,-1], [0,0,0], [1,2,1]],

  _textorize: function() {
    "use strict";
    var x,y,tx,ty,
        dx,dy,dmag2,vnear,b,textScale,dir,r,
        h,i,j,
        words = this._params.text.split('\n'),
        word,
        outputCanvas = this._params.outputCanvas,
        nbStrokes    = this._params.nb_strings,
        threshold    = this._params.threshold,
        minFontScale = this._params.font_size_min,
        maxFontScale = this._params.font_size_max,
        font         = this._params.font,
        opacity      = this._params.opacity,
        inputWidth   = this.inputPixmap.width,
        inputHeight  = this.inputPixmap.height,
        outputWidth  = outputCanvas.width,
        outputHeight = outputCanvas.height,
        outputCtx    = outputCanvas.getContext('2d');

    // reset the context shadow
    outputCtx.shadowColour="black";
    outputCtx.shadowOffsetX=0;
    outputCtx.shadowOffsetY=0;
    outputCtx.shadowBlur=0;


    // clear output canvas
    outputCtx.fillStyle = "white";
    outputCtx.fillRect(0,0,outputWidth,outputHeight);

    // and add in the initial picture with transparency
    outputCtx.globalAlpha = opacity/256;
    outputCtx.drawImage(this.inputPixmap.canvas,0,0,outputWidth,outputHeight);
    outputCtx.globalAlpha = 1;

    // set the text shadow
    outputCtx.shadowColour="black";
    outputCtx.shadowOffsetX=1;
    outputCtx.shadowOffsetY=1;
    outputCtx.shadowBlur=1;

    for (h=nbStrokes-1;h>=0; h--) {
      x=Math.floor(2+Math.random()*(inputWidth-4));
      y=Math.floor(2+Math.random()*(inputHeight-4));

      dx=dy=0;

      for (i=0; i<3; i++) {
        for (j=0; j<3; j++) {
          vnear = this.inputPixmap.colourAt(x+i-1,y+j-1).brightness();
          dx += this.Sx[j][i] * vnear;
          dy += this.Sy[j][i] * vnear;
        }
      }
      dx/=8;
      dy/=8;

      dmag2=dx*dx + dy*dy;

      if (dmag2 > threshold) {
        b = 2*(inputWidth + inputHeight) / 5000.0;
        textScale=minFontScale+Math.sqrt(dmag2)*maxFontScale/80;
        if (dx===0) {
          dir=Math.PI/2;
        }
        else if (dx > 0) {
          dir=Math.atan2(dy,dx);
        }
        else {
          if (dy===0) {
            dir=0;
          } else {
            if (dy > 0) {
              dir=Math.atan2(-dx,dy)+Math.PI/2;
            } else {
              dir=Math.atan2(dy,dx)+Math.PI;
            }
          }
        }

        outputCtx.font = textScale+"px "+font;
        outputCtx.save();

        tx=Math.round(x*outputWidth/inputWidth);
        ty=Math.round(y*outputHeight/inputHeight);
        r=dir+Math.PI/2;

        word=words[h % words.length];

        outputCtx.translate(tx,ty);
        outputCtx.rotate(r);
        outputCtx.fillStyle = this.inputPixmap.colourAt(x,y).toString();
        outputCtx.fillText(word, 0,0);

        outputCtx.restore();

      }
    }
  }
};


//#################################################################

Textorizer[1] = {
  textorize: function(params) {
    "use strict";
    this._params = params;
    this.inputPixmap = new Pixmap(params.inputCanvas);
    this._textorize();
  },

  _textorize: function() {
    "use strict";
    var text = this._params.text+" ",
        nbletters = text.length,
        letterWidth,
        ti=0,
        x,y,
        rx, scale, c, pixel,
        outputCanvas = this._params.outputCanvas,
        inputCanvas  = this._params.inputCanvas,
        font         = this._params.font,
        opacity      = this._params.opacity,
        kerning      = this._params.kerning,
        lineHeight   = this._params.line_height,
        fontScale    = this._params.font_scale,
        fontSize     = this._params.text_size,

        inputWidth   = inputCanvas.width,
        inputHeight  = inputCanvas.height,
        outputWidth  = outputCanvas.width,
        outputHeight = outputCanvas.height,
        outputCtx    = outputCanvas.getContext('2d'),

        imgScaleFactorX = inputWidth/outputWidth,
        imgScaleFactorY = inputHeight/outputHeight;


    // reset values
    outputCtx.shadowColour="black";
    outputCtx.shadowOffsetX=0;
    outputCtx.shadowOffsetY=0;
    outputCtx.shadowBlur=0;


    // clear output canvas
    outputCtx.fillStyle = "white";
    outputCtx.fillRect(0,0,outputWidth,outputHeight);

    // and add in the initial picture with transparency
    outputCtx.globalAlpha = opacity/256;
    outputCtx.drawImage(this.inputPixmap.canvas,0,0,outputWidth,outputHeight);
    outputCtx.globalAlpha = 1;

    // text shadow
    outputCtx.shadowColour="black";
    outputCtx.shadowOffsetX=1;
    outputCtx.shadowOffsetY=1;
    outputCtx.shadowBlur=1;

    for (y=0; y < outputHeight; y+=fontSize*lineHeight) {
      rx=1;

      // skip any white space at the beginning of the line
      while (text[ti%nbletters] === ' ') {
        ti++;
      }

      while (rx < outputWidth) {

        x=Math.floor(rx)-1;

        pixel = this.inputPixmap.colourAverageAt(Math.floor(x*imgScaleFactorX),
                                                Math.floor(y*imgScaleFactorY),
                                                Math.floor(fontSize*fontScale/6));
//                                                1);

//        if (!pixel.isWhite()) {
        c=text[ti%nbletters];
        letterWidth = outputCtx.measureText(c).width;

        if (c !== " ") {
          scale = 2 - pixel.brightness()/255.0;

          /*
           if (T2ColourAdjustment>0) {
           var saturation = saturation(pixel);
           var newSaturation = (saturation+T2ColourAdjustment)>255?255:(saturation+T2ColourAdjustment);
           colourMode(HSB,255);
           pixel = colour(hue(charColour), newSaturation, brightness(charColour));
           fill(pixel);
           colourMode(RGB,255);
           } else */

          outputCtx.fillStyle = pixel.toString();

          outputCtx.font = (fontSize * (1 + fontScale*Math.pow(scale-1,3))) + "px " + font;


            // empirically shift letter to the top-left, since sampled pixel is on its top-left corner
          outputCtx.fillText(c, x-fontSize/2, y+3+fontSize*lineHeight-fontSize/2);
          rx += letterWidth * (1+kerning);
        } else {
            // this is white space, reduce its width to make the text denser
          rx += letterWidth/1.5;
        }

        ti++; // next letter
//        } else {
          // advance one em
//          rx += outputCtx.measureText(" ").width * (1+kerning);
//        }
      }
    }
  }
};

//################################################################################
Textorizer[2] = {

  // public

  textorize: function(params) {
    "use strict";
    this._params = params;
    this.inputPixmap = new Pixmap(params.inputCanvas);
    this._wiggleFrequency = this._params.waviness/100.0;
    this._wiggleAmplitude = this._wiggleFrequency===0 ? 0 : 0.5/this._wiggleFrequency;
    this._params.theta*=Math.PI/180; // degrees to radians

    this._excoffize();
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
    var outputCanvas = this._params.outputCanvas,
        outputCtx    = outputCanvas.getContext('2d'),
        inputWidth   = this.inputPixmap.width,
        inputHeight  = this.inputPixmap.height,
        outputWidth  = outputCanvas.width,
        outputHeight = outputCanvas.height,
        opacity      = this._params.opacity,
        lineHeight   = this._params.line_height,
        corner1, corner2, corner3, corner4, minX, minY, maxX, maxY, stepx, stepy, x, y,
        imageP, rx, ry, imageP2, rx2, ry2, radius, radius2, sidePoints, sidePoints2, zoom;



    // reset values
    outputCtx.shadowColour="black";
    outputCtx.shadowOffsetX=0;
    outputCtx.shadowOffsetY=0;
    outputCtx.shadowBlur=0;


    // clear output canvas
    outputCtx.fillStyle = "white";
    outputCtx.fillRect(0,0,outputWidth,outputHeight);

    // and add in the initial picture with transparency
    outputCtx.globalAlpha = opacity/256;
    outputCtx.drawImage(this.inputPixmap.canvas,0,0,outputWidth,outputHeight);
    outputCtx.globalAlpha = 1;

    // ready to draw
    outputCtx.fillStyle='black';


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

        if ((rx  >= 0 && rx  < inputWidth && ry  >= 0 && ry  < inputHeight)||
            (rx2 >= 0 && rx2 < inputWidth && ry2 >= 0 && ry2 < inputHeight)) {

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


          outputCtx.beginPath();
          outputCtx.moveTo(sidePoints[0],sidePoints[1]);
          outputCtx.lineTo(sidePoints[2],sidePoints[3]);
          outputCtx.lineTo(sidePoints2[0],sidePoints2[1]);
          outputCtx.lineTo(sidePoints2[2],sidePoints2[3]);
          outputCtx.fill();
        }
      }
    }
  }
};

//#################################################################

