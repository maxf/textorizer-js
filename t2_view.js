var defaults = {
    "text":"She knows, now, absolutely, hearing the white noise that is London, that Damien's theory of jet lag is correct: that her mortal soul is leagues behind her, being reeled in on some ghostly umbilical down the vanished wake of the plane that brought her here, hundreds of thousands of feet above the Atlantic. Souls can't move that quickly, and are left behind, and must be awaited, upon arrival, like lost luggage.", // http://www.williamgibsonbooks.com/books/pattern.asp#excerpt
  "opacity":150,
  "text_size":12,
  "line_height":1,
  "saturation":0,
  "kerning":0,
  "font_scale":1.5,
  "output_height":450
                };

var inputCanvas;
var inputCanvasCtx;


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
    Textorizer[1].textorize({
                              inputCanvas: inputCanvas,
                              opacity: $("#opacity").slider('value'),
                              outputHeight: $("#output_height").slider('value'),
                              outputCanvas: output_canvas,
                              text: $("#text").val(),
                              text_size: $("#text_size").slider('value'),
                              line_height: $("#line_height").slider('value'),
                              saturation: $("#saturation").slider('value'),
                              kerning: $("#kerning").slider('value'),
                              font_scale: $("#font_scale").slider('value'),
                              font: $('#font :selected').text()
                            });
    if (options.newWindow)
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
  $("#output_width_value").text(Math.floor(defaults.output_height*aspectRatio));
  $("#output_height_value").text(Math.floor(defaults.output_height));

  // and render a preview
  go({openWindow:false});
}


$(function() {

    inputCanvas = document.getElementById("input_canvas");
    inputCanvasCtx = inputCanvas.getContext('2d');
    $("#tabs").tabs();

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
                           opacity_values.text(ui.value);
                         }});

    $("#opacity_value").text(defaults.opacity);
    $("#output_height_value").text(defaults.output_height);
    $("#preview_button").button();
    $("#png_button").button();
    $("#text").val(defaults.text);

    $("#text_size").slider({min:4,
                               max:50,
                               step: .1,
                               value:defaults.text_size,
                               slide: function(event, ui) {
                                 $("#text_size_value").text(ui.value);
                               }});
    $("#text_size_value").text(defaults.text_size);

    $("#line_height").slider({min:0.5,
                                 max:3,
                                 step: .05,
                                 value:defaults.line_height,
                                 slide: function(event, ui) {
                                   $("#line_height_value").text(ui.value);
                                 }});
    $("#line_height_value").text(defaults.line_height);

    $("#saturation").slider({min:0,
                                max:255,
                                value:defaults.saturation,
                                slide: function(event, ui) {
                                  $("#saturation_value").text(ui.value);
                                }});
    $("#saturation_value").text(defaults.saturation);

    $("#kerning").slider({min:-.5,
                             max:.5,
                             step: .05,
                             value:defaults.kerning,
                             slide: function(event, ui) {
                               $("#kerning_value").text(ui.value);
                             }});
    $("#kerning_value").text(defaults.kerning);

    $("#font_scale").slider({min:0,
                                max:5,
                                step: .05,
                                value:defaults.font_scale,
                                slide: function(event, ui) {
                                  $("#font_scale_value").text(ui.value);
                                }});
    $("#font_scale_value").text(defaults.font_scale);

    // populate the fonts dropowns
    $("#font").html("<option>"+Fonts.join("</option><option>")+"</option>");


  });
