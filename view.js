var defaults = [{
                  // Textorizer 1
                  "text":"letters\nfonts\nwords\ntext\nkerning",
                  "opacity":30,
                  "nb_strings":1000,
                  "threshold":100,
                  "font_size_min":10,
                  "font_size_max":30,
                  "output_height":450
                },{
                  // Textorizer 2
                  "text":"She knows, now, absolutely, hearing the white noise that is London, that Damien's theory of jet lag is correct: that her mortal soul is leagues behind her, being reeled in on some ghostly umbilical down the vanished wake of the plane that brought her here, hundreds of thousands of feet above the Atlantic. Souls can't move that quickly, and are left behind, and must be awaited, upon arrival, like lost luggage.", // http://www.williamgibsonbooks.com/books/pattern.asp#excerpt
                  "opacity":150,
                  "text_size":12,
                  "line_height":1,
                  "saturation":0,
                  "kerning":0,
                  "font_scale":1.5,
                  "output_height":450
                },{
                  // excoffizer
                  "opacity":30,
                  "theta":0,
                  "wiggle":10,
                  "line_height":5,
                  "sx":1,
                  "sy":1,
                  "tx":0,
                  "ty":0,
                  "output_height":450
                }];


var inputCanvas;
var inputCanvasCtx;
var aspectRatios=[];


function changeOutputHeightTo(i,newHeight)
{
  resizeOutputCanvasHeightTo(i,newHeight);
  output_height_values[i].text(newHeight);
  output_width_values[i].text(Math.floor(newHeight*aspectRatios[i]));
}

function resizeOutputCanvasHeightTo(i, height) {
  output_canvases[i].height = height;
  output_canvases[i].width = height*aspectRatios[i];
}

function go(i,openImageSeparately)
{
  buttons[i].hide(); buttons_wheels[i].show();
  output_canvases[i].style.display="none";
  // Put the pixels of the original image into the canvas
  var t = new Image();
  t.src = input_thumbs[i].attr("src");
  t.onload = function() {
    inputCanvas.width=t.width;
    inputCanvas.height=t.height;
    inputCanvasCtx.drawImage(t,0,0);
    Textorizer[i].textorize(params(i),openImageSeparately);
    buttons[i].show(); buttons_wheels[i].hide();
    output_canvases[i].style.display="block";
  };
};

// a thumbnail has been loaded, prepare the output canvas
function thumb_loaded(event,i) {
  var newImg = new Image();
  newImg.src = event.target.src;
  aspectRatios[i] = newImg.width / newImg.height;
  output_canvases[i].height = defaults[i]["output_height"];
  output_canvases[i].width = defaults[i]["output_height"] * aspectRatios[i];
  output_width_values[i].text(Math.floor(defaults[i]["output_height"]*aspectRatios[i]));
  output_height_values[i].text(Math.floor(defaults[i]["output_height"]));
}

var input_thumbs;
var output_canvases;
var output_width_values, output_height_values;
var output_heights;
var opacity_values;
var texts;
var opacities;
var buttons_wheels;
var buttons;
var preview_buttons;
var png_buttons;

$(function() {

    inputCanvas = document.getElementById("input_canvas");
    inputCanvasCtx = inputCanvas.getContext('2d');
    $("#tabs").tabs();

    input_thumbs = [$("#t1_input_thumb"), $("#t2_input_thumb"), $("#e_input_thumb")];
    buttons_wheels = [$("#t1_buttons_spinning_wheel"), $("#t2_buttons_spinning_wheel"), $("#e_buttons_spinning_wheel")];
    buttons = [$("#t1_buttons"), $("#t2_buttons"), $("#e_buttons")];

    $(".image_selector").change(function(e){
                                  var fr = new FileReader();
                                  switch(e.target) {
                                    case document.getElementById("t1_file_selector"):
                                      $("#t1_spinning_wheel").show(); $("#t1_input_thumb").hide();
                                      fr.onload = function() {
                                        $("#t1_input_thumb").attr("src",fr.result);
                                        $("#t1_spinning_wheel").hide(); $("#t1_input_thumb").show();
                                      };
                                      break;
                                    case document.getElementById("t2_file_selector"):
                                      $("#t2_spinning_wheel").show(); $("#t2_input_thumb").hide();
                                      fr.onload = function() {
                                        $("#t2_input_thumb").attr("src",fr.result);
                                        $("#t2_spinning_wheel").hide(); $("#t2_input_thumb").show();
                                      };
                                      break;
                                    case document.getElementById("e_file_selector"):
                                      $("#e_spinning_wheel").show(); $("#e_input_thumb").hide();
                                      fr.onload = function() {
                                        $("#e_input_thumb").attr("src",fr.result);
                                        $("#e_spinning_wheel").hide(); $("#e_input_thumb").show();
                                      };
                                      break;
                                    }
                                    fr.readAsDataURL(e.target.files[0]);
                                  });

    // only re activate the buttons when the image is loaded **FIXME - image could already be loaded (if we reselect the existing URL)
    $("#t1_input_thumb").load(function(e){
                                $("#t1_spinning_wheel").hide();
                                $("#t1_input_thumb").show();
                                thumb_loaded(e,0);
                              });
    $("#t2_input_thumb").load(function(e){
                                $("#t2_spinning_wheel").hide();
                                $("#t2_input_thumb").show();
                                thumb_loaded(e,1);
                              });
    $("#e_input_thumb").load(function(e){
                               $("#e_spinning_wheel").hide();
                               $("#e_input_thumb").show();
                               thumb_loaded(e,2);
                              });


    preview_buttons = [$("#t1_preview_button"), $("#t2_preview_button"), $("#e_preview_button")];
    png_buttons = [$("#t1_png_button"), $("#t2_png_button"),$("#e_png_button")];
    texts = [$("#t1_text"), $("#t2_text"),$("#e_text")];
    opacities = [$("#t1_opacity"), $("#t2_opacity"), $("#e_opacity")];
    opacity_values = [$("#t1_opacity_value"), $("#t2_opacity_value"), $("#e_opacity_value")];
    // no jquery on line below. We need the raw node values since we're operating on the attributes directly
    output_canvases = [document.getElementById("t1_output_canvas"), document.getElementById("t2_output_canvas"), document.getElementById("e_output_canvas")];
    output_heights = [$("#t1_output_height"), $("#t2_output_height"), $("#e_output_height")];
    output_width_values = [$("#t1_output_width_value"), $("#t2_output_width_value"), $("#e_output_width_value")];
    output_height_values = [$("#t1_output_height_value"), $("#t2_output_height_value"), $("#e_output_height_value")];

    output_heights[0].slider({min:100,
                              max:2000,
                              step: 1,
                              value:defaults[0]["output_height"],
                              slide: function(event, ui) {
                                changeOutputHeightTo(0,ui.value);
                              }});
    output_heights[1].slider({min:100,
                              max:2000,
                              step: 1,
                              value:defaults[1]["output_height"],
                              slide: function(event, ui) {
                                changeOutputHeightTo(1,ui.value);
                              }});
    output_heights[2].slider({min:100,
                              max:2000,
                              step: 1,
                              value:defaults[2]["output_height"],
                              slide: function(event, ui) {
                                changeOutputHeightTo(2,ui.value);
                              }});

    opacities[0].slider({min:0,
                         max:255,
                         value:defaults[0]["opacity"],
                         slide: function(event, ui) {
                           opacity_values[0].text(ui.value);
                         }});
    opacities[1].slider({min:0,
                         max:255,
                         value:defaults[1]["opacity"],
                         slide: function(event, ui) {
                           opacity_values[1].text(ui.value);
                         }});
    opacities[2].slider({min:0,
                         max:255,
                         value:defaults[2]["opacity"],
                         slide: function(event, ui) {
                           opacity_values[2].text(ui.value);
                         }});

    for (var i=0;i<=2;i++) {
      opacity_values[i].text(defaults[i]["opacity"]);
      output_height_values[i].text(defaults[i]["output_height"]);
      preview_buttons[i].button();
      png_buttons[i].button();
    }

    texts[0].val(defaults[0]["text"]);
    texts[1].val(defaults[1]["text"]);

    /* specific settings */
    $("#t1_nb_strings").slider({min:100,
                                max:100000,
                                value:defaults[0]["nb_strings"],
                                slide: function(event, ui) {
                                  $("#t1_nb_strings_value").text(ui.value);
                                }});
    $("#t1_nb_strings_value").text(defaults[0]["nb_strings"]);
    $("#t1_threshold").slider({min:0,
                               max:200,
                               step:.1,
                               value:defaults[0]["threshold"],
                               slide: function(event, ui) {
                                 $("#t1_threshold_value").text(ui.value);
                               }});
    $("#t1_threshold_value").text(defaults[0]["threshold"]);
    $("#t1_font_size").slider({range: true,
                               min: 0,
                               max: 50,
                               step: .1,
                               values: [defaults[0]["font_size_min"], defaults[0]["font_size_max"]],
                               slide: function(event, ui) {
                                 $("#t1_font_size_value_min").text(ui.values[0]);
                                 $("#t1_font_size_value_max").text(ui.values[1]);
                               }});
    $("#t1_font_size_value_min").text($("#t1_font_size").slider("values", 0));
    $("#t1_font_size_value_max").text($("#t1_font_size").slider("values", 1));


    $("#t2_text_size").slider({min:4,
                               max:50,
                               step: .1,
                               value:defaults[1]["text_size"],
                               slide: function(event, ui) {
                                 $("#t2_text_size_value").text(ui.value);
                               }});
    $("#t2_text_size_value").text(defaults[1]["text_size"]);

    $("#t2_line_height").slider({min:0.5,
                                 max:3,
                                 step: .05,
                                 value:defaults[1]["line_height"],
                                 slide: function(event, ui) {
                                   $("#t2_line_height_value").text(ui.value);
                                 }});
    $("#t2_line_height_value").text(defaults[1]["line_height"]);

    $("#t2_saturation").slider({min:0,
                                max:255,
                                value:defaults[1]["saturation"],
                                slide: function(event, ui) {
                                  $("#t2_saturation_value").text(ui.value);
                                }});
    $("#t2_saturation_value").text(defaults[1]["saturation"]);

    $("#t2_kerning").slider({min:-.5,
                             max:.5,
                             step: .05,
                             value:defaults[1]["kerning"],
                             slide: function(event, ui) {
                               $("#t2_kerning_value").text(ui.value);
                             }});
    $("#t2_kerning_value").text(defaults[1]["kerning"]);

    $("#t2_font_scale").slider({min:0,
                                max:5,
                                step: .05,
                                value:defaults[1]["font_scale"],
                                slide: function(event, ui) {
                                  $("#t2_font_scale_value").text(ui.value);
                                }});
    $("#t2_font_scale_value").text(defaults[1]["font_scale"]);

    // excoffizer
    $("#e_theta").slider({min:0,
                          max:180,
                          step: .1,
                          value:defaults[2]["theta"],
                          slide: function(event, ui) {
                            $("#e_theta_value").text(ui.value);
                          }});
    $("#e_theta_value").text(defaults[2]["theta"]);
    $("#e_wiggle").slider({min:0,
                           max:30,
                           step: .1,
                           value:defaults[2]["wiggle"],
                           slide: function(event, ui) {
                             $("#e_wiggle_value").text(ui.value);
                           }});
    $("#e_wiggle_value").text(defaults[2]["wiggle"]);
    $("#e_line_height").slider({min:1,
                                max:100,
                                step: 1,
                                value:defaults[2]["line_height"],
                                slide: function(event, ui) {
                                  $("#e_line_height_value").text(ui.value);
                                }});
    $("#e_line_height_value").text(defaults[2]["theta"]);
    $("#e_sx").slider({min:0,
                       max:2,
                       step: 0.01,
                       value:defaults[2]["sx"],
                       slide: function(event, ui) {
                         $("#e_sx_value").text(ui.value);
                       }});
    $("#e_sx_value").text(defaults[2]["sx"]);
    $("#e_sy").slider({min:0,
                       max:2,
                       step: 0.01,
                       value:defaults[2]["sy"],
                       slide: function(event, ui) {
                         $("#e_sy_value").text(ui.value);
                       }});
    $("#e_sy_value").text(defaults[2]["sy"]);
    $("#e_tx").slider({min:0,
                       max:10,
                       step: 0.01,
                       value:defaults[2]["tx"],
                       slide: function(event, ui) {
                         $("#e_tx_value").text(ui.value);
                       }});
    $("#e_tx_value").text(defaults[2]["tx"]);
    $("#e_ty").slider({min:0,
                       max:10,
                       step: 0.01,
                       value:defaults[2]["ty"],
                       slide: function(event, ui) {
                         $("#e_ty_value").text(ui.value);
                       }});
    $("#e_ty_value").text(defaults[2]["ty"]);

  });

function params(i) {
  var params={
    inputCanvas: inputCanvas,
    opacity: opacities[i].slider('value'),
    outputHeight: output_heights[i].slider('value'),
    outputCanvas: output_canvases[i]
  };
  switch(i) {
  case 0:
    params["text"] = texts[0].val();
    params["nb_strings"] = $("#t1_nb_strings").slider('value');
    params["threshold"] = $("#t1_threshold").slider('value');
    params["font_size_min"] = $("#t1_font_size").slider('values',0);
    params["font_size_max"] = $("#t1_font_size").slider('values',1);
    params["font"] = $('#t1_font :selected').text();
    break;
  case 1:
    params["text"] = texts[1].val();
    params["text_size"] = $("#t2_text_size").slider('value');
    params["line_height"] = $("#t2_line_height").slider('value');
    params["saturation"] = $("#t2_saturation").slider('value');
    params["kerning"] = $("#t2_kerning").slider('value');
    params["font_scale"] = $("#t2_font_scale").slider('value');
    params["font"] = $('#t2_font :selected').text();
    break;
  case 2:
    params["theta"] = $("#e_theta").slider('value');
    params["wiggle"] = $("#e_wiggle").slider('value');
    params["line_height"] = $("#e_line_height").slider('value');
    params["sx"] = $("#e_sx").slider('value');
    params["sy"] = $("#e_sy").slider('value');
    params["tx"] = $("#e_tx").slider('value');
    params["ty"] = $("#e_ty").slider('value');
    break;
  }
  return params;
}

