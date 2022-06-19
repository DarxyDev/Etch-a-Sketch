//general variables
let sketchContainer = document.getElementById('sketchContainer');
let sketchSizeX = 10;
let sketchSizeY = 10;
let sketchSize = sketchSizeX * sketchSizeY;
let pixelElements = new Array(sketchSize);

//User selected variables
let pixelColor = 'black';
let adjustForRoundingError = false;

//event functions
document.addEventListener('mousedown',setMouseDown);
let mouseDown = false;
function setMouseDown(e){
    mouseDown = true;
}
document.addEventListener('mouseup', removeMouseDown);
function removeMouseDown(e){
    mouseDown = false;
}
function setBackgroundHover(e){
    if(mouseDown)e.target.style.backgroundColor = pixelColor;  
}
function setBackgroundClick(e){
    e.target.style.backgroundColor = pixelColor;
    e.preventDefault(); //Reminder: This MIGHT cause issues. It did on setBackgroundHover
}
//options functions
function addPixelBorder(){
    pixelElements.forEach(element => element.classList.add('pixelBorder'));
}
function removePixelBorder(){
    pixelElements.forEach(element => element.classList.remove('pixelBorder'));
}
//constructor functions
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
    let roundingAdjust = 1;
    if(adjustForRoundingError) roundingAdjust = 1.03;
    element.style.width = `${percentSizeX * roundingAdjust}%`;
    element.style.height = `${percentSizeY * roundingAdjust}%`;
    //set position
    element.style.left = `${index % sketchSizeX * percentSizeX}%`;
    element.style.top = `${Math.floor(index / sketchSizeX)* percentSizeY}%`;
    //add event listeners
    element.addEventListener('mouseover',setBackgroundHover);
    element.addEventListener('mousedown',setBackgroundClick);
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