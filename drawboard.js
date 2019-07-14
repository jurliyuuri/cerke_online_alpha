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
    [null, "Tam2", "Tam2", null, null, null, null, null, null],
    [null, null, "Tam2", null, null, null, null, null, null],
    [null, null, null, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, null, null, null, null],
    [{ color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward },
        null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null]
];
var UI_STATE = {
    selectedIndex: null
};
function eraseGuide() {
    var contains_guides = document.getElementById("contains_guides");
    // delete everything
    while (contains_guides.firstChild) {
        contains_guides.removeChild(contains_guides.firstChild);
    }
}
function drawGuideOnBoard(row_index, column_index) {
    var i = document.createElement("img");
    i.classList.add("guide");
    i.style.top = 1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2 + "px";
    i.style.left = 1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2 + "px";
    i.src = "image/ct.png";
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
function drawSelectednessOnBoard(row_index, column_index) {
    var i = document.createElement("img");
    i.classList.add("selection");
    i.style.top = 1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2 + "px";
    i.style.left = 1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2 + "px";
    i.src = "image/selection2.png";
    i.width = PIECE_SIZE;
    i.height = PIECE_SIZE;
    i.style.cursor = "pointer";
    // click on it to erase
    i.addEventListener('click', function () {
        eraseGuide();
        UI_STATE.selectedIndex = null;
    });
    return i;
}
function showGuideOf(i, j, sq) {
    var contains_guides = document.getElementById("contains_guides");
    var centralNode = drawSelectednessOnBoard(i, j);
    contains_guides.appendChild(centralNode);
    for (var i_1 = 0; i_1 < 4; i_1++) {
        var l = Math.floor(Math.random() * 9);
        var m = Math.floor(Math.random() * 9);
        contains_guides.appendChild(drawGuideOnBoard(l, m));
    }
}
function selectOwnPieceOnBoard(ev, i, j, sq, imgNode) {
    console.log(ev, i, j, sq);
    if (UI_STATE.selectedIndex != null && UI_STATE.selectedIndex[0] === i && UI_STATE.selectedIndex[1] === j) {
        eraseGuide();
        UI_STATE.selectedIndex = null;
    }
    else {
        eraseGuide();
        UI_STATE.selectedIndex = [i, j];
        showGuideOf(i, j, sq);
    }
}
function drawBoard(board) {
    var contains_pieces_on_board = document.getElementById("contains_pieces_on_board");
    // delete everything
    while (contains_pieces_on_board.firstChild) {
        contains_pieces_on_board.removeChild(contains_pieces_on_board.firstChild);
    }
    for (var i = 0; i < board.length; i++) {
        var _loop_1 = function (j) {
            var sq = board[i][j];
            if (sq == null) {
                return "continue";
            }
            var i_ = i;
            var j_ = j;
            var imgNode;
            var selectable = void 0;
            if (sq === "Tam2") {
                imgNode = drawPieceOnBoard(i_, j_, "piece/tam");
                selectable = true;
            }
            else {
                imgNode = drawPieceOnBoard(i_, j_, toPath(sq));
                selectable = (sq.side === Side.Upward);
            }
            if (selectable) {
                imgNode.style.cursor = "pointer";
                imgNode.addEventListener('click', function (ev) {
                    selectOwnPieceOnBoard(ev, i_, j_, sq, imgNode);
                });
            }
            contains_pieces_on_board.appendChild(imgNode);
        };
        for (var j = 0; j < board[i].length; j++) {
            _loop_1(j);
        }
    }
}
