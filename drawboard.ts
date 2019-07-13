
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
    [null, "Tam2", null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [{ color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, 
        null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null]
];

function drawBoard(board: Board) {
    let contains_pieces_on_board = document.getElementById("contains_pieces_on_board")!;

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let sq : Square = board[i][j];
            if (sq == null) {
                continue;
            } 
            
            let imgNode;
            if (sq === "Tam2") {
                imgNode = drawPieceOnBoard(i as BoardIndex, j as BoardIndex, "piece/tam");
            } else {
                imgNode = drawPieceOnBoard(i as BoardIndex, j as BoardIndex, toPath(sq));
            }

            contains_pieces_on_board.appendChild(imgNode);
        }
    }
}
