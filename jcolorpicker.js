'using strict'

var JColorpicker = (function() {

  var colorpicker = {
    color: null,
    element: null
  };

  var holderEl = null
    , canvasEl = null
    , showCanvas = false
    , ctx = null
    , parentHolder = document.createElement('div')
    , draggingMode = false;

  // constants
  var CANVAS_WIDTH = 400
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
    , HUE_SLIDER_POSY = 5;

  var initElements = function(el) {
    el.style.display = 'none';

    holderEl = createHolderChild('<div class="jc-input"></div>');
    el.parentNode.insertBefore(holderEl, el.nextSibling);

    canvasEl = createHolderChild('<canvas width="300" height="200" id="jc-canvas" style="display:none;"></canvas>');
    el.parentNode.insertBefore(canvasEl, el.nextSibling);

    ctx = canvasEl.getContext('2d');
  };

  var initHandlers = function() {
    holderEl.addEventListener('click', function(e) {
      toggleCanvas();
    });

    canvasEl.addEventListener('click', function(e) {
      var coordinates = this.getBoundingClientRect()
        , x
        , y
        , hex;

      x = e.pageX - coordinates.left;
      y = e.pageY - coordinates.top;

      hex = getColor(x, y);

      ctx.beginPath();
      ctx.rect(HUE_POSX, HUE_POSY, HUE_WIDTH, HUE_HEIGHT);

      if (ctx.isPointInPath(x, y)) {
        if (!draggingMode) {
          hex = getColor(x, y);
          updateColorpicker(y, hex);
        }

        return;
      }
    });

    canvasEl.addEventListener('mousedown', function(e) {
      draggingMode = true;
    });

    canvasEl.addEventListener('mouseup', function(e) {
      draggingMode = false;
    });

    canvasEl.addEventListener('mousemove', function(e) {
      var coordinates = this.getBoundingClientRect()
        , x
        , y
        , hex;

      x = e.pageX - coordinates.left;
      y = e.pageY - coordinates.top;

      ctx.beginPath();
      ctx.rect(HUE_POSX, HUE_POSY, HUE_WIDTH, HUE_HEIGHT);

      if (ctx.isPointInPath(x, y)) {
        if (draggingMode) {
          hex = getColor(x, y);
          updateColorpicker(y, hex);
        }

        canvasEl.style.cursor = 'pointer';
        return;
      }

      ctx.beginPath();
      ctx.rect(
        COLORPICKER_POSX, COLORPICKER_POSY,
        COLORPICKER_WIDTH, COLORPICKER_HEIGHT);

      if (ctx.isPointInPath(x, y)) {
        canvasEl.style.cursor = 'crosshair';
        return;
      }

      // Return the cursor to the default style
      canvasEl.style.cursor = 'default';
    });
  };

  var updateColorpicker = function(y, hex) {
    clearCanvas();
    drawColorpicker(hex);
    drawHue();
    drawHueSlider(y);
  };

  var toggleCanvas = function() {
    showCanvas = !showCanvas;
    canvasEl.style.display = showCanvas ?  'block' : 'none';
  };

  var clearCanvas = function() {
    ctx.clearRect(
      0, 0,
      CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  var createHolderChild = function(html) {
    parentHolder.innerHTML = html;
    return parentHolder.children[0];
  };

  var drawColorpicker = function(baseHex) {
    var gradientLeft
      , gradientTop;

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
  };

  var drawHue = function() {
    var gradientSlider;

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
  };

  var drawHueSlider = function(y) {
    ctx.beginPath();
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      HUE_POSX - 1, y - (HUE_SLIDER_HEIGHT / 2),
      HUE_WIDTH + 2, HUE_SLIDER_HEIGHT);
  };

  var getColor = function(x, y) {
    var imgData
      , red
      , green
      , blue
      , alpha
      , rgb
      , hex;

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
  };

  var rgbToHex = function(r, g, b) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  };

  var componentToHex = function(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  // Public methods
  colorpicker.init = function(options) {
    if (typeof options.el === 'string') {
      this.element = document.querySelector(options.el);
    } else if (typeof options.el === 'object') {
      this.element = options.el;
    }

    this.color = options.color;

    initElements(this.element);
    initHandlers();

    drawColorpicker(this.color);
    drawHue();
    drawHueSlider(HUE_SLIDER_POSY);
  };

  colorpicker.getColor = function() {
    console.log('getColor');
  };

  colorpicker.setColor = function() {
    console.log('setColor');
  };

  return colorpicker;
})();