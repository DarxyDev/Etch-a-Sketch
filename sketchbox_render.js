//render functions
function pxToVh(px) {
    let documentHeight = document.documentElement.offsetHeight || document.documentElement.clientHeight;
    return px / documentHeight * 100;
}
function resizeSketchContainerX() {
    let widthRatio = sketchSizeX / sketchSizeY;
    let containerHeight = pxToVh(sketchContainer.offsetHeight);
    sketchContainer.style.width = `${containerHeight * widthRatio}vh`;
    sketchContainer.style.gridTemplateColumns = `repeat(${sketchSizeX},1fr)`;
    sketchContainer.style.gridTemplateRows = `repeat(${sketchSizeY},1fr)`;
}
function setPixelAttributes(element, index) {
    element.addEventListener('mouseover', pixelHover);
    element.addEventListener('touchmove', pixelHover);
    element.addEventListener('mousedown', pixelClick);
    //set background
    element.style.backgroundColor = DEFAULT_PIXEL_BG;
    //set id
    element.setAttribute('id', `pixel-${index}`);
    //add class(es)
    element.classList.add('sketchPixel');
}
function createPixelElement(index = 0) {
    let pElement = document.createElement('div');
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
    for (let i = 0; i < size; i++) {
        let pixelElement = createPixelElement();
        pixelElements[i] = pixelElement;
        sketchContainer.appendChild(pixelElement);
        setPixelAttributes(pixelElement, i);
    }
    renderedX = parseInt(sketchSizeX);
    renderedY = parseInt(sketchSizeY);
    initDownloadDropdown();
}