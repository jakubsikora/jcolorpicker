var canvas = document.getElementById('canvas')
  , ctx = canvas.getContext('2d')
  , CANVAS_WIDTH = 200
  , CANVAS_HEIGHT = 200
  , gradientLeft
  , gradientTop
  , coordinates
  , x
  , y
  , imgData
  , red
  , green
  , blue
  , alpha
  , rgb;

init();

canvas.addEventListener("click", function(e) {
  reset();
  init();

  coordinates = this.getBoundingClientRect();
  x = e.pageX - coordinates.left;
  y = e.pageY - coordinates.top;

  ctx.fillRect(x, y, 5, 5);
  ctx.fillStyle = '#FFFFFF';

  imgData = ctx.getImageData(x, y, 1, 1).data;

  red = imgData[0];
  green = imgData[1];
  blue = imgData[2];
  alpha = imgData[3];

  rgb = '(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')';
  document.querySelector('#rgb input').value = rgb;
  document.querySelector('#hex input').value = rgbToHex(red, green, blue);
});

function init() {
  ctx.beginPath();
  ctx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#FF0000';
  ctx.fill();

  // Create gradient
  gradientLeft = ctx.createLinearGradient(0, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT / 2);
  gradientTop = ctx.createLinearGradient(CANVAS_WIDTH / 2, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT);

  // Add colors
  gradientLeft.addColorStop(0.000, 'rgba(255, 255, 255, 1)');
  gradientLeft.addColorStop(1.000, 'rgba(204, 154, 129, 0)');
  gradientTop.addColorStop(0.000, 'rgba(204, 154, 129, 0)');
  gradientTop.addColorStop(1.000, 'rgba(0, 0, 0, 1)');

  // Fill with gradient
  ctx.fillStyle = gradientLeft;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = gradientTop;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function reset() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function rgbToHex(r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}