//  Made by qilobit
//  Checkers game

//  Constants
const container = document.querySelector('.container');
const board = document.querySelector('.board');
const buttons = document.querySelector('.buttons');
const UIRedTeamTotalMovs = document.querySelector('#red-team-movs-total');
const UIBlackTeamTotalMovs = document.querySelector('#black-team-movs-total');
const BLACK_CHIP = 'black';
const RED_CHIP = 'red';

// Vars
let blackTeamTotalMovs = 0;
let redTeamTotalMovs = 0;

//Events
document.addEventListener('DOMContentLoaded', buildBoard);


//  Funtions
function buildBoard(){
    const cols = 8;
    const rows = 8;
    const initialSetup = getInitialChipsPositions();
    for(let col = 1; col <= cols; col++){
        for(let row = 1; row <= rows; row++){
            board.appendChild(createBox(col, row, initialSetup));
        }
    }
}
function getInitialChipsPositions(){
    const rowsForChips = [1,2,3,6,7,8];
    const oddPositions = [1,3,5,7];
    const iddlePositions = [2,4,6,8];
    const output = [];
    let id = null;
    rowsForChips.forEach(row => {
        if(row % 2 == 0){
            oddPositions.forEach(col => {
                output.push(`b_${row}_${col}`);
            });
        }else{
            iddlePositions.forEach(col => {
                output.push(`b_${row}_${col}`);
            });
        }
    });
    return output;  
}
function createBox(col, row, initialSetup){
    const div = document.createElement('div');
    const id = `b_${col}_${row}`;
    div.className = 'box';
    div.id = id;
    if(col % 2 == 0){
        if([2,4,6,8].includes(row)){
            div.classList.add('black');
        }
    }else{
        if([1,3,5,7].includes(row)){
            div.classList.add('black');
        }
    }
    if(initialSetup.includes(id)){
        let color = BLACK_CHIP;
        if(col < 5){
            color = RED_CHIP;
        }
        div.appendChild(createCircle(color));
    }    
    return div;
}
function createCircle(color){
    const div = document.createElement('div');
    div.className = `base-circle ${color}-chip`;
    div.dataset.team = color;
    div.addEventListener('click', previewAvailablePositions)
    return div;
}
function previewAvailablePositions(){
    clearAllPreviews();
    const parentId = this.parentElement.id;
    const team = this.dataset.team;
    const location = getPositionFromId(parentId);
    let posibleColPosition = location.col + 1;
    if(team == BLACK_CHIP){
        posibleColPosition = location.col - 1;
    }
    let r1 = location.row + 1;//la posible posicion a la derecha
    let r2 = location.row - 1;//la posible posicion a la izquierda
    const nodeR1 = document.querySelector(`#b_${posibleColPosition}_${r1}`);
    const nodeR2 = document.querySelector(`#b_${posibleColPosition}_${r2}`);
    if(nodeR1 && nodeR1.innerHTML == ''){
        nodeR1.appendChild(createPreviewChip(parentId));
    }
    if(nodeR2 && nodeR2.innerHTML == ''){
        nodeR2.appendChild(createPreviewChip(parentId));
    }  
}
function createPreviewChip(originalChipId){
    const div = document.createElement('div');
    div.dataset.original_chip = originalChipId;
    div.className = 'base-circle preview-chip';
    div.addEventListener('click', moveToPreviewPosition);
    return div;
}
function moveToPreviewPosition(){
    const source = document.querySelector(`#${this.dataset.original_chip}`).childNodes[0];
    const target = this.parentElement;
    target.innerHTML = '';
    let sourceCopy = copyNode(source);
    target.appendChild(sourceCopy);
    source.parentElement.removeChild(source);
    updateMovsTotal(source);
    clearAllPreviews();
}
function copyNode(node){
    let copy = node.cloneNode();
    copy.addEventListener('click', previewAvailablePositions);
    return copy;
}
function getPositionFromId(id){
    const location = id.split('_');
    return {
        col: parseInt(location[1]),
        row: parseInt(location[2])
    };
}
function clearAllPreviews(){
    Array.from(document.querySelectorAll(`.preview-chip`))
    .forEach(node => node.parentElement.removeChild(node));
}
function updateMovsTotal(source){
    console.log(source);
    if(source.dataset.team == RED_CHIP){
        redTeamTotalMovs++;
        UIRedTeamTotalMovs.innerHTML = redTeamTotalMovs;
    }else{
        blackTeamTotalMovs++;
        UIBlackTeamTotalMovs.innerHTML = blackTeamTotalMovs;
    }

}