"use strict";
var BOX_SIZE = 70;
var MAX_PIECE_SIZE = BOX_SIZE - 1;
var PIECE_SIZE = 60;
function drawPieceOnBoard(row_index, column_index, path) {
    var i = document.createElement("img");
    i.classList.add("piece_image_on_board");
    i.style.top = 1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2 + "px";
    i.style.left = 1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2 + "px";
    i.src = "image/" + path + ".png";
    i.width = PIECE_SIZE;
    i.height = PIECE_SIZE;
    return i;
}
function profToPath(prof) {
    if (prof === Profession.Dau2)
        return "dau";
    if (prof === Profession.Gua2)
        return "gua";
    if (prof === Profession.Io)
        return "io";
    if (prof === Profession.Kauk2)
        return "kauk";
    if (prof === Profession.Kaun1)
        return "kaun";
    if (prof === Profession.Kua2)
        return "kua";
    if (prof === Profession.Maun1)
        return "maun";
    if (prof === Profession.Nuak1)
        return "nuak";
    if (prof === Profession.Tuk2)
        return "tuk";
    if (prof === Profession.Uai1)
        return "uai";
    var _should_not_reach_here = prof;
    return _should_not_reach_here;
}
function sideToPath(side) {
    if (side === Side.Downward)
        return "piece_rev";
    if (side === Side.Upward)
        return "piece";
    var _should_not_reach_here = side;
    return _should_not_reach_here;
}
function colorToPath(color) {
    if (color === Color.Huok2)
        return "b";
    if (color === Color.Kok1)
        return "r";
    var _should_not_reach_here = color;
    return _should_not_reach_here;
}
function toPath(p) {
    return sideToPath(p.side) + "/" + colorToPath(p.color) + profToPath(p.prof);
}
var sampleBoard = [
    [{ color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward },
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
function drawBoard(board) {
    var contains_pieces_on_board = document.getElementById("contains_pieces_on_board");
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var sq = board[i][j];
            if (sq == null) {
                continue;
            }
            var imgNode = void 0;
            if (sq === "Tam2") {
                imgNode = drawPieceOnBoard(i, j, "piece/tam");
            }
            else {
                imgNode = drawPieceOnBoard(i, j, toPath(sq));
            }
            contains_pieces_on_board.appendChild(imgNode);
        }
    }
}
