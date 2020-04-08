//  Made by qilobit
//  Checkers game

//  Vars and consts
const container = document.querySelector('.container');
const board = document.querySelector('.board');
const buttons = document.querySelector('.buttons');
const UIRedTeamTotalMovs = document.querySelector('#red-team-movs-total');
const UIBlackTeamTotalMovs = document.querySelector('#black-team-movs-total');
const UIRedTeamScore = document.querySelector('#red-team-score');
const UIBlackTeamScore = document.querySelector('#black-team-score');
const BLACK_CHIP = 'black';
const RED_CHIP = 'red';
const l = console.log;
const BOARD_MIDDLE = 5;
const RIGHT = 1;
const LEFT = 2;
let blackTeamTotalMovs = 0;
let redTeamTotalMovs = 0;
let blackTeamScore = 0;
let redTeamScore = 0;

//Events
document.addEventListener('DOMContentLoaded', buildBoard);


// Elements #id format is: b_(row)_(column)

//  Funtions
function getInitialChipsPositions(){
    const rowsForChips = [1,2,3,6,7,8];
    const oddPositions = [1,3,5,7];
    const iddlePositions = [2,4,6,8];
    const output = [];
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
function buildBoard(){
    const cols = 8;
    const rows = 8;
    let box = null;
    const initialChipsPosition = getInitialChipsPositions();
    for(let row = 1; row <= rows; row++){
        for(let col = 1; col <= cols; col++){
            box = createBox(row, col, initialChipsPosition);
            board.appendChild(box);
        }
    }
}
function createBox(row, col, initialChipsPosition){
    const div = document.createElement('div');
    const id = `b_${row}_${col}`;
    div.className = 'box';
    div.id = id;
    if(isPair(col)){
        if([2,4,6,8].includes(row)){
            div.classList.add('black');
        }
    }else{
        if([1,3,5,7].includes(row)){
            div.classList.add('black');
        }
    }
    if(initialChipsPosition.includes(id)){
        const color = row < BOARD_MIDDLE ? RED_CHIP : BLACK_CHIP;
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
function createPreviewChip(originalChipId){
    const div = document.createElement('div');
    div.dataset.original_chip = originalChipId;
    div.className = 'base-circle preview-chip';
    div.addEventListener('click', moveToPreviewPosition);
    return div;
}
function createMiniChip(sourceId, teamColor, chipToEat){
    const div = document.createElement('div');
    div.className = `mini-circle ${ teamColor }`;
    div.dataset.original_chip = sourceId;
    div.title = 'Move here'
    div.addEventListener('click', () => {
        moveAfterEat(this, chipToEat);
    });
    return div;  
}
//  In this function the 
//  actual chip gets pass by reference (this)
function previewAvailablePositions(){
    clearAllEatables();
    clearAllPreviews();
    clearMiniChips();
    const currentChip = this;
    const parentId = currentChip.parentElement.id;
    const currentChipTeam = currentChip.dataset.team;
    const location = getPositionFromId(parentId);
    // Aqui se mueve a una fila debajo o arriba 
    // TODO:cambiar esto para, para poder moderse en reversa
    const posibleRowPosition = currentChipTeam == BLACK_CHIP ? location.row - 1 : location.row + 1;
    const rightColumn = location.col + 1;
    const leftColumn = location.col - 1;
    const rightBox = getElementFromPosition(posibleRowPosition, rightColumn);
    const leftBox = getElementFromPosition(posibleRowPosition, leftColumn);

    if(rightBox){
        processChipMove(parentId, rightBox, currentChipTeam, location, RIGHT);       
    }
    if(leftBox){
        processChipMove(parentId, leftBox, currentChipTeam, location, LEFT)
    }  

    function processChipMove(targetBoxId, boxElement, currentChipTeam, location, side){
        //verifica si no hay ficha en la caja
        if(boxElement.innerHTML == ''){
            //se mueve a la caja
            boxElement.appendChild(createPreviewChip(targetBoxId));
        }else{
            const rowToMov = currentChipTeam == BLACK_CHIP ? location.row - 2 : location.row + 2;
            const stepsToTake = side == RIGHT ? (location.col + 2) : (location.col - 2);
            const chip = boxElement.childNodes[0];
            const positionAfterEat = getElementFromPosition(rowToMov, stepsToTake);
            l(`rowToMov, stepsToTake ${rowToMov} ${stepsToTake}`);
            if(chip.dataset.team !== currentChipTeam && positionAfterEat && positionAfterEat.innerHTML == ''){
                boxElement.childNodes[0].classList.add('eatable');
                positionAfterEat.appendChild(createMiniChip(targetBoxId, currentChipTeam, chip));
            }else{
                l('No se puede comer');
            }            
        }  
        return 1;
    }
}
function moveAfterEat(element, chipToEat){
    l('moveAfterEat ', element, chipToEat);
    if(chipToEat.dataset.team == BLACK_CHIP){
        increaseBlackTeamScore();
    }else{

    }
    chipToEat.parentElement.removeChild(chipToEat);

    const source = document.querySelector(`#${element.dataset.original_chip}`).childNodes[0];
    const target = element.parentElement;
    target.innerHTML = '';
    let sourceCopy = copyNode(source);
    target.appendChild(sourceCopy);
    source.parentElement.removeChild(source);
    updateMovsTotal(source);
    clearAllPreviews();
    clearAllEatables();
    clearMiniChips();
}
function increaseBlackTeamScore(){
    blackTeamScore++;
    UIBlackTeamScore.innerHTML = blackTeamScore;
}
function increaseRedTeamScore(){
    redTeamScore++;
    UIRedTeamScore.innerHTML = redTeamScore;
}
function getElementFromPosition(row, col){
    return document.querySelector(`#b_${row}_${col}`);
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
    clearAllEatables();
    clearMiniChips();
}
function copyNode(node){
    let copy = node.cloneNode();
    copy.addEventListener('click', previewAvailablePositions);
    return copy;
}
function getPositionFromId(id){
    const location = id.split('_');
    return {
        row: parseInt(location[1]),
        col: parseInt(location[2])
    };
}
function clearAllPreviews(){
    removeElementsByClass('preview-chip');
}
function clearAllEatables(){
    Array.from(document.querySelectorAll(`.eatable`))
    .forEach(node => node.classList.remove('eatable'));
}
function clearMiniChips(){
    removeElementsByClass('mini-circle'); 
}
function removeElementsByClass(className){
    Array.from(document.querySelectorAll(`.${className}`))
    .forEach(node => node.parentElement.removeChild(node));
    return 1;
}
function updateMovsTotal(source){
    if(source.dataset.team == RED_CHIP){
        redTeamTotalMovs++;
        UIRedTeamTotalMovs.innerHTML = redTeamTotalMovs;
    }else{
        blackTeamTotalMovs++;
        UIBlackTeamTotalMovs.innerHTML = blackTeamTotalMovs;
    }

}
function isPair(val){
    return val % 2 == 0;
}