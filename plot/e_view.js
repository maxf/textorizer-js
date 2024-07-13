/* jslint devel: true, browser: true, maxerr: 50, indent: 2 */

var defaults = {
  theta: 43,
  waviness: 1,
  line_height: 7.6,
  sx: 1,
  sy: 1,
  tx: 0,
  ty: 0,
  margin: 10,
  image_file: "dali.png",
  blur: 1,
};

const id = id => document.getElementById(id);

id("theta").value = defaults.theta;
id("value-theta").innerHTML = defaults.theta;
id("waviness").value = defaults.waviness;
id("value-waviness").innerHTML = defaults.waviness;
id("line-height").value = defaults.lineHeight;
id("value-line-height").innerHTML = defaults.lineHeight;
id("sx").value = defaults.sx;
id("value-sx").innerHTML = defaults.sx;
id("sy").value = defaults.sy;
id("value-sy").innerHTML = defaults.sy;
id("margin").value = defaults.margin;
id("value-margin").innerHTML = defaults.margin;
id("blur").value = defaults.blur;
id("value-blur").innerHTML = defaults.blur;

var aspectRatio;
var params;

function go()
{
  "use strict";
  // Put the pixels of the original <img> into the <canvas>
  var t = new Image();
  t.src = id("input_thumb").getAttribute("src");
  t.onload = function() {
    const thumbWidth = id("input_thumb").width;
    const thumbHeight = id("input_thumb").height;
    id("input_canvas").width = thumbWidth;
    id("input_canvas").height = thumbHeight;
    id("input_canvas").getContext('2d').drawImage(t,0,0, thumbWidth, thumbHeight);
    params = {
      inputCanvas: id('input_canvas'),
      theta: parseInt(id("theta").value),
      waviness: parseFloat(id("waviness").value),
      lineHeight: parseFloat(id("line-height").value),
      sx: parseFloat(id("sx").value),
      sy: parseFloat(id("sy").value),
      tx: defaults.tx,
      ty: defaults.ty,
      margin: parseInt(id("margin").value),
      blur: parseInt(id("blur").value)
    };
    const excoffizator = new Excoffizer(params);
    const svg = excoffizator.excoffize(params);
    document.getElementById('output-canvas').innerHTML = svg;
  };
}

function saveSvg(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgEl.outerHTML;
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
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

id("line-height").addEventListener("change", event => {
  id("value-line-height").innerHTML = event.target.value;
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

id("blur").addEventListener("change", event => {
  id("value-blur").innerHTML = event.target.value;
  go();
});

id('save-button').addEventListener(
  'click',
  () => saveSvg(id('svg'), 'excoffizer.svg')
);

id("input_thumb").setAttribute("src", defaults.image_file);
