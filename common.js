var $,
    output_canvas, aspectRatio;

function resizeOutputCanvasHeightTo(height) {
  "use strict";
  output_canvas.height = height;
  output_canvas.width = height*aspectRatio;
}

function changeOutputHeightTo(newHeight)
{
  "use strict";
  resizeOutputCanvasHeightTo(newHeight);
  $("#output_height_value").text(newHeight);
  $("#output_width_value").text(Math.floor(newHeight*aspectRatio));
}

