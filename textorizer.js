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
    var nbStrokes    = this._params['nbStrings'];
    var threshold    = this._params['threshold'];
    var minFontScale = this._params['fontSizeMin'];
    var maxFontScale = this._params['fontSizeMax'];
    var font         = this._params['font'];
    var opacity      = this._params['opacity'];
    var inputURL     = this._params['input_url'];

    var inputWidth   = this.inputPixmap.width;
    var inputHeight  = this.inputPixmap.height;

    var outputWidth  = outputCanvas.width;
    var outputHeight = outputCanvas.height;
    var outputCtx    = outputCanvas.getContext('2d');

    // clear output canvas
    outputCtx.fillStyle = "white";
    outputCtx.fillRect(0,0,outputWidth,outputHeight);

    // and add in the initial picture with transparency
    outputCtx.globalAlpha = opacity/256;
    outputCtx.drawImage(this.inputPixmap.canvas,0,0,outputWidth,outputHeight);
    outputCtx.globalAlpha = 1;

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
    var text = this._params['text'];
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

    // clear output canvas
    outputCtx.fillStyle = "white";
    outputCtx.fillRect(0,0,outputWidth,outputHeight);

    // and add in the initial picture with transparency
    outputCtx.globalAlpha = opacity/256;
    outputCtx.drawImage(this.inputPixmap.canvas,0,0,outputWidth,outputHeight);
    outputCtx.globalAlpha = 1;


    for (y=0; y < outputHeight; y+=fontSize*lineHeight) {
      rx=1;

      // skip any white space at the beginning of the line
      while (text[ti%nbletters] == ' ') ti++;

      while (rx < outputWidth) {

        x=Math.floor(rx)-1;

        pixel = this.inputPixmap.colorAverageAt(Math.floor(x*imgScaleFactorX),
                                                Math.floor(y*imgScaleFactorY),
                                                1);
        if (!pixel.isWhite()) {

          scale = 2 - pixel.brightness()/255.0;
          c=text[ti%nbletters];

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

          outputCtx.font = (fontSize * (1 + fontScale*Math.pow(scale-1,3))) + " " + font;

          outputCtx.fillText(c, x, y+fontSize*lineHeight);

          rx+=outputCtx.measureText(c).width * (1+kerning);
          ti++; // next letter
        } else {
          // advance one em
          rx+=outputCtx.measureText(" ").width * (1+kerning);
        }
      }
    }
  };
};

var Color = function(r,g,b,a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};

Color.prototype.toString = function() {
  return "rgb("+this.r+","+this.g+","+this.b+")";
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
