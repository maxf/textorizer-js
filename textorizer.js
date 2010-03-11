var Textorizer1 = new function() {
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

  //==== private ====


  var Sx = [[-1,0,1], [-2,0,2], [-1,0,1]];
  var Sy = [[-1,-2,-1], [0,0,0], [1,2,1]];

  this._textorize = function() {
    var x,y,tx,ty;
    var dx,dy,dmag2,vnear,b,textScale,dir,r;
    var v,p;
    var words = this._params['text'].split('\r\n');
    var word;

    var targetCanvas = this._params['targetCanvas'];
    var sourceCanvas = this._params['sourceCanvas'];
    var nbStrokes    = this._params['nbStrings'];
    var threshold    = this._params['threshold'];
    var minFontScale = this._params['fontSizeMin'];
    var maxFontScale = this._params['fontSizeMax'];
    var font         = this._params['font'];
    var inputWidth   = sourceCanvas.width;
    var inputHeight  = sourceCanvas.height;
    var ctx          = sourceCanvas.getContext('2d');
    var pixels       = ctx.getImageData(0,0,inputWidth,inputHeight).data;

    for (var h=nbStrokes-1;h>=0; h--) {
      x=Math.floor(2+Math.random()*(inputWidth-1));
      y=Math.floor(2+Math.random()*(inputHeight-1));

      v=pixels.getter(x+y*inputWidth);

      ctx.fillStyle(v);
      dx=dy=0;

      for (var i=0; i<3; i++) {
        for (var j=0; j<3; j++) {
          p=pixels.getter((x+i-1)+inputWidth*(y+j-1));
          vnear=this._brightness(p);
          dx += Sx[j][i] * vnear;
          dy += Sy[j][i] * vnear;
        }
      }
      dx/=8; dy/=8;

      dmag2=dx*dx + dy*dy;

      if (dmag2 > threshold) {
        b = 2*(inputWidth + inputHeight) / 5000.0;
        textScale=minFontScale+sqrt(dmag2)*maxFontScale/80;
        if (dx==0)
          dir=PI/2;
        else if (dx > 0)
          dir=Math.atan(dy/dx);
        else
          if (dy==0)
            dir=0;
          else if (dy > 0)
            dir=Math.atan(-dx/dy)+PI/2;
          else
            dir=Math.atan(dy/dx)+PI;
        ctx.font = textScale+"px "+font;

        pushMatrix();
      tx=int(float(x)*CanvasWidth/InputWidth);
      ty=int(float(y)*CanvasHeight/InputHeight);
      r=dir+PI/2;
      word=(String)(Words[h % Words.length]);

      // screen output
      translate(tx,ty);
      rotate(r);
      fill(v);
      text(word, 0,0);
      stroke(1.0,0.,0.);
      popMatrix();

      // SVG output
      SvgBuffer.append("<text transform='translate("+tx+","+ty+") scale("+textScale/15.0+") rotate("+r*180/PI+")' fill='rgb("+int(red(v))+","+int(green(v))+","+int(blue(v))+")'>"+word+"</text>\n");

    }
  }

  SvgBuffer.append("</g>\n</svg>\n");
  SvgOutput=new String[1];
  SvgOutput[0]=SvgBuffer.toString();
  saveStrings(SvgFileName, SvgOutput);
  }












};

var Textorizer2 = new function() {
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

