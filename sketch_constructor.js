//general variables
let sketchContainer = document.getElementById('sketchContainer');
let sketchSizeX = 10;
let sketchSizeY = 10;
let sketchSize = sketchSizeX * sketchSizeY;
let sketchWidth = sketchContainer.offsetWidth;
let sketchHeight = sketchContainer.offsetHeight;
let pixelElements = new Array(sketchSize);

//functions
function setPixelAttributes(element, index){
    //set size
    percentSize = 100 / sketchSizeX;
    element.style.height = `${percentSize + 0.02}%`;
    element.style.width = `${percentSize + 0.02}%`;
    //set position
    element.style.left = `${index % sketchSizeX * percentSize}%`;
    element.style.top = `${Math.floor(index / sketchSizeY)* percentSize}%`;

}
function createPixelElement(index = 0){
    let pElement = document.createElement('div');
    pElement.classList.add('sketchPixel');
    return pElement;
}
function createSketchBox(size = sketchSize){
    for(let i = 0; i < sketchSize; i++){
            let pixelElement = createPixelElement();
            pixelElements[i] = pixelElement;
            sketchContainer.appendChild(pixelElement);
            setPixelAttributes(pixelElement, i);
    }
}
