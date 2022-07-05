//download image / canvas
let canvasElement = document.getElementById('canvasTest');
let ctx = canvasElement.getContext('2d');
let canvSizeMulti = 1;

function setCanvasSize(){
    let canvSizeX = renderedX * canvSizeMulti;
    let canvSizeY = renderedY * canvSizeMulti;
    ctx.canvas.width = canvSizeX;
    ctx.canvas.height = canvSizeY;
    canvasElement.width = canvSizeX;
    canvasElement.height = canvSizeY;
    canvasElement.style.width = canvSizeX;
    canvasElement.style.height = canvSizeY;
}
function setCtx(){
    for(let i = 0; i < pixelElements.length; i++){
        if(pixelElements[i].style.backgroundColor == '') continue;
        let xPos = i % renderedX;
        let yPos = 0;
        if(i != 0) yPos = Math.floor(i / renderedX);
        xPos *= canvSizeMulti;
        yPos *= canvSizeMulti;
        ctx.fillStyle = pixelElements[i].style.backgroundColor;
        ctx.fillRect(xPos,yPos,canvSizeMulti,canvSizeMulti);
    }
}

const downloadBtn = document.getElementById('downloadBtn');
const downloadLink = document.getElementById('downloadLink');
downloadBtn.style.backgroundColor = 'white';
downloadBtn.addEventListener('click', downloadImage);
function downloadImage(){
    setCanvasSize();
    setCtx();
    downloadLink.href = canvasElement.toDataURL();
    downloadLink.click();

}
const imgSizeMain = document.getElementById('imgSizeMain');
const imgSizeItemsCont = document.getElementById('imgSizeItems');
const IMG_ITEM_COUNT = 6;
const SIZE_MULTI_STEP = 5;
let imgSizeItems = new Array(IMG_ITEM_COUNT);
function setDownloadSizeDropDown(){
    let i = 1;
    while(i <= IMG_ITEM_COUNT){
        
        let item = document.createElement('div');
        imgSizeItems.push(item);
        item.classList.add('dropDownItem');
        if(i <= 0) item.setAttribute('data-multi', 1);
        else item.setAttribute('data-multi', i * SIZE_MULTI_STEP);
        let sizeX = renderedX;
        let sizeY = renderedY;
        if(i > 0) {
            sizeX *= i * SIZE_MULTI_STEP;
            sizeY *= i * SIZE_MULTI_STEP;
        }
        item.innerText = `${sizeX}x${sizeY}`;
        item.addEventListener('click', (e)=>{
            // if(i <= 0)canvSizeMulti = 1;
            // else canvSizeMulti = i * SIZE_MULTI_STEP;
            canvSizeMulti = e.target.getAttribute('data-multi');
            imgSizeMain.innerText = item.innerText;
            console.log(canvSizeMulti);
        })
        imgSizeItemsCont.appendChild(item);
        i++;
    }
}
function initDownloadDropdown(){
    imgSizeItems.forEach(element =>{element.remove();})
    imgSizeItems = new Array(IMG_ITEM_COUNT);
    setDownloadSizeDropDown();
}