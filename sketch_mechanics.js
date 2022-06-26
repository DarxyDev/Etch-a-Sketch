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
const DEFAULT_PIXEL_BG = '';
const MAX_SIZE = 100;
const MIN_SIZE = 10;
//tool names
const TOOL_DRAW = 'draw';
const TOOL_FILL = 'fill';

//testing/user variables
let currentTool = TOOL_DRAW;
let pixelColor = '#000000';
let userAdjustRounding = 1.04;

//event functions
document.addEventListener('mousedown', setMouseDown);
let mouseDown = false;
function setMouseDown(e) {
    mouseDown = true;
    currentAction = new Array();
}
document.addEventListener('mouseup', removeMouseDown);
function removeMouseDown(e) {
    mouseDown = false;
    if (currentAction.length > 0) pushAction(currentAction);
}
function pixelHover(e) {
    if (mouseDown && (currentTool == TOOL_DRAW)) {
        let index = getPixelIndex(e.target);
        pushCurrentAction(index, e.target.style.backgroundColor, pixelColor);
        e.target.style.backgroundColor = pixelColor;
    }
}
function pixelClick(e) {
    if (colorFocus) return; //prevents click while color menu open
    switch (currentTool) {
        case TOOL_DRAW:
            pushAction(createAction(getPixelIndex(e.target), e.target.style.backgroundColor, pixelColor));
            e.target.style.backgroundColor = pixelColor;
            break;
        case TOOL_FILL:
            console.log('algorithm here.');
            break;
        default:
    }
}
function getPixelIndex(pixel) {
    return parseInt(pixel.id.slice(6))
}
//render functions
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
    if (adjustForRoundingError) {
        element.style.width = `calc(${percentSizeX}% + 1px)`; //+1px corrects rounding errors using %
        element.style.height = `calc(${percentSizeY}% + 1px)`;///might change to pixel, but would need to
    } else {                                                  ///adjust pixel size manually on resize
        element.style.width = `${percentSizeX}%`;
        element.style.height = `${percentSizeY}%`;

    }
    //set position
    element.style.left = `${index % sketchSizeX * percentSizeX}%`;
    element.style.top = `${Math.floor(index / sketchSizeX) * percentSizeY}%`;
    //set event listeners
    element.addEventListener('mouseover', pixelHover);
    element.addEventListener('mousedown', pixelClick);
    //set background
    element.style.backgroundColor = DEFAULT_PIXEL_BG;
    //set id
    element.setAttribute('id', `pixel-${index}`);

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
    resetVariables();
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
function setArrayAll(arr, element = 0) {
    for (let i = 0; i < arr.length; i++) arr[i] = element;
}
//options input
//options misc functions
function addPixelBorder() {
    pixelElements.forEach(element => element.classList.add('pixelBorder'));
}
function removePixelBorder() {
    pixelElements.forEach(element => element.classList.remove('pixelBorder'));
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
    resetVariables();
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
//undo + redo actions
let actionArray = new Array();
let undoArray = new Array();
let currentAction = new Array();

function createAction(pixelIndex, previousColor, newColor) {
    return [pixelIndex, previousColor, newColor];
}
function pushCurrentAction(pixelIndex, previousColor, newColor) {
    currentAction.push(createAction(pixelIndex, previousColor, newColor));
}
function pushAction(action) {
    if ((action == undefined) || action.length == 0) return console.log('action undefined');
    actionArray.push(action);
    return console.log(`push:\n${action}`);
}
function popAction() {
    let action = actionArray.pop();
    undoArray.push(action);
    return action;
}
function popUndoAction(){
    let action = undoArray.pop();
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
    if(undoArray.length <= 0) return;
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
//page init
function resetVariables(){
    actionArray = new Array();
    undoArray = new Array();
    currentAction = new Array();
}
async function initPage() {
    if (sketchContainer.offsetHeight == 0) {
        console.log('Error: sketchContainer not loaded in DOM. Retrying in 20ms.');
        setTimeout(initPage, 20);
    }
    else {
        createSketchBox();
        setDrawCanvasButtonText();
    }
}