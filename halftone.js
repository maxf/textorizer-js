var Pixmap, HalfTone, CymkaColour;

HalfTone = (function () {
  "use strict";
  var _render;

  // ===== private =====
  _render = function(params) {
    var text = params.text+" ",
        nbletters = text.length,
        letterWidth,
        ti=0,
        x,y,
        rx, scale, c, pixel,
        outputCanvas = params.outputCanvas,
        inputCanvas  = params.inputCanvas,
        font         = params.font,
        opacity      = params.opacity,
        kerning      = params.kerning,
        lineHeight   = params.line_height,
        fontScale    = params.font_scale,
        fontSize     = params.text_size,

        inputWidth   = inputCanvas.width,
        inputHeight  = inputCanvas.height,
        outputWidth  = outputCanvas.width,
        outputHeight = outputCanvas.height,
        outputCtx    = outputCanvas.getContext('2d'),

        imgScaleFactorX = inputWidth/outputWidth,
        imgScaleFactorY = inputHeight/outputHeight,

        inputPixmap = new Pixmap(params.inputCanvas);


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
    outputCtx.drawImage(inputPixmap.canvas,0,0,outputWidth,outputHeight);
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

        pixel = inputPixmap.colourAverageAt(Math.floor(x*imgScaleFactorX),
                                           Math.floor(y*imgScaleFactorY),
                                           Math.floor(fontSize*fontScale/6));

        

//        if (!pixel.isWhite()) {
        c=text[ti%nbletters];
        letterWidth = outputCtx.measureText(c).width;

        if (c !== " ") {
          scale = 2 - pixel.brightness()/255.0;

          outputCtx.font = (fontSize * (1 + fontScale*Math.pow(scale-1,3))) + "px " + font;

//          outputCtx.fillStyle = pixel.toString();

          var offset = 5;

          outputCtx.fillStyle = new CymkaColour(pixel.toCymka().c,0,0,0,1).toRgba().toString();
          outputCtx.fillText(c, x-fontSize/2+offset, y+3+fontSize*lineHeight-fontSize/2);

          outputCtx.fillStyle = new CymkaColour(0,pixel.toCymka().y,0,0,1).toRgba().toString();
          outputCtx.fillText(c, x-fontSize/2-offset, y+3+fontSize*lineHeight-fontSize/2);

          outputCtx.fillStyle = new CymkaColour(0,0,pixel.toCymka().m,0,1).toRgba().toString();
          outputCtx.fillText(c, x-fontSize/2, y+3+fontSize*lineHeight-fontSize/2+offset);

          outputCtx.fillStyle = new CymkaColour(0,0,0,pixel.toCymka().k,1).toRgba().toString();
          outputCtx.fillText(c, x-fontSize/2, y+3+fontSize*lineHeight-fontSize/2-offset);


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
  };

  return function() {
    this.render = _render;
  };


}());
