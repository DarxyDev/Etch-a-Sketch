//internal variables
let sketchContainer = document.getElementById('sketchContainer');
let sketchSizeX = 30;
let sketchSizeY = 30;
let renderedX = 1;
let renderedY = 1;
let pixelElements = new Array(sketchSizeX * sketchSizeY);
let colorFocus = false;
//flags
let canvasClear = true;
let rendering = false;
let adjustForRoundingError = true;
let lockedAspect = true;
//constants
const DEFAULT_PIXEL_BG = '';//'#A5BECC';
const MAX_SIZE = 100;
const MIN_SIZE = 10;
const DARKEN_AMOUNT = -10;
const LIGHTEN_AMOUNT = 10;
const UP = 'u';
const DOWN = 'd';
const LEFT = 'l';
const RIGHT = 'r';
//tool names
const TOOL_DRAW = 'draw';
const TOOL_FILL = 'fill';
const TOOL_LIGHTEN = 'lighten';
const TOOL_DARKEN = 'darken';
const TOOL_BLEND = 'blend';
//testing/user variables
let currentTool = TOOL_DRAW;
let pixelColor = '#000000';
//prototype functions
if (Array.prototype.isEqual)
    console.log('Array.prototype.isEqual already exists. Overriding default function.');
Array.prototype.isEqual = function (array) {
    if (!Array.isArray(array)) return false;
    if (this.length !== array.length) return false;
    for (let i = 0; i < this.length; i++) {
        if (Array.isArray(this[i])) {
            if (!this[i].isEqual(array[i])) return false;
        } else if (this[i] !== array[i]) return false;
    }
    return true;
}
//event functions
document.addEventListener('mousedown', setMouseDown);
document.addEventListener('touchstart', setMouseDown);
let mouseDown = false;
function setMouseDown(e) {
    mouseDown = true;
}
document.addEventListener('mouseup', removeMouseDown);
document.addEventListener('touchend', removeMouseDown);
function removeMouseDown(e) {
    mouseDown = false;
    if (currentAction.length > 0) {
        pushCurrentToAction();
    }
}
document.addEventListener('keydown', keydownManager);
function keydownManager(e) {
    let key = e.key;
    if (!e.ctrlKey) return;
    if (key == 'z') undoAction();
    if (key == 'y') redoAction();
}
function pixelHover(e) {
    let target = e.target;
    if (e.type == 'touchmove') {
        target = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    } else if (!mouseDown) return;
    switch (currentTool) {
        case TOOL_DRAW:
            setPixelBG(getPixelIndex(target));
            break;
        case TOOL_FILL:
            break;
        case TOOL_LIGHTEN:
            shadePixelBackground(getPixelIndex(target), LIGHTEN_AMOUNT);
            break;
        case TOOL_DARKEN:
            shadePixelBackground(getPixelIndex(target), DARKEN_AMOUNT);
            break;
        case TOOL_BLEND:
            blendPixel(getPixelIndex(target));
            break;
        default:
    }
}
function pixelClick(e) {
    if (colorFocus) return; //prevents click while color menu open
    switch (currentTool) {
        case TOOL_DRAW:
            setPixelBG(getPixelIndex(e.target));
            break;
        case TOOL_FILL:
            fillPixels(e.target);
            break;
        case TOOL_LIGHTEN:
            shadePixelBackground(getPixelIndex(e.target), LIGHTEN_AMOUNT);
            break;
        case TOOL_DARKEN:
            shadePixelBackground(getPixelIndex(e.target), DARKEN_AMOUNT);
            break;
        case TOOL_BLEND:
            blendPixel(getPixelIndex(e.target));
            break;
        default:
    }
}
//set pixel background + add to currentAction
function setPixelBG(index, color = pixelColor) {
    let pixel = pixelElements[index];
    if (!pixel) return;
    pushCurrentAction(index, pixel.style.backgroundColor, color);
    pixel.style.backgroundColor = color;
}
//fill algorithm
let fillColorTarget = '';
function fillPixels(element) {
    fillColorTarget = element.style.backgroundColor;
    if (fillColorTarget == (hexToRGB(pixelColor))) return;
    fillPixelsSpread(getPixelIndex(element));
    pushCurrentToAction();
}
function hexToRGB(hex) {
    if (hex[0] !== '#') { return ''; console.log('invalid hex'); }
    let r = hex.slice(1, 3);
    let g = hex.slice(3, 5);
    let b = hex.slice(5, 7);
    r = parseInt(r, 16);
    g = parseInt(g, 16);
    b = parseInt(b, 16);
    return `rgb(${r}, ${g}, ${b})`;
}
function fillPixelsSpread(index) {
    if (index === false) return;
    if (pixelElements[index].style.backgroundColor === fillColorTarget) setPixelBG(index);
    else return;
    fillPixelsSpread(getDirectionIndex(index, UP));
    fillPixelsSpread(getDirectionIndex(index, DOWN));
    fillPixelsSpread(getDirectionIndex(index, LEFT));
    fillPixelsSpread(getDirectionIndex(index, RIGHT));
}
function getDirectionIndex(index, direction) {
    switch (direction) {
        case UP:
            index -= renderedX;
            if (index < 0) index = false;
            break;
        case DOWN:
            index += renderedX;
            if (index >= pixelElements.length) index = false;
            break;
        case LEFT:
            if (index % renderedX == 0) index = false;
            else index--;
            break;
        case RIGHT:
            if ((index + 1) % renderedX == 0) index = false;
            else index++;
            break;
        default: index = false;
    }
    return index;
}
function getPixelIndex(pixel) {
    return parseInt(pixel.id.slice(6))
}
//shade background (lighten/darken)
function shadePixelBackground(index, shadeAmount) {
    let pixel = pixelElements[index];
    if (!pixel) return;
    let bgColor = pixel.style.backgroundColor;
    if (bgColor == '') return;
    if ((bgColor == 'rgb(255, 255, 255)') && (shadeAmount >= 0)) return;
    if ((bgColor == 'rgb(0, 0, 0)') && (shadeAmount <= 0)) return;
    let bgValues = getRGBValues(bgColor);
    if (bgValues.length > 3) return;
    let hexColor = '#';
    for (let i = 0; i < 3; i++) {
        let value = bgValues[i];
        value = +value + +shadeAmount;
        if (value > 255) value = 255;
        if (value < 0) value = 0;
        value = value.toString(16).toUpperCase();
        if (value.length <= 1) value = '0' + value;
        hexColor += value;
    }
    setPixelBG(index, hexColor);
}
function getRGBValues(color) {
    if (typeof (color) !== typeof ('')) { console.log('argument not a string'); return false; }
    if (color[0] !== 'r') { console.log('color is not in rgb format'); return false; }
    color = color.slice(4, color.length - 1);
    return color.split(',');
}
//blend pixel
function blendPixel(index, blendAmount = 10) { // amount = 1 - 100%
    if (blendAmount < 1) blendAmount = 1;
    if (blendAmount > 100) blendAmount = 100;
    let pixel = pixelElements[index];
    if (!pixel) return false;
    let bgColor = pixel.style.backgroundColor;
    if (bgColor == '') return false;
    let bgValues = getRGBValues(bgColor);
    let colorValues = getRGBValues(hexToRGB(pixelColor));
    let hexColor = '#';
    for (let i = 0; i < 3; i++) {
        let bgVal = bgValues[i];
        let cVal = colorValues[i];
        bgVal *= 1 - (blendAmount / 100);
        cVal *= blendAmount / 100;
        cVal = Math.round(clampValue(bgVal + cVal, 0, 255));
        cVal = cVal.toString(16).toUpperCase();
        if (cVal.length < 2) cVal = '0' + cVal;
        hexColor += cVal;
    }
    setPixelBG(index, hexColor);
}
function clampValue(value, min, max) {
    if (+value < min) value = min;
    if (+value > max) value = max;
    return +value;
}

//options input
//options: border
let addBorderBtn = document.getElementById('addBorderBtn');
addBorderBtn.addEventListener('click', () => { togglePixelBorder() })
function addPixelBorder() {
    pixelElements.forEach(element => {
        let index = getPixelIndex(element);
        if (index == 0) element.style.borderRadius = '1vmin 0 0 0';
        else if (index == renderedX - 1) element.style.borderRadius = '0 1vmin 0 0';
        else if (index == pixelElements.length - renderedY) element.style.borderRadius = '0 0 0 1vmin';
        else if (index == pixelElements.length - 1) element.style.borderRadius = '0 0 1vmin 0';
        element.classList.add('pixelBorder')
    });
}
function removePixelBorder() {
    pixelElements.forEach(element => element.classList.remove('pixelBorder'));
}
let pixelBorderOn = false;
function togglePixelBorder(forceRemove = false) {
    if (pixelBorderOn || forceRemove) {
        removePixelBorder();
        addBorderBtn.classList.remove('pressedBoxShadow');
        addBorderBtn.textContent = 'Add Border';
        pixelBorderOn = false;
    } else {
        addPixelBorder();
        addBorderBtn.classList.add('pressedBoxShadow');
        addBorderBtn.textContent = 'Remove Border';
        pixelBorderOn = true;
    }
}

//options:canvas size
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
    if (lockedAspect) {
        let value = xText.value;
        let skipText = false;
        if (value == '') { //slider was accepting '' as input and setting value to 50%
            value = MIN_SIZE;
            skipText = true;
            yText.value = ''; //looks better with yText also appearing blank
        }
        setAllSliderTextValue(value, skipText);
    }
    sketchSizeX = xSlider.value;
    sketchSizeY = ySlider.value;
    setDrawCanvasButtonText();
}
xText.onblur = () => {  //prevents invalid value from remaining
    xText.value = xSlider.value;
    yText.value = ySlider.value; //prevents invalid value when aspect ratio locked
}

ySlider.oninput = () => {
    if (lockedAspect) setAllSliderTextValue(ySlider.value);
    else yText.value = ySlider.value;
    sketchSizeX = xSlider.value;
    sketchSizeY = ySlider.value;
    setDrawCanvasButtonText();
}
yText.oninput = () => {
    setValidSliderInput(yText, ySlider);
    if (lockedAspect) {
        let value = yText.value;
        let skipText = false;
        if (value == '') {
            value = MIN_SIZE;
            skipText = true;
            xText.value = '';
        }
        setAllSliderTextValue(value, skipText);
    }
    sketchSizeX = xSlider.value;
    sketchSizeY = ySlider.value;
    setDrawCanvasButtonText();
}
yText.onblur = () => { //prevents invalid value from remaining
    xText.value = ySlider.value; //prevents invalid value when aspect ratio locked
    yText.value = ySlider.value;
}
function setValidSliderInput(textElement, sliderElement) {
    if (textElement.value == '') {
        setAllSliderTextValue(MIN_SIZE, true);
        return;
    }
    console.log(textElement.value);
    let value = parseInt(textElement.value);
    if (isNaN(value)) {
        textElement.value = MIN_SIZE;
        sliderElement.value = MIN_SIZE;
        if (lockedAspect) setAllSliderTextValue(MIN_SIZE);
        return;
    }
    if (value < MIN_SIZE) return;
    else if (value > MAX_SIZE) value = MAX_SIZE;
    textElement.value = `${value}`;
    sliderElement.value = `${value}`;
}
function setAllSliderTextValue(value, onlySlider = false) { //used if aspect ratio locked
    if (!onlySlider) {
        xText.value = value;
        yText.value = value;
    }
    xSlider.value = value;
    ySlider.value = value;
}
//options: resetSlider
document.getElementById('sliderResetX').addEventListener('click', resetSliderX);
document.getElementById('sliderResetY').addEventListener('click', resetSliderY);
function resetSliderX() {
    if (lockedAspect) {
        setAllSliderTextValue(renderedX);
        sketchSizeY = renderedY;
    }
    else {
        xSlider.value = renderedX;
        xText.value = renderedX;
    }
    sketchSizeX = renderedX;
    setDrawCanvasButtonText();
}
function resetSliderY() {
    if (lockedAspect) {
        setAllSliderTextValue(renderedX);
        sketchSizeX = renderedX;
    }
    else {
        ySlider.value = renderedY;
        yText.value = renderedY;
        sketchSizeY = renderedY;
    }
    sketchSizeY = renderedY;
    setDrawCanvasButtonText();
}
//options: lock aspect ratio button
const aspectRatioSwitch = document.getElementById('aspectRatioSwitch');
aspectRatioSwitch.addEventListener('click', () => {
    lockedAspect = !lockedAspect;
    if (lockedAspect) {
        aspectRatioSwitch.innerText = 'Locked';
        aspectRatioSwitch.classList.add('pressedBoxShadow');
    }
    else {
        aspectRatioSwitch.innerText = 'Unlocked';
        aspectRatioSwitch.style.opacity = '1';
        aspectRatioSwitch.classList.remove('pressedBoxShadow');
    }
});
aspectRatioSwitch.addEventListener('mouseover', () => { //fix for css hover event not triggering after event listener added
    aspectRatioSwitch.style.opacity = '.7';           ///likely due to event.preventDefault() 
})
aspectRatioSwitch.addEventListener('mouseleave', () => {
    aspectRatioSwitch.style.opacity = '1';
});
//options: canvas button
const drawCanvasButton = document.getElementById('drawCanvasButton');
function clearCanvas() {
    pixelElements.forEach(element => element.style.backgroundColor = DEFAULT_PIXEL_BG);
    resetVariables(true);
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
    else {
        drawCanvasButton.textContent = `Render ${xSlider.value} x ${ySlider.value} Canvas`;
        canvasClear = false;
    }
}
//options: tools
const toolMainElement = document.getElementById('toolMain');
let toolButtons = document.getElementById('toolDropDownMenu').getElementsByClassName('dropDownItem');
for (let i = 0; i < toolButtons.length; i++) {
    let element = toolButtons.item(i)
    element.addEventListener('click', () => {
        toolMainElement.innerText = element.innerText;
        currentTool = eval(`TOOL_${element.innerText}`.toUpperCase());
        switch (currentTool) {
            case TOOL_DRAW:
                sketchContainer.style.cursor = 'crosshair';
                break;
            case TOOL_FILL:
                sketchContainer.style.cursor = 'cell';
                break;
            case TOOL_LIGHTEN:
                sketchContainer.style.cursor = 'zoom-in';
                break;
            case TOOL_DARKEN:
                sketchContainer.style.cursor = 'zoom-out';
            case TOOL_BLEND:
                sketchContainer.style.cursor = 'crosshair';
                break;
            default: ;
        }
    })
}
//options: color select
const colorSelectButton = document.getElementById('colorSelectButton');
const colorSelectInput = document.getElementById('colorSelectInput');
colorSelectInput.onclick = () => { colorFocus = true; };
colorSelectInput.onblur = () => {
    colorFocus = false;
    pixelColor = colorSelectInput.value;
};
pixelColor = colorSelectInput.value;

//undo + redo buttons
const undoButton = document.getElementById('undoButton');
const redoButton = document.getElementById('redoButton');
undoButton.addEventListener('click', () => {
    undoAction();
});
redoButton.addEventListener('click', () => {
    redoAction();
});
function disableButton(button) {
    if (!button.classList.contains('optionsButton')) return;
    button.classList.remove('optionsButton');
    button.classList.add('disabledOptionsButton');
}
function enableButton(button) {
    if (!button.classList.contains('disabledOptionsButton')) return;
    button.classList.remove('disabledOptionsButton');
    button.classList.add('optionsButton');
}
//undo + redo actions
let actionArray = new Array();
let undoArray = new Array();
let currentAction = new Array();

function createAction(pixelIndex, previousColor, newColor) {
    return [pixelIndex, previousColor, newColor];
}
function pushCurrentAction(pixelIndex, previousColor, newColor) {
    let action = createAction(pixelIndex, previousColor, newColor);
    currentAction.push(action);
    clearUndoArray();
}
function pushAction(action) {
    if ((action === undefined) || action.length == 0 || (!Array.isArray(action))) {
        console.log('action undefined');
        return;
    }
    if (!actionIsUnique(action)) return;
    actionArray.push(action);
    enableButton(undoButton);
}
function actionIsUnique(action) {
    let unique = false;
    action.forEach(element => { //checks action.newColor against action.oldColor for each action
        if (element[1] != hexToRGB(element[2])) {
            unique = true;
            return;
        }
    })
    return unique;
}
function pushCurrentToAction() {
    pushAction(currentAction);
    currentAction = new Array();
}
function popAction() {
    let action = actionArray.pop();
    enableButton(redoButton);
    if (actionArray.length <= 0) disableButton(undoButton);
    undoArray.push(action);
    return action;
}
function popUndoAction() {
    let action = undoArray.pop();
    enableButton(undoButton);
    if (undoArray.length <= 0) disableButton(redoButton);
    actionArray.push(action);
    return action;
}
function undoAction() {
    if (actionArray.length <= 0) return;
    let action = popAction();
    if (typeof (action[0]) == 'object') {
        for (let i = action.length - 1; i >= 0; i--) { //faster than array.reverse().forEach()
            let element = action[i];
            let pixel = pixelElements[element[0]];
            pixel.style.backgroundColor = element[1];
        }
    }
    else {
        pixel = pixelElements[action[0]];
        pixel.style.backgroundColor = action[1];
    }
}
function redoAction() {
    if (undoArray.length <= 0) return;
    let action = popUndoAction();
    if (typeof (action[0]) == 'object') {
        for (let i = action.length - 1; i >= 0; i--) { //faster than array.reverse().forEach()
            let element = action[i];
            let pixel = pixelElements[element[0]];
            pixel.style.backgroundColor = element[2];
        }
    }
    else {
        pixel = pixelElements[action[0]];
        pixel.style.backgroundColor = action[2];
    }
}
function clearUndoArray() {
    disableButton(redoButton);
    undoArray = new Array();
}
//page init
function resetVariables(partialReset = false) {
    actionArray = new Array();
    undoArray = new Array();
    currentAction = new Array();
    disableButton(undoButton);
    disableButton(redoButton);
    if (!partialReset) {
        togglePixelBorder(true);
    }
}
async function initPage() {
    console.log('Rendering canvas.');
    if (sketchContainer.offsetHeight == 0) {
        console.log('Error: sketchContainer not loaded in DOM. Retrying in 20ms.');
        setTimeout(initPage, 20);
    }
    else {
        createSketchBox();
        setDrawCanvasButtonText();
        console.log('Canvas rendered.');
    }
}
initPage();