var defaults = {
  "opacity":30,
  "theta":30,
  "wiggle":10,
  "line_height":5,
  "sx":1,
  "sy":1,
  "tx":0,
  "ty":0,
  "output_height":450
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
    Textorizer[2].textorize({
                              inputCanvas: inputCanvas,
                              opacity: $("#opacity").slider('value'),
                              outputHeight: $("#output_height").slider('value'),
                              outputCanvas: output_canvas,
                              theta: $("#theta").slider('value'),
                              wiggle: $("#wiggle").slider('value'),
                              line_height: $("#line_height").slider('value'),
                              sx: $("#sx").slider('value'),
                              sy: $("#sy").slider('value'),
                              tx: $("#tx").slider('value'),
                              ty: $("#ty").slider('value')
                            });

    if (options.openWindow)
      window.open(output_canvas.toDataURL());

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
  $("#output_width_value").text(Math.floor(defaults.output_height * aspectRatio));
  $("#output_height_value").text(Math.floor(defaults.output_height));

  // and render a preview
  go({newWindow:false});
}

var output_canvas;

$(function() {

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

  $("#url_go").click(function (e) {
    $("#input_thumb").attr("src", $("#input_url").val());
  });

    // only re activate the buttons when the image is loaded **FIXME - image could already be loaded (if we reselect the existing URL)
    $("#input_thumb").load(function(e){
                             thumb_loaded(e,0);
                             $("#secondary_panel, #output_canvas, #input_thumb").show();
                           });


    // no jquery on line below. We need the raw node values since we're operating on the attributes directly
    output_canvas = document.getElementById("output_canvas");

    $("#output_height").slider({min:100,
                                max:2000,
                                step: 1,
                                value:defaults.output_height,
                                slide: function(event, ui) {
                                  changeOutputHeightTo(ui.value);
                                }});

    $("#opacity").slider({min:0,
                         max:255,
                         value:defaults.opacity,
                         slide: function(event, ui) {
                           $("#opacity_value").text(ui.value);
                         }});

    $("#opacity_value").text(defaults.opacity);
    $("#output_height_value").text(defaults.output_height);
    $("#preview_button").button();
    $("#png_button").button();


    $("#theta").slider({min:0,
                          max:180,
                          step: .1,
                          value:defaults.theta,
                          slide: function(event, ui) {
                            $("#theta_value").text(ui.value);
                          }});
    $("#theta_value").text(defaults.theta);
    $("#wiggle").slider({min:0,
                           max:30,
                           step: .1,
                           value:defaults.wiggle,
                           slide: function(event, ui) {
                             $("#wiggle_value").text(ui.value);
                           }});
    $("#wiggle_value").text(defaults.wiggle);
    $("#line_height").slider({min:1,
                                max:100,
                                step: 1,
                                value:defaults.line_height,
                                slide: function(event, ui) {
                                  $("#line_height_value").text(ui.value);
                                }});
    $("#line_height_value").text(defaults.theta);
    $("#sx").slider({min:0,
                       max:2,
                       step: 0.01,
                       value:defaults.sx,
                       slide: function(event, ui) {
                         $("#sx_value").text(ui.value);
                       }});
    $("#sx_value").text(defaults.sx);
    $("#sy").slider({min:0,
                       max:2,
                       step: 0.01,
                       value:defaults.sy,
                       slide: function(event, ui) {
                         $("#sy_value").text(ui.value);
                       }});
    $("#sy_value").text(defaults.sy);
    $("#tx").slider({min:0,
                       max:10,
                       step: 0.01,
                       value:defaults.tx,
                       slide: function(event, ui) {
                         $("#tx_value").text(ui.value);
                       }});
    $("#tx_value").text(defaults.tx);
    $("#ty").slider({min:0,
                       max:10,
                       step: 0.01,
                       value:defaults.ty,
                       slide: function(event, ui) {
                         $("#ty_value").text(ui.value);
                       }});
    $("#ty_value").text(defaults.ty);


  });
