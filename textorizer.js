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

  this._loadStrings = function() {

    this._strings =
    // TODO reuse code in drawit
  }

  this._textorize = function() {
    var x,y,tx,ty;
    var dx,dy,dmag2,vnear,b,textScale,dir,r;
    var v,p;
    var words = this._params['text'].split('\r\n');
    var word;

    var targetCanvas = this._params['targetCanvas'];
    var sourceCanvas = this._params['sourceCanvas'];
    var inputWidth  = sourceCanvas.width;
    var inputHeight = sourceCanvas.height;
    var nbStrokes    = this._params['nbStrings'];

    t.fillStyle("#999");

    for (var h=nbStrokes-1;h>=0; h--) {
      x=Math.floor(2+Math.random()*(InputWidth-1));
      y=Math.floor(2+Math.random()*(InputHeight-1));

//=====================

      v=Image.pixels[x+y*InputWidth];

    fill(v);
    dx=dy=0;
    for (int i=0; i<3; i++) {
      for (int j=0; j<3; j++) {
        p=Image.pixels[(x+i-1)+InputWidth*(y+j-1)];
        vnear=brightness(p);
        dx += Sx[j][i] * vnear;
        dy += Sy[j][i] * vnear;
      }
    }
    dx/=8; dy/=8;

    dmag2=dx*dx + dy*dy;

    if (dmag2 > Threshold) {
      b = 2*(InputWidth + InputHeight) / 5000.0;
      textScale=minFontScale+sqrt(dmag2)*maxFontScale/80;
      if (dx==0)
        dir=PI/2;
      else if (dx > 0)
        dir=atan(dy/dx);
      else
        if (dy==0)
          dir=0;
        else if (dy > 0)
          dir=atan(-dx/dy)+PI/2;
        else
          dir=atan(dy/dx)+PI;
      textSize(textScale);

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

