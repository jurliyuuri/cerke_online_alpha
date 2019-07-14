
const BOX_SIZE = 70;
const MAX_PIECE_SIZE = BOX_SIZE - 1;
const PIECE_SIZE = 60;

type BoardIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

function drawPieceOnBoard(row_index: BoardIndex, column_index: BoardIndex, path: string) {
    let i = document.createElement("img");
    i.classList.add("piece_image_on_board");
    i.style.top = `${1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2}px`;
    i.style.left = `${1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2}px`;
    i.src = `image/${path}.png`;
    i.width = PIECE_SIZE;
    i.height = PIECE_SIZE;
    return i;
}

function profToPath(prof: Profession): string {
    if (prof === Profession.Dau2) return "dau";
    if (prof === Profession.Gua2) return "gua";
    if (prof === Profession.Io) return "io";
    if (prof === Profession.Kauk2) return "kauk";
    if (prof === Profession.Kaun1) return "kaun";
    if (prof === Profession.Kua2) return "kua";
    if (prof === Profession.Maun1) return "maun";
    if (prof === Profession.Nuak1) return "nuak";
    if (prof === Profession.Tuk2) return "tuk";
    if (prof === Profession.Uai1) return "uai";
    
    let _should_not_reach_here : never = prof;
    return _should_not_reach_here;
}

function sideToPath(side: Side): string {
    if (side === Side.Downward) return "piece_rev";
    if (side === Side.Upward) return "piece";

    let _should_not_reach_here : never = side;
    return _should_not_reach_here;
}

function colorToPath(color: Color): string {
    if (color === Color.Huok2) return "b";
    if (color === Color.Kok1) return "r";

    let _should_not_reach_here: never = color;
    return _should_not_reach_here;
}

function toPath(p: NonTam2Piece): string {
    return `${sideToPath(p.side)}/${colorToPath(p.color)}${profToPath(p.prof)}`
}

const sampleBoard: Board = [
    [{color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward}, 
        null, null, { color: Color.Kok1, prof: Profession.Dau2, side: Side.Upward }, null, null, null, null, null],
    [null, null, { color: Color.Kok1, prof: Profession.Dau2, side: Side.Downward }, null, null, null, null, null, null],
    [null, "Tam2", "Tam2", null, null, null, null, null, null],
    [null, null, "Tam2", null, null, null, null, null, null],
    [null, null, null, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, null, null, null, null],
    [{ color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, 
        null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null]
];

type UI_STATE = {
    selectedIndex: null | [BoardIndex, BoardIndex];
};

let UI_STATE: UI_STATE = {
    selectedIndex: null
};

function eraseGuide() {
    let contains_guides = document.getElementById("contains_guides")!;

    // delete everything
    while (contains_guides.firstChild) {
        contains_guides.removeChild(contains_guides.firstChild);
    }
}

function drawGuideOnBoard(row_index: BoardIndex, column_index: BoardIndex) {
    let i = document.createElement("img");
    i.classList.add("guide");
    i.style.top = `${1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2}px`;
    i.style.left = `${1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2}px`;
    i.src = `image/ct.png`;
    i.width = MAX_PIECE_SIZE;
    i.height = MAX_PIECE_SIZE;
    i.style.cursor = "pointer";
    i.style.opacity = "0.3";

    // click on it to erase
    i.addEventListener('click', function () {
        alert("implement me");
    });
    return i;
}

function drawSelectednessOnBoard(row_index: BoardIndex, column_index: BoardIndex) {
    let i = document.createElement("img");
    i.classList.add("selection");
    i.style.top = `${1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2}px`;
    i.style.left = `${1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2}px`;
    i.src = `image/selection2.png`;
    i.width = PIECE_SIZE;
    i.height = PIECE_SIZE;
    i.style.cursor = "pointer";

    // click on it to erase
    i.addEventListener('click', function() {
        eraseGuide();
        UI_STATE.selectedIndex = null;
    });
    return i;
}

function showGuideOf(i: BoardIndex, j: BoardIndex, sq: Square) {
    let contains_guides = document.getElementById("contains_guides")!;
    let centralNode: HTMLImageElement = drawSelectednessOnBoard(i, j);
    contains_guides.appendChild(centralNode);

    for (let i = 0; i < 4; i++) {
        let l = Math.floor(Math.random() * 9) as BoardIndex;
        let m = Math.floor(Math.random() * 9) as BoardIndex;
        contains_guides.appendChild(drawGuideOnBoard(l, m));
    }
    
}

function selectOwnPieceOnBoard(ev: MouseEvent, i: BoardIndex, j: BoardIndex, sq: Square, imgNode: HTMLImageElement) {
    console.log(ev, i, j, sq);

    if (UI_STATE.selectedIndex != null && UI_STATE.selectedIndex[0] === i && UI_STATE.selectedIndex[1] === j) {
        eraseGuide();
        UI_STATE.selectedIndex = null;
    } else {
        eraseGuide();
        UI_STATE.selectedIndex = [i, j];
        showGuideOf(i, j, sq);
    }
    
}

function drawBoard(board: Board) {
    let contains_pieces_on_board = document.getElementById("contains_pieces_on_board")!;

    // delete everything
    while (contains_pieces_on_board.firstChild) {
        contains_pieces_on_board.removeChild(contains_pieces_on_board.firstChild);
    }

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let sq : Square = board[i][j];
            if (sq == null) {
                continue;
            } 
            
            let i_: BoardIndex = i as BoardIndex;
            let j_: BoardIndex = j as BoardIndex;
            let imgNode: HTMLImageElement;
            let selectable;
            if (sq === "Tam2") {
                imgNode = drawPieceOnBoard(i_, j_, "piece/tam");
                selectable = true;
            } else {
                imgNode = drawPieceOnBoard(i_, j_, toPath(sq));
                selectable = (sq.side === Side.Upward);
            }

            if (selectable) {
                imgNode.style.cursor = "pointer";
                imgNode.addEventListener('click', function(ev){
                    selectOwnPieceOnBoard(ev, i_, j_, sq, imgNode)
                });
            }

            contains_pieces_on_board.appendChild(imgNode);
        }
    }
}
