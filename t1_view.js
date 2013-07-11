var defaults = {
  "text":"letters\nfonts\nwords\ntext\nkerning",
  "opacity":30,
  "nb_strings":1000,
  "threshold":100,
  "font_size_min":10,
  "font_size_max":30,
  "output_height":600
};


var inputCanvas;
var inputCanvasCtx;

var aspectRatio;

function go(options)
{
  $("#buttons").hide(); $("#buttons_spinning_wheel").show();
  output_canvas.style.display="none";
  // Put the pixels of the original image into the canvas
  var t = new Image();
  t.src = $("#input_thumb").attr("src");
  t.onload = function() {
    inputCanvas.width=t.width;
    inputCanvas.height=t.height;
    inputCanvasCtx.drawImage(t,0,0);
    Textorizer[0].textorize({ inputCanvas: inputCanvas,
                              opacity: $("#opacity").slider('value'),
                              outputHeight: defaults.output_height,
                              outputCanvas: output_canvas,
                              text: $("#text").val(),
                              nb_strings: $("#nb_strings").slider('value'),
                              threshold: $("#threshold").slider('value'),
                              font_size_min: $("#font_size").slider('values',0),
                              font_size_max: $("#font_size").slider('values',1),
                              font: $('#font :selected').text()});

    $("#buttons").show(); $("#buttons_spinning_wheel").hide();
    output_canvas.style.display="block";
  };
};

// a thumbnail has been loaded
function thumb_loaded(event) {
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
  $("#privacy").click(function (e) {
    $("#privacy_popup").dialog();
  });
  $("#cors").click(function (e) {
    $("#cors_popup").dialog();
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
                         slide: function(event, ui) {
                           $("#opacity_value").text(ui.value);
                         },
                         change: function (event, ui) {
                           go();
                         }});

    $("#opacity_value").text(defaults.opacity);


    $("#text").val(defaults.text);

    /* specific settings */
    $("#nb_strings").slider({min:100,
                                max:100000,
                                value:defaults.nb_strings,
                                slide: function(event, ui) {
                                  $("#nb_strings_value").text(ui.value);
                                },
                                change: function (event, ui) {
                                  go();
                                }});
    $("#nb_strings_value").text(defaults.nb_strings);
    $("#threshold").slider({min:0,
                               max:200,
                               step:.1,
                               value:defaults.threshold,
                               slide: function(event, ui) {
                                 $("#threshold_value").text(ui.value);
                               },
                               change: function (event, ui) {
                                 go();
                               }});
    $("#threshold_value").text(defaults.threshold);
    $("#font_size").slider({range: true,
                               min: 0,
                               max: 50,
                               step: .1,
                               values: [defaults.font_size_min, defaults.font_size_max],
                               slide: function(event, ui) {
                                 $("#font_size_value_min").text(ui.values[0]);
                                 $("#font_size_value_max").text(ui.values[1]);
                               },
                               change: function (event, ui) {
                                 go();
                               }});
    $("#font_size_value_min").text($("#font_size").slider("values", 0));
    $("#font_size_value_max").text($("#font_size").slider("values", 1));




    // populate the fonts dropowns
    $("#font").html("<option>"+Fonts.join("</option><option>")+"</option>");
    $("#font").change(function() { go(); });

    $("#input_thumb").attr("src", "dali.png");

  });
