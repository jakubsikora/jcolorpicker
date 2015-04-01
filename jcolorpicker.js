'using strict'

var JColorpicker = (function() {

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
    , rgbWrapper = null
    , rInput = null
    , gInput = null
    , bInput = null
    , rgb = {}
    , options = {};

  // constants
  var CANVAS_WIDTH = 400
    , CANVAS_HEIGHT = 200
    , COLORPICKER_POSX = 0
    , COLORPICKER_POSY = 0
    , COLORPICKER_WIDTH = 200
    , COLORPICKER_HEIGHT = CANVAS_HEIGHT - 10
    , HUE_WIDTH = 20
    , HUE_HEIGHT = CANVAS_HEIGHT - 10
    , HUE_POSX = COLORPICKER_POSX + COLORPICKER_WIDTH + 10
    , HUE_POSY = 0
    , HUE_SLIDER_HEIGHT = 10
    , HUE_SLIDER_POSY = 6
    , POINT_RADIUS = 3
    , DEFAULT_HEX = '#FF0000';

  function initElements(el) {
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

    if (options.showRGB) {
      rgbWrapper = document.createElement('div');
      rgbWrapper.setAttribute('id', 'jc-rgb-wrapper');
      rgbWrapper.style.display = 'none';
      wrapper.appendChild(rgbWrapper);

      rInput = document.createElement('input');
      rInput.setAttribute('type', 'text');
      rInput.setAttribute('id', 'jc-r');
      rgbWrapper.appendChild(rInput);

      gInput = document.createElement('input');
      gInput.setAttribute('type', 'text');
      gInput.setAttribute('id', 'jc-g');
      rgbWrapper.appendChild(gInput);

      bInput = document.createElement('input');
      bInput.setAttribute('type', 'text');
      bInput.setAttribute('id', 'jc-b');
      rgbWrapper.appendChild(bInput);
    }

    ctx = canvasEl.getContext('2d');
  };

  function createHolderChild(html) {
    parentHolder.innerHTML = html;

    return parentHolder.children[0];
  };

  function setHolderBackground(hex) {
    holderEl.style.background = hex;
  };

  function setValueAttribute(val) {
    holderEl.setAttribute(valueAttr, val);
  };

  function initHandlers() {
    holderEl.addEventListener('click', holderClickHandler);

    canvasEl.addEventListener('click', canvasClickHandler);
    canvasEl.addEventListener('mousedown', canvasMouseDownHandler);
    canvasEl.addEventListener('mouseup', canvasMouseUpHandler);
    canvasEl.addEventListener('mousemove', canvasMouseMoveHandler);
    window.addEventListener('keydown', canvasKeyDownHandler);
    window.addEventListener('keyup', canvasKeyUpHandler);
  };

  function holderClickHandler() {
    toggleCanvas();
  };

  function canvasClickHandler(e) {
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

  function canvasMouseMoveHandler(e) {
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

  function canvasMouseDownHandler(e) {
    draggingMode = true;
  };

  function canvasMouseUpHandler(e) {
    draggingMode = false;
  };

  function canvasKeyDownHandler(e) {
    var c = e.keyCode;

    switch(c) {
      case 37:
        console.log('left down');
        break;
      case 38:
        console.log('up down');
        break;
      case 39:
        console.log('right down');
        break;
      case 40:
        console.log('down down');
        break;
    };
  };

  function canvasKeyUpHandler(e) {
    var c = e.keyCode;

    switch(c) {
      case 37:
        console.log('left up');
        break;
      case 38:
        console.log('up up');
        break;
      case 39:
        console.log('right up');
        break;
      case 40:
        console.log('down up');
        break;
    };
  };


  function updateFromColorpicker(x, y) {
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
    if (options.showRGB) fillRGB(hex);
  };

  function updateFromHue(x, y) {
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
    if (options.showRGB) fillRGB(hex);
  };

  function toggleCanvas() {
    showCanvas = !showCanvas;
    canvasEl.style.display = showCanvas ?  'block' : 'none';

    cacheHUE();

    if (options.showHex) hexInput.style.display = showCanvas ?  'block' : 'none';
    if (options.showRGB) rgbWrapper.style.display = showCanvas ?  'block' : 'none';
  };

  function clearCanvas() {
    ctx.clearRect(
      0, 0,
      CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  function drawColorpicker(hex) {
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

  function drawHue() {
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

  function drawHueSlider(y) {
    ctx.beginPath();
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      HUE_POSX - 1, y - (HUE_SLIDER_HEIGHT / 2),
      HUE_WIDTH + 2, HUE_SLIDER_HEIGHT);
    hueY = y;
  };

  function drawColorPoint(x, y) {
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

  function calculateColor(x, y) {
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

  function rgbToHex(r, g, b) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  };

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  function hexToRGB(hex) {
    function hexToR(h) { return parseInt((cutHex(h)).substring(0,2),16) }
    function hexToG(h) { return parseInt((cutHex(h)).substring(2,4),16) }
    function hexToB(h) { return parseInt((cutHex(h)).substring(4,6),16) }
    function cutHex(h) { return (h.charAt(0)=="#") ? h.substring(1,7) : h }

    return {
      r: hexToR(hex),
      g: hexToG(hex),
      b: hexToB(hex)
    };
  };

  function fillRGB(hex) {
    rgb = hexToRGB(hex);
    rInput.value = rgb.r;
    gInput.value = rgb.g;
    bInput.value = rgb.b;
  };

  function cacheHUE() {
    var cache = {};

    for(var i = HUE_POSY; i <= HUE_POSY + HUE_HEIGHT; i++) {
      cache[calculateColor(HUE_POSX + 1, i)] = {
        x: i,
        y: HUE_POSX
      };
    }

    console.log(cache);
  };


  function init(opts) {
    // TODO: default options, override
    options = opts;

    if (typeof opts.el === 'string') {
      this.element = document.querySelector(opts.el);
    } else if (typeof opts.el === 'object') {
      this.element = opts.el;
    }

    // TODO: recognize format of color.
    baseHex = DEFAULT_HEX;
    valueAttr = opts.valueAttr;

    initElements(this.element);
    initHandlers();
    setHolderBackground(baseHex);
    setValueAttribute(baseHex);

    drawColorpicker(baseHex);
    hexInput.value = baseHex;
    fillRGB(baseHex);

    drawHue();
    drawHueSlider(HUE_SLIDER_POSY);
    drawColorPoint(cpX, cpY);
  };

  return {
    init: init
  };
})();