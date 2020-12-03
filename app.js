//  Made by qilobit
//  Checkers game
//  NOTES:
//  Elements #id format is: b_(row)_(column)

//  UI elements
const container = document.querySelector('.container');
const board = document.querySelector('.board');
const buttons = document.querySelector('.buttons');
const UIRedTeamTotalMovs = document.querySelector('#red-team-movs-total');
const UIBlackTeamTotalMovs = document.querySelector('#black-team-movs-total');
const UIRedTeamScore = document.querySelector('#red-team-score');
const UIBlackTeamScore = document.querySelector('#black-team-score');

//  Constants
const boardCols = 8;
const boardRows = 8;
const BLACK_CHIP = 'black';
const RED_CHIP = 'red';
const l = console.log;
const BOARD_MIDDLE = 5;
const RIGHT = 1;
const LEFT = 2;
const RED_TEAM_QUEEN_ROW = 8;
const BLACK_TEAM_QUEEN_ROW = 1;
const rowsForChips = [ 1, 2, 3, 6, 7, 8 ];
const oddPositions = [ 1, 3, 5, 7 ];
const iddlePositions = [ 2, 4, 6, 8 ];
const scores = {
	red: 0,
	black: 0
};
const totalMovs = {
	red: 0,
	black: 0
};

//  Vars
let currentPlayer = RED_CHIP;

//Events
document.addEventListener('DOMContentLoaded', buildBoard);

//  Funtions
function getInitialChipsPositions() {
	const output = [];
	rowsForChips.forEach((row) => {
		if (row % 2 == 0) {
			oddPositions.forEach((col) => {
				output.push(`b_${row}_${col}`);
			});
		} else {
			iddlePositions.forEach((col) => {
				output.push(`b_${row}_${col}`);
			});
		}
	});
	return output;
}
function buildBoard() {
	let box = null;
	const initialChipsPosition = getInitialChipsPositions();
	for (let row = 1; row <= boardRows; row++) {
		for (let col = 1; col <= boardCols; col++) {
			box = createBoardBox(row, col, initialChipsPosition);
			board.appendChild(box);
		}
	}
}
function createBoardBox(row, col, initialChipsPosition) {
	const div = document.createElement('div');
	const id = `b_${row}_${col}`;
	div.className = 'box';
	div.id = id;
	div.dataset['col'] = col;
	div.dataset['row'] = row;
	if (isPair(col)) {
		if (iddlePositions.includes(row)) {
			div.classList.add('black');
		}
	} else {
		if (oddPositions.includes(row)) {
			div.classList.add('black');
		}
	}
	if (initialChipsPosition.includes(id)) {
		const color = row < BOARD_MIDDLE ? RED_CHIP : BLACK_CHIP;
		div.appendChild(createChip(color));
	}
	return div;
}
function createChip(color) {
	const div = document.createElement('div');
	div.className = `base-circle ${color}-chip`;
	div.dataset.team = color;
	div.addEventListener('click', previewAvailablePositions);
	return div;
}
function previewAvailablePositions() {
	const currentChip = this;
	const currentChipTeam = currentChip.dataset.team;
	if (currentChipTeam !== currentPlayer) {
		alert('Not your turn');
		return;
	}
	clearAllEatables();
	clearAllPreviews();
	clearMiniChips();
	const parentId = currentChip.parentElement.id;
	const location = getPositionFromId(parentId);

	// TODO: change this to allow eating in reverse
	const posibleRowPosition = currentChipTeam == BLACK_CHIP ? location.row - 1 : location.row + 1;

	const rightColumn = location.col + 1;
	const leftColumn = location.col - 1;
	const rightBox = getElementFromPosition(posibleRowPosition, rightColumn);
	const leftBox = getElementFromPosition(posibleRowPosition, leftColumn);

	if (rightBox) {
		processChipMove(parentId, rightBox, currentChipTeam, location, RIGHT);
	}
	if (leftBox) {
		processChipMove(parentId, leftBox, currentChipTeam, location, LEFT);
	}

	function processChipMove(targetBoxId, boxElement, currentChipTeam, location, side) {
		//TODO: handle posible move positions for "Queen" chip
		if (boxElement.innerHTML == '') {
			//Move to empty position
			const previewChip = createPreviewChip(targetBoxId, currentChipTeam, boxElement);
			boxElement.appendChild(previewChip);
		} else {
			//Try to eat
			const rowToMov = currentChipTeam == BLACK_CHIP ? location.row - 2 : location.row + 2;
			const stepsToTake = side == RIGHT ? location.col + 2 : location.col - 2;
			const chip = boxElement.childNodes[0];
			const positionAfterEat = getElementFromPosition(rowToMov, stepsToTake);
			const positionAfterEatIsAvailable = positionAfterEat && positionAfterEat.innerHTML == '';

			if (chip.dataset.team !== currentChipTeam && positionAfterEatIsAvailable) {
				boxElement.childNodes[0].classList.add('eatable');
				positionAfterEat.appendChild(createMiniChip(targetBoxId, currentChipTeam, chip));
			} else {
				l('No se puede comer');
			}
		}
		function createPreviewChip(originalChipId, teamColor, boxElement) {
			const div = document.createElement('div');
			div.dataset.original_chip = originalChipId;
			div.className = 'base-circle preview-chip';
			div.addEventListener('click', function() {
				const source = document.querySelector(`#${this.dataset.original_chip}`).childNodes[0];
				const target = this.parentElement;
				const currentRow = boxElement.dataset.row;
				const sourceCopy = copyNode(source);

				currentPlayer = currentPlayer === RED_CHIP ? BLACK_CHIP : RED_CHIP;

				l('teamColor ', teamColor);
				l('currentRow ', currentRow);
				if (chipBecomesQueen(teamColor, currentRow)) {
					l(`Make ${teamColor} queen`);
					sourceCopy.classList.add('is-queen');
				}

				target.innerHTML = '';
				target.appendChild(sourceCopy);

				source.parentElement.removeChild(source);

				updateMovsTotal(teamColor);

				clearAllPreviews();
				clearAllEatables();
				clearMiniChips();
			});
			return div;
			function chipBecomesQueen(teamColor, rowNumber) {
				if (teamColor === RED_CHIP && Number(rowNumber) === RED_TEAM_QUEEN_ROW) {
					return true;
				} else if (teamColor === BLACK_CHIP && Number(rowNumber) === BLACK_TEAM_QUEEN_ROW) {
					return true;
				}
				return false;
			}
		}
		return 1;
	}
}
function createMiniChip(sourceId, teamColor, chipToEat) {
	const div = document.createElement('div');
	div.className = `mini-circle ${teamColor}`;
	div.dataset.original_chip = sourceId;
	div.title = 'Move here';
	div.addEventListener('click', () => {
		moveAfterEat(div, chipToEat);
	});
	return div;
}
function moveAfterEat(element, chipToEat) {
	if (chipToEat.dataset.team == BLACK_CHIP) {
		increaseRedTeamScore();
	} else {
		increaseBlackTeamScore();
	}
	chipToEat.parentElement.removeChild(chipToEat);

	const source = document.querySelector(`#${element.dataset.original_chip}`).childNodes[0];
	const target = element.parentElement;
	target.innerHTML = '';
	let sourceCopy = copyNode(source);
	target.appendChild(sourceCopy);
	source.parentElement.removeChild(source);
	updateMovsTotal(source.dataset.team);
	clearAllPreviews();
	clearAllEatables();
	clearMiniChips();
}
function increaseBlackTeamScore() {
	scores.black++;
	UIBlackTeamScore.innerHTML = scores.black;
}
function increaseRedTeamScore() {
	scores.red++;
	UIRedTeamScore.innerHTML = scores.red;
}
function getElementFromPosition(row, col) {
	return document.querySelector(`#b_${row}_${col}`);
}
function copyNode(node) {
	let copy = node.cloneNode();
	copy.addEventListener('click', previewAvailablePositions);
	return copy;
}
function getPositionFromId(id) {
	const location = id.split('_');
	return {
		row: parseInt(location[1]),
		col: parseInt(location[2])
	};
}
function clearAllPreviews() {
	removeElementsByClass('preview-chip');
}
function clearAllEatables() {
	Array.from(document.querySelectorAll(`.eatable`)).forEach((node) => node.classList.remove('eatable'));
}
function clearMiniChips() {
	removeElementsByClass('mini-circle');
}
function removeElementsByClass(className) {
	Array.from(document.querySelectorAll(`.${className}`)).forEach((node) => node.parentElement.removeChild(node));
	return 1;
}
function updateMovsTotal(teamColor) {
	if (teamColor == RED_CHIP) {
		totalMovs.red++;
		UIRedTeamTotalMovs.innerHTML = totalMovs.red;
	} else {
		totalMovs.black++;
		UIBlackTeamTotalMovs.innerHTML = totalMovs.black;
	}
}
function isPair(val) {
	return val % 2 == 0;
}
