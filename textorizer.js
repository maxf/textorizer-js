var Textorizer = [];



Textorizer[0] = new function() {

  this.textorize = function(params, openImageSeparately) {
    this._params = params;
    this.inputPixmap = new Pixmap(params['inputCanvas']);
    this._textorize();
    if (openImageSeparately)
      window.open(this._params['outputCanvas'].toDataURL());
  };

  //==== private ====


  var Sx = [[-1,0,1], [-2,0,2], [-1,0,1]];
  var Sy = [[-1,-2,-1], [0,0,0], [1,2,1]];

  this._textorize = function() {
    var x,y,tx,ty;
    var dx,dy,dmag2,vnear,b,textScale,dir,r;
    var v,p;
    var words = this._params['text'].split('\n');
    var word;
    var outputCanvas = this._params['outputCanvas'];
    var nbStrokes    = this._params['nb_strings'];
    var threshold    = this._params['threshold'];
    var minFontScale = this._params['font_size_min'];
    var maxFontScale = this._params['font_size_max'];
    var font         = this._params['font'];
    var opacity      = this._params['opacity'];
    var inputURL     = this._params['input_url'];

    var inputWidth   = this.inputPixmap.width;
    var inputHeight  = this.inputPixmap.height;

    var outputWidth  = outputCanvas.width;
    var outputHeight = outputCanvas.height;
    var outputCtx    = outputCanvas.getContext('2d');

    // reset the context shadow
    outputCtx.shadowColor="black";
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
    outputCtx.shadowColor="black";
    outputCtx.shadowOffsetX=1;
    outputCtx.shadowOffsetY=1;
    outputCtx.shadowBlur=1;

    for (var h=nbStrokes-1;h>=0; h--) {
      x=Math.floor(2+Math.random()*(inputWidth-1));
      y=Math.floor(2+Math.random()*(inputHeight-1));

      dx=dy=0;

      for (var i=0; i<3; i++) {
        for (var j=0; j<3; j++) {
          vnear = this.inputPixmap.colorAt(x+i-1,y+j-1).brightness();
          dx += Sx[j][i] * vnear;
          dy += Sy[j][i] * vnear;
        }
      }
      dx/=8; dy/=8;

      dmag2=dx*dx + dy*dy;

      if (dmag2 > threshold) {
        b = 2*(inputWidth + inputHeight) / 5000.0;
        textScale=minFontScale+Math.sqrt(dmag2)*maxFontScale/80;
        if (dx==0) {
          dir=Math.PI/2;
        }
        else if (dx > 0) {
          dir=Math.atan2(dy,dx);
        }
        else {
          if (dy==0)
            dir=0;
          else if (dy > 0)
          dir=Math.atan2(-dx,dy)+Math.PI/2;
          else
            dir=Math.atan2(dy,dx)+Math.PI;
        }

        outputCtx.font = textScale+"px "+font;
        outputCtx.save();

        tx=Math.round(x*outputWidth/inputWidth);
        ty=Math.round(y*outputHeight/inputHeight);
        r=dir+Math.PI/2;

        word=words[h % words.length];

        outputCtx.translate(tx,ty);
        outputCtx.rotate(r);
        outputCtx.fillStyle = this.inputPixmap.colorAt(x,y).toString();
        outputCtx.fillText(word, 0,0);

        outputCtx.restore();

      }
    }

  };
};


//#################################################################

Textorizer[1] = new function() {

  this.textorize = function(params, openImageSeparately) {
    this._params = params;
    this.inputPixmap = new Pixmap(params['inputCanvas']);
    this._textorize();

    if (openImageSeparately)
      window.open(this._params['outputCanvas'].toDataURL());

  };


  //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  this._textorize = function() {
    var textbuffer;
    var text = this._params['text']+" ";
    var nbletters = text.length;
    var ti=0;
    var x,y;
    var rx, scale, r,g,b, c, charToPrint, pixel;
    var outputCanvas = this._params['outputCanvas'];
    var inputCanvas  = this._params['inputCanvas'];
    var font         = this._params['font'];
    var opacity      = this._params['opacity'];
    var inputURL     = this._params['input_url'];
    var kerning      = this._params['kerning'];
    var lineHeight   = this._params['line_height'];
    var fontScale    = this._params['font_scale'];
    var fontSize     = this._params['text_size'];

    var inputWidth   = inputCanvas.width;
    var inputHeight  = inputCanvas.height;
    var outputWidth  = outputCanvas.width;
    var outputHeight = outputCanvas.height;
    var inputCtx     = inputCanvas.getContext('2d');
    var outputCtx    = outputCanvas.getContext('2d');

    var imgScaleFactorX = inputWidth/outputWidth;
    var imgScaleFactorY = inputHeight/outputHeight;


    // reset values
    outputCtx.shadowColor="black";
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
    outputCtx.shadowColor="black";
    outputCtx.shadowOffsetX=1;
    outputCtx.shadowOffsetY=1;
    outputCtx.shadowBlur=1;

    for (y=0; y < outputHeight; y+=fontSize*lineHeight) {
      rx=1;

      // skip any white space at the beginning of the line
      while (text[ti%nbletters] == ' ') ti++;

      while (rx < outputWidth) {

        x=Math.floor(rx)-1;

        pixel = this.inputPixmap.colorAverageAt(Math.floor(x*imgScaleFactorX),
                                                Math.floor(y*imgScaleFactorY),
                                                Math.floor(fontSize*fontScale/6));
//                                                1);

//        if (!pixel.isWhite()) {
          c=text[ti%nbletters];
          var letterWidth = outputCtx.measureText(c).width;

          if (c!=" ") {
            scale = 2 - pixel.brightness()/255.0;

          /*
           if (T2ColorAdjustment>0) {
           var saturation = saturation(pixel);
           var newSaturation = (saturation+T2ColorAdjustment)>255?255:(saturation+T2ColorAdjustment);
           colorMode(HSB,255);
           pixel = color(hue(charColor), newSaturation, brightness(charColor));
           fill(pixel);
           colorMode(RGB,255);
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
  };
};

//################################################################################
Textorizer[2] = new function() {

  // public

  this.textorize = function(params, openImageSeparately) {

    this._params = params;
    this.inputPixmap = new Pixmap(params['inputCanvas']);
    this._wiggleFrequency = this._params['wiggle']/100.0;
    this._wiggleAmplitude = this._wiggleFrequency==0 ? 0 : .5/this._wiggleFrequency;

    this._excoffize();
    if (openImageSeparately)
      window.open(this._params['outputCanvas'].toDataURL());
  };

  // private
  this._wiggle = function(x) { return this._wiggleAmplitude*Math.sin(x*this._wiggleFrequency); };
  this._S2P = function(x,y) {
    // convert x,y from "sinusoidal space" to picture space
    var c=Math.cos(this._params['theta']), s=Math.sin(this._params['theta']);
    var sx=this._params['sx'], sy=this._params['sy'];
    var tx=this._params['tx'], ty=this._params['ty'];
    return [x*sx*c - y*sy*s + sx*c*tx - sy*s*ty, x*sx*s + y*sy*c + sx*s*tx + sy*c*ty];
  };
  this._P2S = function(x,y)
    // convert x,y from picture space to  "sinusoidal space"
  {
    var c=Math.cos(-this._params['theta']), s=Math.sin(-this._params['theta']);
    var sx = 1/this._params['sx'], sy = 1/this._params['sy'];
    var tx = -this._params['tx'], ty = -this._params['ty'];

    return [ x*sx*c - y*sx*s + tx, x*sy*s + y*sy*c + ty ];
  };
  this._sidePoints=function(x1,y1,x2,y2,r)
  {
    var L=Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
    var px=(x2-x1)*r/L;
    var py=(y2-y1)*r/L;

    return [x1-py-(px/20), y1+px-(py/20), x1+py-(px/20), y1-px-(py/20)];
  };

  this._excoffize = function() {
    var outputCanvas = this._params['outputCanvas'];
    var outputCtx = outputCanvas.getContext('2d');
    var inputWidth   = this.inputPixmap.width;
    var inputHeight  = this.inputPixmap.height;
    var outputWidth  = outputCanvas.width;
    var outputHeight = outputCanvas.height;
    var opacity      = this._params['opacity'];
    var lineHeight   = this._params['line_height'];


    // reset values
    outputCtx.shadowColor="black";
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


    // boundaries of the image in sinusoidal space
    var corner1 = this._P2S(0,0);
    var corner2 = this._P2S(inputWidth,0);
    var corner3 = this._P2S(inputWidth,inputHeight);
    var corner4 = this._P2S(0,inputHeight);

    var minX=Math.min(corner1[0],corner2[0],corner3[0],corner4[0]);
    var minY=Math.min(corner1[1],corner2[1],corner3[1],corner4[1]);
    var maxX=Math.max(corner1[0],corner2[0],corner3[0],corner4[0]);
    var maxY=Math.max(corner1[1],corner2[1],corner3[1],corner4[1]);

    // from the min/max bounding box, we know which sines to draw

    var stepx=2;
    var stepy=lineHeight;

    var x,y;

    for (y=minY-this._wiggleAmplitude ;y<maxY+this._wiggleAmplitude;y+=stepy) {
      for (x=minX;x<maxX;x+=stepx) {
        var imageP=this._S2P(x,y+this._wiggle(x),params);
        var rx=imageP[0];
        var ry=imageP[1];

        // rx2,ry2 is the point ahead, to which we draw a segment
        var imageP2=this._S2P(x+stepx,y+this._wiggle(x+stepx),params);
        var rx2=imageP2[0];
        var ry2=imageP2[1];

        if ((rx  >= 0 && rx  < inputWidth && ry  >= 0 && ry  < inputHeight)||
            (rx2 >= 0 && rx2 < inputWidth && ry2 >= 0 && ry2 < inputHeight)) {

          var radius=100/(10+this.inputPixmap.brightnessAverageAt(Math.floor(rx), Math.floor(ry), 1));
          var radius2=100/(10+this.inputPixmap.brightnessAverageAt(Math.floor(rx2), Math.floor(ry2), 1));

          var sidePoints=this._sidePoints(rx,ry,rx2,ry2,radius);
          var sidePoints2=this._sidePoints(rx2,ry2,rx,ry,radius2);

          // scale everything to output resolution
          var zoom=outputWidth/inputWidth;
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

  };

};