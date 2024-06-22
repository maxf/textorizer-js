var output_canvas;
var aspectRatio;

function changeOutputHeightTo(newHeight)
{
  resizeOutputCanvasHeightTo(newHeight);
  $("#output_height_value").text(newHeight);
  $("#output_width_value").text(Math.floor(newHeight*aspectRatio));
}
function resizeOutputCanvasHeightTo(height) {
  output_canvas.height = height;
  output_canvas.width = height*aspectRatio;
}
