//general variables
let sketchContainer = document.getElementById('sketchContainer');
let sketchSizeX = 10;
let sketchSizeY = 10;
let sketchSize = sketchSizeX * sketchSizeY;
let pixelElements = new Array(sketchSize);
let pixelColor = 'black';

//functions
function setBackground(e){
    e.target.style.backgroundColor = pixelColor;    
}
function addPixelBorder(){
    pixelElements.forEach(element => element.classList.add('pixelBorder'));
}
function removePixelBorder(){
    pixelElements.forEach(element => element.classList.remove('pixelBorder'));
}
function pxToVh(px){
    let documentHeight = document.documentElement.offsetHeight || document.documentElement.clientHeight;
    return px / documentHeight * 100;
}
function resizeSketchContainerX(){
    let widthRatio = sketchSizeX / sketchSizeY;
    let containerHeight = pxToVh(sketchContainer.offsetHeight);
    sketchContainer.style.width = `${containerHeight * widthRatio}vh`;
}
function setPixelAttributes(element, index){
    //set size
    let percentSizeX = 100 / sketchSizeX;
    let percentSizeY = 100 / sketchSizeY;
    element.style.width = `${percentSizeX}%`;
    element.style.height = `${percentSizeY}%`;
    //set position
    element.style.left = `${index % sketchSizeX * percentSizeX}%`;
    element.style.top = `${Math.floor(index / sketchSizeX)* percentSizeY}%`;
    //
    element.addEventListener('click',setBackground);
}
function createPixelElement(index = 0){
    let pElement = document.createElement('div');
    pElement.classList.add('sketchPixel');
    return pElement;
}
function createSketchBox(size = sketchSize){
    resizeSketchContainerX();
    if(pixelElements != undefined) pixelElements.forEach(element => element.remove())
    for(let i = 0; i < sketchSize; i++){
            let pixelElement = createPixelElement();
            pixelElements[i] = pixelElement;
            sketchContainer.appendChild(pixelElement);
            setPixelAttributes(pixelElement, i);
    }
}