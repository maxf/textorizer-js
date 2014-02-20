/* jslint devel: true, browser: true, maxerr: 50, indent: 2 */
var $, Textorizer;

var defaults = {
  "opacity":30,
  "theta":30,
  "waviness":10,
  "line_height":5,
  "sx":1,
  "sy":1,
  "tx":0,
  "ty":0,
  "output_height":600,
  "image_file": "dali.png"
};


var inputCanvas;
var inputCanvasCtx;
var aspectRatio;
var output_canvas;
var params;
var admin_mode;

function go()
{
  "use strict";
  $("#buttons").hide();
  $("#buttons_spinning_wheel").show();
  output_canvas.style.display="none";
  // Put the pixels of the original image into the canvas
  var t = new Image();
  t.src = $("#input_thumb").attr("src");
  t.onload = function() {
    inputCanvas.width=t.width;
    inputCanvas.height=t.height;
    inputCanvasCtx.drawImage(t,0,0);
    params = {
      inputCanvas: inputCanvas,
      opacity: $("#opacity").slider('value'),
      outputHeight: admin_mode ? $("#height_control").slider('value') : defaults.output_height,
      outputCanvas: output_canvas,
      theta: $("#theta").slider('value'),
      waviness: $("#waviness").slider('value'),
      line_height: $("#line_height").slider('value'),
      sx: $("#sx").slider('value'),
      sy: $("#sy").slider('value'),
      tx: $("#tx").slider('value'),
      ty: $("#ty").slider('value')
    };
    params.outputCanvas.height = params.outputHeight;
    params.outputCanvas.width = params.outputHeight*inputCanvas.width/inputCanvas.height;
    Textorizer[2].textorize(params);
    $("#buttons").show();
    $("#buttons_spinning_wheel").hide();
    output_canvas.style.display="block";
  };
}

// a thumbnail has been loaded
function thumb_loaded(event) {
  "use strict";
  // prepare the output canvas
  var newImg = new Image();
  newImg.src = event.target.src;
  aspectRatio = newImg.width / newImg.height;
  output_canvas.height = defaults.output_height;
  output_canvas.width = defaults.output_height * aspectRatio;

  // and render
  go();
}


$(function() {
  "use strict";
  inputCanvas = document.getElementById("input_canvas");
  inputCanvasCtx = inputCanvas.getContext('2d');

  $("#privacy").click(function () {
    $("#privacy_popup").dialog();
  });
  $("#cors").click(function () {
    $("#cors_popup").dialog();
  });
  $("#large_formats_button").click(function () {
    $("#params").html(
      "version: excoffizer<br/>"+
      "opacity: "+params.opacity+"<br/>"+
      "theta: '"+params.theta+"'<br/>"+
      "waviness: "+params.waviness+"<br/>"+
      "line_height: "+params.line_height+"<br/>"+
      "sx: "+params.sx+"<br/>"+
      "sy: "+params.sy+"<br/>"+
      "tx: "+params.tx+"<br/>"+
      "ty: "+params.ty+"<br/>");

    $("#large_formats_popup").dialog();
  });

  $("#file_selector").change(function(e){
                                var fr = new FileReader();
                                fr.onload = function() {
                                  $("#input_thumb").attr("src",fr.result);
                                };
                                fr.readAsDataURL(e.target.files[0]);
                              });

  // only re activate the buttons when the image is loaded **FIXME - image could already be loaded (if we reselect the existing URL)
  $("#input_thumb").load(function(e){
                            thumb_loaded(e,0);
                            $("#secondary_panel, #output_canvas, #input_thumb").show();
                          });

  // no jquery on line below. We need the raw node values since we're operating on the attributes directly
  output_canvas = document.getElementById("output_canvas");

  $("#opacity").slider({min:0,
                        max:255,
                        value:defaults.opacity,
                        change: function () {
                          go();
                        }});


  $("#theta").slider({min:0,
                      max:180,
                      step: 0.1,
                      value:defaults.theta,
                      change: function () {
                        go();
                      }});

  $("#waviness").slider({min:0,
                         max:30,
                         step: 0.1,
                         value:defaults.waviness,
                         change: function () {
                            go();
                          }});

  $("#line_height").slider({min:1,
                              max:100,
                              step: 1,
                              value:defaults.line_height,
                              change: function () {
                                go();
                              }});

  $("#sx").slider({min:0,
                     max:2,
                     step: 0.01,
                     value:defaults.sx,
                     change: function () {
                        go();
                      }});

  $("#sy").slider({min:0,
                     max:2,
                     step: 0.01,
                     value:defaults.sy,
                     change: function () {
                        go();
                      }});

  $("#tx").slider({min:0,
                     max:10,
                     step: 0.01,
                     value:defaults.tx,
                     change: function () {
                        go();
                      }});

  $("#ty").slider({min:0,
                     max:10,
                     step: 0.01,
                     value:defaults.ty,
                     change: function () {
                        go();
                      }});


  admin_mode = /298948/.test(window.location.href);
  
  if (admin_mode) {
    $(".secret").css("display","block");
    $("#height_control").slider({
      min: 100,
      max: 10000,
      step: 10,
      value: defaults.output_height,
      change: function () {
        go();
      }
    });
  }


  $("#input_thumb").attr("src", defaults.image_file);

});
