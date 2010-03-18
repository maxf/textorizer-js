var Textorizer = [];

Textorizer[0] = new function() {

  this.textorize = function(params, openImageSeparately) {
    this._params = params;
    this._textorize();

    if (openImageSeparately)
      window.open(this._params['outputCanvas'].toDataURL());
  };

  //==== private ====

  this._colorAt = function(pixels,w,x,y) {
    var red = pixels[4*(x+y*w)];
    var green = pixels[4*(x+y*w)+1];
    var blue = pixels[4*(x+y*w)+2];
    var alpha = pixels[4*(x+y*w)+3];

    return "rgb("+red+","+green+","+blue+")";
  };

  var Sx = [[-1,0,1], [-2,0,2], [-1,0,1]];
  var Sy = [[-1,-2,-1], [0,0,0], [1,2,1]];

  this._textorize = function() {
    var x,y,tx,ty;
    var dx,dy,dmag2,vnear,b,textScale,dir,r;
    var v,p;
    var words = this._params['text'].split('\n');
    var word;
    var outputCanvas = this._params['outputCanvas'];
    var inputCanvas  = this._params['inputCanvas'];
    var nbStrokes    = this._params['nbStrings'];
    var threshold    = this._params['threshold'];
    var minFontScale = this._params['fontSizeMin'];
    var maxFontScale = this._params['fontSizeMax'];
    var font         = this._params['font'];
    var opacity      = this._params['opacity'];
    var inputURL     = this._params['input_url'];

    var inputWidth   = inputCanvas.width;
    var inputHeight  = inputCanvas.height;
    var outputWidth  = outputCanvas.width;
    var outputHeight = outputCanvas.height;
    var inputCtx     = inputCanvas.getContext('2d');
    var outputCtx    = outputCanvas.getContext('2d');
    var pixels       = inputCtx.getImageData(0,0,inputWidth,inputHeight).data;

    // clear output canvas
    outputCtx.fillStyle = "white";
    outputCtx.fillRect(0,0,outputWidth,outputHeight);

    // and add in the initial picture with transparency
    outputCtx.globalAlpha = opacity/256;
    outputCtx.drawImage(inputCanvas,0,0,outputWidth,outputHeight);
    outputCtx.globalAlpha = 1;

    for (var h=nbStrokes-1;h>=0; h--) {
      x=Math.floor(2+Math.random()*(inputWidth-1));
      y=Math.floor(2+Math.random()*(inputHeight-1));

      dx=dy=0;

      for (var i=0; i<3; i++) {
        for (var j=0; j<3; j++) {
          var pindex = 4*((x+i-1)+inputWidth*(y+j-1));
          vnear=(pixels[pindex]+pixels[pindex+1]+pixels[pindex+2])/3;

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
        outputCtx.fillStyle = this._colorAt(pixels,inputWidth,x,y);
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
    alert("implement me");
  };


  //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


  // return the image's pixel value at x,y, averaged with its radiusXradius
  // neighbours.

  this._pixelAverageAt = function(x, y, radius) {
    var pixel;
    var resultR=0.0, resultG=0.0, resultB=0.0;
    var count=0;

    for (var i=-radius; i<=radius; i++) {
      for (var j=-radius; j<=radius; j++) {
        if (x+i>=0 && x+i<InputWidth && y+j>=0 && y+j<InputHeight) {
          count++;
          pixel=Image.pixels[(x+i)+InputWidth*(y+j)];
          resultR+=red(pixel);
          resultG+=green(pixel);
          resultB+=blue(pixel);
        }
      }
    }
    return {red:resultR/count, green:resultG/count, blue:resultB/count};
  };

  // return the brightness at a pixel
  this._brightness = function(pixel) {
    return (pixel.red+pixel.green+pixel.blue)/3;
  };


  this._textorize = function() {
    var textbuffer;
    var text = this._params['text'];
    var nbletters = text.length;
    var ti=0;
    var x,y;
    var rx, scale, r,g,b, c, charToPrint, pixel;
    var outputCanvas = this._params['outputCanvas'];
    var inputCanvas  = this._params['inputCanvas'];
    var nbStrokes    = this._params['nbStrings'];
    var threshold    = this._params['threshold'];
    var minFontScale = this._params['fontSizeMin'];
    var maxFontScale = this._params['fontSizeMax'];
    var font         = this._params['font'];
    var opacity      = this._params['opacity'];
    var inputURL     = this._params['input_url'];

    var inputWidth   = inputCanvas.width;
    var inputHeight  = inputCanvas.height;
    var outputWidth  = outputCanvas.width;
    var outputHeight = outputCanvas.height;
    var inputCtx     = inputCanvas.getContext('2d');
    var outputCtx    = outputCanvas.getContext('2d');
    var pixels       = inputCtx.getImageData(0,0,inputWidth,inputHeight).data;

    var imgScaleFactorX = inputWidth/outputWidth;
    var imgScaleFactorY = inputHeight/outputHeight;

    for (y=0; y < outputHeight; y+=T2FontSize*T2LineHeight) {
      rx=1;

      // skip any white space at the beginning of the line
      while (text[ti%nbletters] == ' ') ti++;

      while (rx < outputWidth) {
        x=Math.floor(rx)-1;

        pixel = pixelAverageAt(Math.floor(x*imgScaleFactorX), Math.floor(y*imgScaleFactorY), 1);

        r=pixel.red; g=pixel.green; b=pixel.blue;

        if (r+g+b<3*255) { // eliminate white

          scale=2-this._brightness(pixel)/255.0;
          c=text[ti%nbletters];

          charToPrint=c;
          color charColour = color(r,g,b);
          if (T2ColourAdjustment>0) {
            var saturation = saturation(charColour);
            var newSaturation = (saturation+T2ColourAdjustment)>255?255:(saturation+T2ColourAdjustment);
            colorMode(HSB,255);
            charColour = color(hue(charColour), newSaturation, brightness(charColour));
            fill(charColour);
            colorMode(RGB,255);
          } else {
            fill(charColour);
          }

          textSize(T2FontSize * (1 + T2FontScaleFactor*pow(scale-1,3)));
          text(charToPrint, x, y+T2FontSize*T2LineHeight);

          r=red(charColour); g=green(charColour); b=blue(charColour);

          rx+=textWidth(Character.toString(c)) * (1+T2Kerning);
          ti++; // next letter
        } else {
          // advance one em
          rx+=textWidth(" ") * (1+T2Kerning);
        }
      }
    }
  };
};

