var canvas = document.getElementById('canvas')
  , ctx = canvas.getContext('2d')
  , CANVAS_WIDTH = 400
  , CANVAS_HEIGHT = 200
  , COLORPICKER_POSX = 5
  , COLORPICKER_POSY = 5
  , COLORPICKER_WIDTH = 200
  , COLORPICKER_HEIGHT = CANVAS_HEIGHT - 10
  , HUE_WIDTH = 20
  , HUE_HEIGHT = CANVAS_HEIGHT - 10
  , HUE_POSX = COLORPICKER_POSX + COLORPICKER_WIDTH + 10
  , HUE_POSY = 5
  , HUE_SLIDER_HEIGHT = 10
  , HUE_SLIDER_POSY = 5
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

  hex = getColor(x, y);

  ctx.beginPath();
  ctx.rect(HUE_POSX, HUE_POSY, HUE_WIDTH, HUE_HEIGHT);
  if (ctx.isPointInPath(x, y)) {
    if (!dragging) {
      hex = getColor(x, y);
      updateColorpicker(y, hex);
    }

    return;
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

  ctx.beginPath();
  ctx.rect(HUE_POSX, HUE_POSY, HUE_WIDTH, HUE_HEIGHT);
  if (ctx.isPointInPath(x, y)) {
    if (dragging) {
      hex = getColor(x, y);
      updateColorpicker(y, hex);
    }

    canvas.style.cursor = 'pointer';
    return;
  }

  ctx.beginPath();
  ctx.rect(
    COLORPICKER_POSX, COLORPICKER_POSY,
    COLORPICKER_WIDTH, COLORPICKER_HEIGHT);
  if (ctx.isPointInPath(x, y)) {
    canvas.style.cursor = 'crosshair';
    return;
  }

  // Return the cursor to the default style
  canvas.style.cursor = 'default';
});

function getColor(x, y) {
  ctx.beginPath();
  ctx.rect(
    COLORPICKER_POSX, COLORPICKER_POSY,
    COLORPICKER_WIDTH, COLORPICKER_HEIGHT);
  ctx.rect(HUE_POSX, HUE_POSY, HUE_WIDTH, HUE_HEIGHT);
  if (ctx.isPointInPath(x, y)) {
    imgData = ctx.getImageData(x, y, 1, 1).data;

    red = imgData[0];
    green = imgData[1];
    blue = imgData[2];
    alpha = imgData[3];

    rgb = '(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')';
    hex = rgbToHex(red, green, blue);
    document.querySelector('#rgb input').value = rgb;
    document.querySelector('#hex input').value = hex;

    return hex;
  }
}

function updateColorpicker(y, hex) {
  cleanColorpicker();
  drawColorpicker(hex);
  cleanHue();
  drawHue('#FF0000');
  drawHueSlider(y);
}

function init() {
  drawColorpicker('#FF0000');
  drawHue('#FF0000');
  drawHueSlider(HUE_SLIDER_POSY);
}

function drawColorpicker(baseHex) {
  ctx.beginPath();
  ctx.rect(
    COLORPICKER_POSX, COLORPICKER_POSY,
    COLORPICKER_WIDTH, COLORPICKER_HEIGHT);
  ctx.fillStyle = baseHex;
  ctx.fill();

  // Create gradient
  gradientLeft = ctx.createLinearGradient(
    COLORPICKER_POSX, COLORPICKER_HEIGHT / 2,
    COLORPICKER_WIDTH, COLORPICKER_HEIGHT / 2);
  gradientTop = ctx.createLinearGradient(
    COLORPICKER_WIDTH / 2, COLORPICKER_POSY,
    COLORPICKER_WIDTH / 2, COLORPICKER_HEIGHT);

  // Add colors
  gradientLeft.addColorStop(0.000, 'rgba(255, 255, 255, 1)');
  gradientLeft.addColorStop(1.000, 'rgba(204, 154, 129, 0)');
  gradientTop.addColorStop(0.000, 'rgba(204, 154, 129, 0)');
  gradientTop.addColorStop(1.000, 'rgba(0, 0, 0, 1)');

  // Fill with gradient
  ctx.fillStyle = gradientLeft;
  ctx.fillRect(
    COLORPICKER_POSX, COLORPICKER_POSY,
    COLORPICKER_WIDTH, COLORPICKER_HEIGHT);

  ctx.fillStyle = gradientTop;
  ctx.fillRect(
    COLORPICKER_POSX, COLORPICKER_POSY,
    COLORPICKER_WIDTH, COLORPICKER_HEIGHT);
}

function drawHue(baseHex) {
  var gradientSlider;

  ctx.beginPath();
  // TODO: move to constants
  ctx.rect(HUE_POSX, HUE_POSY, HUE_WIDTH, HUE_HEIGHT);
  ctx.fillStyle = baseHex;
  ctx.fill();

  gradientSlider = ctx.createLinearGradient(
    HUE_POSX + (HUE_WIDTH / 2), HUE_POSY,
    HUE_POSX + (HUE_WIDTH / 2), HUE_HEIGHT);

  gradientSlider.addColorStop(0.000, '#ff0000');
  gradientSlider.addColorStop(0.170, '#ffff00');
  gradientSlider.addColorStop(0.330, '#00ff00');
  gradientSlider.addColorStop(0.500, '#00ffff');
  gradientSlider.addColorStop(0.670, '#0000ff');
  gradientSlider.addColorStop(0.830, '#ff00ff');
  gradientSlider.addColorStop(1.000, '#ff0000');

  // Fill with gradient
  ctx.fillStyle = gradientSlider;
  ctx.fillRect(HUE_POSX, HUE_POSY, HUE_WIDTH, HUE_HEIGHT);
}

function drawHueSlider(y) {
  ctx.beginPath();
  ctx.strokeStyle = '#555555';
  ctx.lineWidth = 2;
  ctx.strokeRect(
    HUE_POSX - 1, y - (HUE_SLIDER_HEIGHT / 2),
    HUE_WIDTH + 2, HUE_SLIDER_HEIGHT);
}

function cleanColorpicker() {
  ctx.clearRect(
    0, 0,
    CANVAS_WIDTH, CANVAS_HEIGHT);
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
