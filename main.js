//canvas
let canvasElement = document.getElementById('canvasTest');
let ctx = canvasElement.getContext('2d');
let canvSizeMulti = 10;

function setCanvasSize(){
    let canvSizeX = renderedX * canvSizeMulti;
    let canvSizeY = renderedY * canvSizeMulti;
    canvasElement.style.height = `${canvSizeY}px`;
    canvasElement.style.width = `${canvSizeX}px`;
    ctx.canvas.width = canvSizeX;
    ctx.canvas.height = canvSizeY;
    canvasElement.style.width = canvSizeX;
    canvasElement.style.height = canvSizeY;
}
function setCtx(){
    for(let i = 0; i < pixelElements.length; i++){
        let xPos = i % renderedX;
        let yPos = 0;
        if(i != 0) yPos = Math.floor(i / renderedX);
        xPos *= canvSizeMulti;
        yPos *= canvSizeMulti;
        ctx.fillStyle = pixelElements[i].style.backgroundColor;
        ctx.fillRect(xPos,yPos,canvSizeMulti,canvSizeMulti);
    }
}


let downloadBtn = document.getElementById('downloadBtn');
let downloadLink = document.getElementById('downloadLink');
downloadBtn.style.backgroundColor = 'white';
downloadBtn.addEventListener('click', downloadImage);
function downloadImage(){
    setCanvasSize();
    setCtx();
    downloadLink.href = canvasElement.toDataURL();
    downloadLink.click();

}