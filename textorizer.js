var Textorizer = [];

Textorizer[0] = new function() {
  this.preview = function(params) {
    this._params = params;
    this._textorize();
  };



  this.toPNG = function(params) {
    this._params = params;
    alert("implement me");
  };
  this.toSVG = function(params) {
    this._params = params;
    alert("implement me");
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
    var inputCanvas = this._params['inputCanvas'];
    var nbStrokes    = this._params['nbStrings'];
    var threshold    = this._params['threshold'];
    var minFontScale = this._params['fontSizeMin'];
    var maxFontScale = this._params['fontSizeMax'];
    var font         = this._params['font'];
    var inputWidth   = inputCanvas.width;
    var inputHeight  = inputCanvas.height;
    var outputWidth  = outputCanvas.width;
    var outputHeight = outputCanvas.height;
    var inputCtx    = inputCanvas.getContext('2d');
    var outputCtx    = outputCanvas.getContext('2d');
    var pixels       = inputCtx.getImageData(0,0,inputWidth,inputHeight).data;

    // clear output canvas
    outputCtx.fillStyle = "white";
    outputCtx.fillRect(0,0,outputWidth,outputHeight);

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

Textorizer[1] = new function() {
  this.preview = function(params) {
    this._params = params;
    alert("implement me");
  };
  this.toPNG = function(params) {
    this._params = params;
    alert("implement me");
  };
  this.toSVG = function(params) {
    this._params = params;
    alert("implement me");
  };

  this._params = null;
};

