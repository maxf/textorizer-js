/*jslint devel: true, browser: true, maxerr: 50, indent: 2 */

var $, output_canvas, Textorizer, FileReader, Fonts, changeOutputHeightTo;

var defaults = {
    "text": "She knows, now, absolutely, hearing the white noise that is London, that Damien's theory of jet lag is correct: that her mortal soul is leagues behind her, being reeled in on some ghostly umbilical down the vanished wake of the plane that brought her here, hundreds of thousands of feet above the Atlantic. Souls can't move that quickly, and are left behind, and must be awaited, upon arrival, like lost luggage.", // http://www.williamgibsonbooks.com/books/pattern.asp#excerpt
    "opacity": 120,
    "text_size": 20,
    "line_height": 1,
    "saturation": 0,
    "kerning": 0,
    "font_scale": 1.5,
    "output_height": 600,
    "image_file": "jetlag.jpg"
  };

var inputCanvas;
var inputCanvasCtx;
var aspectRatio;

function go(options) {
  "use strict";
  $("#buttons").hide();
  $("#buttons_spinning_wheel").show();
  output_canvas.style.display = "none";
  // Put the pixels of the original image into the canvas
  var t = new Image();
  t.src = $("#input_thumb").attr("src");
  t.onload = function () {
    inputCanvas.width = t.width;
    inputCanvas.height = t.height;
    inputCanvasCtx.drawImage(t, 0, 0);
    Textorizer[1].textorize({
      inputCanvas: inputCanvas,
      opacity: $("#opacity").slider('value'),
      outputHeight: defaults.output_height,
      outputCanvas: output_canvas,
      text: $("#text").val(),
      text_size: $("#text_size").slider('value'),
      line_height: $("#line_height").slider('value'),
      saturation: $("#saturation").slider('value'),
      kerning: $("#kerning").slider('value'),
      font_scale: $("#font_scale").slider('value'),
      font: $('#font :selected').text()
    });
    $("#buttons").show();
    $("#buttons_spinning_wheel").hide();
    output_canvas.style.display = "block";
  };
}

// a thumbnail has been loaded
function thumb_loaded(event) {
  "use strict";
  console.log("thumb_loaded");
  // prepare the output canvas
  var newImg = new Image();
  newImg.src = event.target.src;

  aspectRatio = newImg.width / newImg.height;
  output_canvas.height = defaults.output_height;
  output_canvas.width = defaults.output_height * aspectRatio;

  // and render 
  go();
}


$(function () {
  "use strict";
  inputCanvas = document.getElementById("input_canvas");
  inputCanvasCtx = inputCanvas.getContext('2d');

  $("#privacy").click(function (e) {
    $("#privacy_popup").dialog();
  });
  $("#cors").click(function (e) {
    $("#cors_popup").dialog();
  });


  $("#file_selector").change(function (e) {
    var fr = new FileReader();
    fr.onload = function () {
      $("#input_thumb").attr("src", fr.result);
    };
    fr.readAsDataURL(e.target.files[0]);
  });


  // only re activate the buttons when the image is loaded **FIXME - image could already be loaded (if we reselect the existing URL)
  $("#input_thumb").load(function (e) {
    thumb_loaded(e, 0);
    $("#secondary_panel, #output_canvas, #input_thumb").show();
  });


    // no jquery on line below. We need the raw node values since we're operating on the attributes directly
  output_canvas = document.getElementById("output_canvas");

  $("#opacity").slider({
    min: 0,
    max: 255,
    value: defaults.opacity,
    change: function (event, ui) {
      go();
    }
  });

  $("#text").val(defaults.text);

  $("#text_size").slider({
    min: 4,
    max: 50,
    step: 0.1,
    value: defaults.text_size,
    change: function (event, ui) {
      go();
    }
  });

  $("#line_height").slider({
    min: 0.5,
    max: 3,
    step: 0.05,
    value: defaults.line_height,
    change: function (event, ui) {
      go();
    }
  });


  $("#saturation").slider({
    min: 0,
    max: 255,
    value: defaults.saturation,
    change: function (event, ui) {
      go();
    }
  });

  $("#kerning").slider({
    min: -0.5,
    max: 0.5,
    step: 0.05,
    value: defaults.kerning,
    change: function (event, ui) {
      go();
    }
  });

  $("#font_scale").slider({
    min: 0,
    max: 5,
    step: 0.05,
    value: defaults.font_scale,
    change: function (event, ui) {
      go();
    }
  });

  // populate the fonts dropowns
  $("#font").html("<option>" + Fonts.join("</option><option>") + "</option>");
  $("#font").change(function() { go(); });

  $("#input_thumb").attr("src", defaults.image_file);

});
