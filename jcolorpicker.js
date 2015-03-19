var canvas = document.getElementById('canvas')
  , ctx = canvas.getContext('2d')
  , CANVAS_WIDTH = 400
  , CANVAS_HEIGHT = 200
  , COLORPICKER_WIDTH = 200
  , COLORPICKER_HEIGHT = 200
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
  , rgb
  , hex
  , dragging = false;

init();

canvas.addEventListener('click', function(e) {
  coordinates = this.getBoundingClientRect();
  x = e.pageX - coordinates.left;
  y = e.pageY - coordinates.top;

  imgData = ctx.getImageData(x, y, 1, 1).data;

  red = imgData[0];
  green = imgData[1];
  blue = imgData[2];
  alpha = imgData[3];

  rgb = '(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')';
  hex = rgbToHex(red, green, blue);
  document.querySelector('#rgb input').value = rgb;
  document.querySelector('#hex input').value = hex;

  // TODO: constants
  if (x > 250 && x < 300 && y > 0 && y < 200) {
    console.log(y);
    cleanColorpicker();
    drawColorpicker(hex);
    cleanHue();
    drawHue('#FF0000');
    drawHueSlider(y);
  }
});

canvas.addEventListener('mousedown', function(e) {
  dragging = true;
});

canvas.addEventListener('mouseup', function(e) {
  dragging = false;
});

canvas.addEventListener('mousemove', function(e) {
  coordinates = this.getBoundingClientRect();
  x = e.pageX - coordinates.left;
  y = e.pageY - coordinates.top;

  // Replay the rectangle path (no need to fill() it) and test it
  ctx.beginPath();
  ctx.rect(250, 0, 50, COLORPICKER_HEIGHT);
  if (ctx.isPointInPath(x, y)) {
    if (dragging) {
      cleanColorpicker();
      drawColorpicker(hex);
      cleanHue();
      drawHue('#FF0000');
      drawHueSlider(y);
    }

    canvas.style.cursor = 'pointer';
    return;
  }

  // Replay the rectangle path (no need to fill() it) and test it
  ctx.beginPath();
  ctx.rect(0, 0, COLORPICKER_WIDTH, COLORPICKER_HEIGHT);
  if (ctx.isPointInPath(x, y)) {
    canvas.style.cursor = 'crosshair';
    return;
  }

  // Return the cursor to the default style
  canvas.style.cursor = 'default';
});

function init() {
  drawColorpicker('#FF0000');
  drawHue('#FF0000');
  drawHueSlider(1);
}

function drawColorpicker(baseHex) {
  console.log(baseHex);
  ctx.beginPath();
  ctx.rect(0, 0, COLORPICKER_WIDTH, COLORPICKER_HEIGHT);
  ctx.fillStyle = baseHex;
  ctx.fill();

  // Create gradient
  gradientLeft = ctx.createLinearGradient(
    0, COLORPICKER_HEIGHT / 2, COLORPICKER_WIDTH, COLORPICKER_HEIGHT / 2);
  gradientTop = ctx.createLinearGradient(
    COLORPICKER_WIDTH / 2, 0, COLORPICKER_WIDTH / 2, COLORPICKER_HEIGHT);

  // Add colors
  gradientLeft.addColorStop(0.000, 'rgba(255, 255, 255, 1)');
  gradientLeft.addColorStop(1.000, 'rgba(204, 154, 129, 0)');
  gradientTop.addColorStop(0.000, 'rgba(204, 154, 129, 0)');
  gradientTop.addColorStop(1.000, 'rgba(0, 0, 0, 1)');

  // Fill with gradient
  ctx.fillStyle = gradientLeft;
  ctx.fillRect(0, 0, COLORPICKER_WIDTH, COLORPICKER_HEIGHT);

  ctx.fillStyle = gradientTop;
  ctx.fillRect(0, 0, COLORPICKER_WIDTH, COLORPICKER_HEIGHT);
}

function drawHue(baseHex) {
  var gradientSlider;

  ctx.beginPath();
  // TODO: move to constants
  ctx.rect(250, 0, 50, COLORPICKER_HEIGHT);
  ctx.fillStyle = baseHex;
  ctx.fill();

  gradientSlider = ctx.createLinearGradient(300, 0, 300, 200);

  gradientSlider.addColorStop(0.000, '#ff0000');
  gradientSlider.addColorStop(0.170, '#ffff00');
  gradientSlider.addColorStop(0.330, '#00ff00');
  gradientSlider.addColorStop(0.500, '#00ffff');
  gradientSlider.addColorStop(0.670, '#0000ff');
  gradientSlider.addColorStop(0.830, '#ff00ff');
  gradientSlider.addColorStop(1.000, '#ff0000');

  // Fill with gradient
  ctx.fillStyle = gradientSlider;
  ctx.fillRect(250, 0, 50, COLORPICKER_HEIGHT);
}

function drawHueSlider(y) {
  ctx.beginPath();
  ctx.moveTo(240, y);
  ctx.lineTo(250, y);
  ctx.lineWidth = 3;

  // set line color
  ctx.strokeStyle = '#000000';
  ctx.stroke();
}

function cleanColorpicker() {
  ctx.clearRect(0, 0, COLORPICKER_WIDTH, COLORPICKER_HEIGHT);
}

function cleanHue() {
  ctx.clearRect(240, 0, 10, COLORPICKER_HEIGHT);
}

function rgbToHex(r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}
