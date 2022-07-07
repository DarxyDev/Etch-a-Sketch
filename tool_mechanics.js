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
