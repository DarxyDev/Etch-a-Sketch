//internal variables
let sketchContainer = document.getElementById('sketchContainer');
let sketchSizeX = 30;
let sketchSizeY = 30;
let renderedX = 30;
let renderedY = 30;
let pixelElements = new Array(sketchSizeX * sketchSizeY);
//flags
let canvasClear = true;
let rendering = false;
let adjustForRoundingError = true;
let lockedAspect = true;
//constants
const DEFAULT_PIXEL_BG = '';
const MAX_SIZE = 100;
const MIN_SIZE = 1;

//testing/user variables
let pixelColor = 'black';
let userAdjustRounding = 1.04;

//event functions
document.addEventListener('mousedown', setMouseDown);
let mouseDown = false;
function setMouseDown(e) {
    mouseDown = true;
}
document.addEventListener('mouseup', removeMouseDown);
function removeMouseDown(e) {
    mouseDown = false;
}
function setBackgroundHover(e) {
    if (mouseDown) e.target.style.backgroundColor = pixelColor;
}
function setBackgroundClick(e) {
    e.target.style.backgroundColor = pixelColor;
    e.preventDefault(); //Reminder: This MIGHT cause issues. It did on setBackgroundHover
}
//constructor functions
function pxToVh(px) {
    let documentHeight = document.documentElement.offsetHeight || document.documentElement.clientHeight;
    return px / documentHeight * 100;
}
function resizeSketchContainerX() {
    let widthRatio = sketchSizeX / sketchSizeY;
    let containerHeight = pxToVh(sketchContainer.offsetHeight);
    sketchContainer.style.width = `${containerHeight * widthRatio}vh`;
}
function setPixelAttributes(element, index) {
    //set size
    let percentSizeX = 100 / sketchSizeX;
    let percentSizeY = 100 / sketchSizeY;
    let roundingAdjust = 1;
    if (adjustForRoundingError) roundingAdjust = userAdjustRounding;
    element.style.width = `${percentSizeX * roundingAdjust}%`;
    element.style.height = `${percentSizeY * roundingAdjust}%`;
    //set position
    element.style.left = `${index % sketchSizeX * percentSizeX}%`;
    element.style.top = `${Math.floor(index / sketchSizeX) * percentSizeY}%`;
    //add event listeners
    element.addEventListener('mouseover', setBackgroundHover);
    element.addEventListener('mousedown', setBackgroundClick);
}
function createPixelElement(index = 0) {
    let pElement = document.createElement('div');
    pElement.classList.add('sketchPixel');
    return pElement;
}
function removeSketchBox() {
    pixelElements.forEach(element => element.remove());
    pixelElements = new Array(sketchSizeX * sketchSizeY);
}
function createSketchBox(size = sketchSizeX * sketchSizeY) {
    removeSketchBox();
    resizeSketchContainerX();
    if (pixelElements != undefined) pixelElements.forEach(element => element.remove())
    for (let i = 0; i < size; i++) {
        let pixelElement = createPixelElement();
        pixelElements[i] = pixelElement;
        sketchContainer.appendChild(pixelElement);
        setPixelAttributes(pixelElement, i);
    }
    renderedX = sketchSizeX;
    renderedY = sketchSizeY;
}
//options input
//options misc functions
function addPixelBorder() {
    pixelElements.forEach(element => element.classList.add('pixelBorder'));
}
function removePixelBorder() {
    pixelElements.forEach(element => element.classList.remove('pixelBorder'));
}

// options:canvas size
const xSlider = document.getElementById('sliderSizeX');
xSlider.max = MAX_SIZE;
xSlider.min = MIN_SIZE;
const xText = document.getElementById('sliderTextX');
xText.value = xSlider.value;
const ySlider = document.getElementById('sliderSizeY');
ySlider.max = MAX_SIZE;
ySlider.min = MIN_SIZE;
const yText = document.getElementById('sliderTextY');
yText.value = ySlider.value;
xSlider.oninput = () => {
    if (lockedAspect) setAllSliderTextValue(xSlider.value);
    else xText.value = xSlider.value;
    sketchSizeX = xSlider.value;
    sketchSizeY = ySlider.value;
    setDrawCanvasButtonText();
}
xText.oninput = () => {
    setValidSliderInput(xText, xSlider);
    if (lockedAspect) setAllSliderTextValue(xText.value);
    sketchSizeX = xSlider.value;
    sketchSizeY = ySlider.value;
    setDrawCanvasButtonText();
}
xText.onblur = () => { xText.value = xSlider.value; } //prevents blank box

ySlider.oninput = () => {
    if (lockedAspect) setAllSliderTextValue(ySlider.value);
    else yText.value = ySlider.value;
    sketchSizeX = xSlider.value;
    sketchSizeY = ySlider.value;
    setDrawCanvasButtonText();
}
yText.oninput = () => {
    setValidSliderInput(yText, ySlider);
    if (lockedAspect) setAllSliderTextValue(yText.value);
    sketchSizeX = xSlider.value;
    sketchSizeY = ySlider.value;
    setDrawCanvasButtonText();
}
yText.onblur = () => {
    yText.value = ySlider.value;
}

function setValidSliderInput(textElement, sliderElement) {
    if (textElement.value == '') return;
    let value = parseInt(textElement.value);
    if (isNaN(value)) {
        textElement.value = sliderElement.value;
        return;
    }
    if ((value < MIN_SIZE)&&(MIN_SIZE < 10)) return; //Allows MIN_SIZE >= 10 to backspace
    if(value<MIN_SIZE) value = MIN_SIZE;             //  causes minor UI issues. Should keep MIN_SIZE < 10
    else if (value > MAX_SIZE) value = MAX_SIZE;
    textElement.value = `${value}`;
    sliderElement.value = `${value}`;
}
function setAllSliderTextValue(value) { //used if aspect ratio locked
    xText.value = value;
    xSlider.value = value;
    yText.value = value;
    ySlider.value = value;
}
//options: canvas button
const drawCanvasButton = document.getElementById('drawCanvasButton');
function clearCanvas() {
    pixelElements.forEach(element => element.style.backgroundColor = DEFAULT_PIXEL_BG);
}
drawCanvasButton.onclick = () => {
    if (rendering) return;
    if (canvasClear) {
        clearCanvas();
    }
    else {
        drawCanvasButton.innerText = 'Rendering...';
        rendering = true;
        setTimeout(() => {
            createSketchBox();
            rendering = false;
            drawCanvasButton.innerText = 'Clear Canvas';
        }, 1);
        canvasClear = true;
    }
}
function setDrawCanvasButtonText() {
    if ((renderedX == sketchSizeX) && (renderedY == sketchSizeY)) {
        drawCanvasButton.textContent = 'Clear Canvas';
        canvasClear = true;
    }
    else{
        drawCanvasButton.textContent = `Render ${xSlider.value} x ${ySlider.value} Canvas`;
        canvasClear = false;
    }
}
//options: xxxx
