/* jslint devel: true, browser: true, maxerr: 50, indent: 2 */
var $, output_canvas, Textorizer, Fonts;

var defaults = {
  "text":"letters\nfonts\nwords\ntext\nkerning",
  "opacity":30,
  "nb_strings":1000,
  "threshold":100,
  "font_size_min":10,
  "font_size_max":30,
  "output_height":600,
  "image_file": "dali.png"
};


var inputCanvas;
var inputCanvasCtx;
var aspectRatio;
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
      text: $("#text").val(),
      seed: Date.now(),
      nb_strings: $("#nb_strings").slider('value'),
      threshold: $("#threshold").slider('value'),
      font_size_min: $("#font_size").slider('values',0),
      font_size_max: $("#font_size").slider('values',1),
      font: $('#font :selected').text()
    };
    params.outputCanvas.height = params.outputHeight;
    params.outputCanvas.width = params.outputHeight*inputCanvas.width/inputCanvas.height;
    Textorizer[0].textorize(params);

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

  // and render a preview
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
      "version: textorizer 1<br/>"+
      "opacity: "+params.opacity+"<br/>"+
      "text: '"+params.text+"'<br/>"+
      "seed: "+params.seed+"<br/>"+
      "nb_strings: "+params.nb_strings+"<br/>"+
      "threshold: "+params.threshold+"<br/>"+
      "font_size_min: "+params.font_size_min+"<br/>"+
      "font_size_max: "+params.font_size_max+"<br/>"+
      "font: "+params.font);

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

  $("#text").val(defaults.text);

  /* specific settings */
  $("#nb_strings").slider({min:100,
                           max:100000,
                           value:defaults.nb_strings,
                           change: function () {
                              go();
                            }});
  $("#threshold").slider({min:0,
                          max:200,
                         step:0.1,
                        value:defaults.threshold,
                       change: function () {
                                  go();
                                }});
  $("#font_size").slider({range: true,
                               min: 0,
                               max: 50,
                               step: 0.1,
                               values: [defaults.font_size_min, defaults.font_size_max],
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


  // populate the fonts dropowns
  $("#font").html("<option>"+Fonts.join("</option><option>")+"</option>");
  $("#font").change(function() { go(); });
  $("#input_thumb").attr("src", defaults.image_file);

});
