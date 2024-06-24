/* jslint devel: true, browser: true, maxerr: 50, indent: 2 */
var Excoffizer;

var defaults = {
  "theta":30,
  "waviness":10,
  "line_height":5,
  "sx":1,
  "sy":1,
  "tx":0,
  "ty":0,
  "margin": 10,
  "image_file": "dali.png"
};

const id = id => document.getElementById(id);

id("theta").value = defaults.theta;
id("value-theta").innerHTML = defaults.theta;
id("waviness").value = defaults.waviness;
id("value-waviness").innerHTML = defaults.waviness;
id("line_height").value = defaults.line_height;
id("value-line_height").innerHTML = defaults.line_height;
id("sx").value = defaults.sx;
id("value-sx").innerHTML = defaults.sx;
id("sy").value = defaults.sy;
id("value-sy").innerHTML = defaults.sy;
id("margin").value = defaults.margin;
id("value-margin").innerHTML = defaults.margin;

var inputCanvas;
var inputCanvasCtx;
var aspectRatio;
var params;

function go()
{
  "use strict";
  // Put the pixels of the original image into the canvas
  var t = new Image();
  t.src = id("input_thumb").getAttribute("src");
  t.onload = function() {
    inputCanvas.width=t.width;
    inputCanvas.height=t.height;
    inputCanvasCtx.drawImage(t,0,0);
    params = {
      inputCanvas: inputCanvas,
      theta: parseInt(id("theta").value),
      waviness: parseFloat(id("waviness").value),
      line_height: parseInt(id("line_height").value),
      sx: parseFloat(id("sx").value),
      sy: parseFloat(id("sy").value),
      tx: defaults.tx,
      ty: defaults.ty,
      margin: parseInt(id("margin").value)
    };
    const svg = Excoffizer.excoffize(params);
    document.getElementById('output-canvas').innerHTML = svg;
  };
}

// a thumbnail has been loaded
function thumb_loaded(event) {
  "use strict";
  // prepare the output canvas
  var newImg = new Image();
  newImg.src = event.target.src;
  aspectRatio = newImg.width / newImg.height;

  // and render
  go();
}


inputCanvas = id("input_canvas");
inputCanvasCtx = inputCanvas.getContext('2d');

id("file_selector").addEventListener('change', e => {
  var fr = new FileReader();
  fr.onload = function() {
    id("input_thumb").setAttribute("src", fr.result);
  };
  fr.readAsDataURL(e.target.files[0]);
});

// only re activate the buttons when the image is loaded **FIXME - image could already be loaded (if we reselect the existing URL)
id("input_thumb").addEventListener('load', e => {
  thumb_loaded(e, 0);
});

// no jquery on line below. We need the raw node values since we're operating on the attributes directly
output_canvas = id("output_canvas");

id("theta").addEventListener("change", event => {
  id("value-theta").innerHTML = event.target.value;
  go();
});

id("waviness").addEventListener("change", event => {
  id("value-waviness").innerHTML = event.target.value;
  go();
});

id("line_height").addEventListener("change", event => {
  id("value-line_height").innerHTML = event.target.value;
  go();
});

id("sx").addEventListener("change", event => {
  id("value-sx").innerHTML = event.target.value;
  go();
});

id("sy").addEventListener("change", event => {
  id("value-sy").innerHTML = event.target.value;
  go();
});

id("margin").addEventListener("change", event => {
  id("value-margin").innerHTML = event.target.value;
  go();
});


id("render_window").addEventListener("click", event => {
  const newWin = window.open('','_blank');
  newWin.title = 'Excoffizer SVG';
  newWin.document.write(Excoffizer.excoffize(params));
  newWin.focus();
});

id("input_thumb").setAttribute("src", defaults.image_file);
