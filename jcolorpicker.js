'using strict'

var JColorpicker = (function() {

  var colorpicker = {};

  var holderEl = null
    , canvasEl = null
    , showCanvas = false
    , ctx = null
    , parentHolder = document.createElement('div')
    , draggingMode = false
    , initColor = null
    , element = null
    , hueHex = null
    , baseHex = null
    , cpX = 0
    , cpY = 0
    , hueY = 0
    , valueAttr = null
    , hexInput = null
    , options = {};

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
    , HUE_SLIDER_POSY = 5
    , POINT_RADIUS = 3;

  var initElements = function(el) {
    var wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'jc-wrapper');

    el.parentNode.insertBefore(wrapper, el.nextSibling);
    el.style.display = 'none';

    holderEl = createHolderChild('<div class="jc-input"></div>');
    wrapper.appendChild(holderEl);

    canvasEl = createHolderChild('<canvas width="300" height="200" id="jc-canvas" style="display:none;"></canvas>');
    wrapper.appendChild(canvasEl);

    if (options.showHex) {
      hexInput = document.createElement('input');
      hexInput.setAttribute('type', 'text');
      hexInput.setAttribute('id', 'jc-hex');
      hexInput.style.display = 'none';
      wrapper.appendChild(hexInput);
    }

    ctx = canvasEl.getContext('2d');
  };

  var createHolderChild = function(html) {
    parentHolder.innerHTML = html;

    return parentHolder.children[0];
  };

  var setHolderBackground = function(hex) {
    holderEl.style.background = hex;
  };

  var setValueAttribute = function(val) {
    holderEl.setAttribute(valueAttr, val);
  };

  var initHandlers = function() {
    holderEl.addEventListener('click', holderClickHandler);

    canvasEl.addEventListener('click', canvasClickHandler);
    canvasEl.addEventListener('mousedown', canvasMouseDownHandler);
    canvasEl.addEventListener('mouseup', canvasMouseUpHandler);
    canvasEl.addEventListener('mousemove', canvasMouseMoveHandler);
  };

  var holderClickHandler = function() {
    toggleCanvas();
  };

  var canvasClickHandler = function(e) {
    var coordinates = this.getBoundingClientRect()
      , x
      , y;

    x = e.pageX - coordinates.left;
    y = e.pageY - coordinates.top;

    ctx.beginPath();
    ctx.rect(COLORPICKER_POSX, COLORPICKER_POSY,
      COLORPICKER_WIDTH, COLORPICKER_HEIGHT);

    if (ctx.isPointInPath(x, y)) {
      if (!draggingMode) {
        updateFromColorpicker(x, y);
      }

      return;
    }

    ctx.beginPath();
    ctx.rect(HUE_POSX, HUE_POSY, HUE_WIDTH, HUE_HEIGHT);

    if (ctx.isPointInPath(x, y)) {
      if (!draggingMode) {
        updateFromHue(x, y);
      }

      return;
    }
  };

  var canvasMouseMoveHandler = function(e) {
    var coordinates = this.getBoundingClientRect()
      , x
      , y;

    x = e.pageX - coordinates.left;
    y = e.pageY - coordinates.top;

    ctx.beginPath();
    ctx.rect(HUE_POSX, HUE_POSY, HUE_WIDTH, HUE_HEIGHT);

    if (ctx.isPointInPath(x, y)) {
      if (draggingMode) {
        updateFromHue(x, y);
      }

      canvasEl.style.cursor = 'pointer';
      return;
    }

    ctx.beginPath();
    ctx.rect(
      COLORPICKER_POSX, COLORPICKER_POSY,
      COLORPICKER_WIDTH, COLORPICKER_HEIGHT);

    if (ctx.isPointInPath(x, y)) {
      if (draggingMode) {
        updateFromColorpicker(x, y);
      }

      canvasEl.style.cursor = 'crosshair';
      return;
    }

    // Return the cursor to the default style
    canvasEl.style.cursor = 'default';
  };

  var canvasMouseDownHandler = function(e) {
    draggingMode = true;
  };

  var canvasMouseUpHandler = function(e) {
    draggingMode = false;
  };

  var updateFromColorpicker = function(x, y) {
    var hex = calculateColor(x, y);
    setHolderBackground(hex);
    setValueAttribute(hex);

    clearCanvas();
    drawColorpicker(baseHex);
    drawHue();
    drawHueSlider(hueY);
    drawColorPoint(x, y);

    cpX = x;
    cpY = y;

    if (options.showHex) hexInput.value = hex;
  };

  var updateFromHue = function(x, y) {
    var hueHex = calculateColor(x, y)
      , hex = null;

    clearCanvas();
    drawColorpicker(hueHex);
    drawHue();
    drawHueSlider(y);
    drawColorPoint(cpX, cpY);

    hex = calculateColor(cpX, cpY);

    setHolderBackground(hex);
    setValueAttribute(hex);

    if (options.showHex) hexInput.value = hex;
  };

  var toggleCanvas = function() {
    showCanvas = !showCanvas;
    canvasEl.style.display = showCanvas ?  'block' : 'none';

    if (showCanvas) cacheColorpicker();

    if (options.showHex) hexInput.style.display = showCanvas ?  'block' : 'none';
  };

  var clearCanvas = function() {
    ctx.clearRect(
      0, 0,
      CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  var drawColorpicker = function(hex) {
    var gradientLeft
      , gradientTop;

    ctx.beginPath();
    ctx.rect(
      COLORPICKER_POSX, COLORPICKER_POSY,
      COLORPICKER_WIDTH, COLORPICKER_HEIGHT);
    ctx.fillStyle = hex;
    ctx.fill();
    baseHex = hex;

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
    hueY = y;
  };

  var drawColorPoint = function(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, POINT_RADIUS, 0, 2 * Math.PI, false);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + 1, y + 1, POINT_RADIUS, 0, 2 * Math.PI, false);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  };

  var calculateColor = function(x, y) {
    var imgData
      , red
      , green
      , blue
      , alpha;

    imgData = ctx.getImageData(x, y, 1, 1).data;

    red = imgData[0];
    green = imgData[1];
    blue = imgData[2];
    alpha = imgData[3];

    return (rgbToHex(red, green, blue));
  };

  var rgbToHex = function(r, g, b) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  };

  var componentToHex = function(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  var cacheColorpicker = function() {
    var cache = {};

    for (var i = COLORPICKER_POSX; i < COLORPICKER_WIDTH + COLORPICKER_POSX; i++) {
      for (var j = COLORPICKER_POSY; j < COLORPICKER_HEIGHT + COLORPICKER_POSY; j++) {
        cache[j] = ctx.getImageData(i, j, 1, 1).data;
      }
    }

    console.log(cache);
  };

  /**
   * PUBLIC METHODS
   */

  colorpicker.init = function(opts) {
    // TODO: default options, override
    options = opts;

    if (typeof opts.el === 'string') {
      this.element = document.querySelector(opts.el);
    } else if (typeof opts.el === 'object') {
      this.element = opts.el;
    }

    // TODO: recognize format of color.
    baseHex = opts.initColor;
    valueAttr = opts.valueAttr;

    initElements(this.element);
    initHandlers();
    setHolderBackground(opts.initColor);
    setValueAttribute(opts.initColor);

    drawColorpicker(baseHex);
    hexInput.value = baseHex;
    drawHue();
    drawHueSlider(HUE_SLIDER_POSY);
    drawColorPoint(cpX, cpY);
  };

  return colorpicker;
})();