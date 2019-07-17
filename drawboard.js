"use strict";
var Profession = type__piece.Profession;
var Side = type__piece.Side;
var Color = type__piece.Color;
var AbsoluteColumn = type__message.AbsoluteColumn;
var AbsoluteRow = type__message.AbsoluteRow;
var calculateMovablePositions = calculate_movable.calculateMovablePositions;
var coordEq = type__piece.coordEq;
var BOX_SIZE = 70;
var MAX_PIECE_SIZE = BOX_SIZE - 1;
var PIECE_SIZE = 60;
function drawPieceOnBoard(coord, path) {
    var row_index = coord[0], column_index = coord[1];
    var i = document.createElement("img");
    i.classList.add("piece_image_on_board");
    i.style.top = 1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2 + "px";
    i.style.left = 1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2 + "px";
    i.src = "image/" + path + ".png";
    i.width = PIECE_SIZE;
    i.height = PIECE_SIZE;
    return i;
}
function toPath(p) {
    var sideToPath = function (side) {
        if (side === Side.Downward)
            return "piece_rev";
        if (side === Side.Upward)
            return "piece";
        var _should_not_reach_here = side;
        return _should_not_reach_here;
    };
    var colorToPath = function (color) {
        if (color === Color.Huok2)
            return "b";
        if (color === Color.Kok1)
            return "r";
        var _should_not_reach_here = color;
        return _should_not_reach_here;
    };
    var profToPath = function (prof) {
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
    };
    return sideToPath(p.side) + "/" + colorToPath(p.color) + profToPath(p.prof);
}
var sampleBoard = [
    [{ color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward },
        null, null, { color: Color.Kok1, prof: Profession.Dau2, side: Side.Upward }, null, null, null, null, null],
    [null, null, { color: Color.Kok1, prof: Profession.Dau2, side: Side.Downward }, null, null, null, null, null, null],
    [{ color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, "Tam2", "Tam2", null, { color: Color.Kok1, prof: Profession.Dau2, side: Side.Upward }, null, null, null, null],
    [null, { color: Color.Huok2, prof: Profession.Kaun1, side: Side.Upward }, "Tam2", null, null, null, null, null, null],
    [null, null, null, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, null, null, null, null],
    [{ color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward },
        null, null, null, null, null, null, null, null],
    [null, null, null, { color: Color.Huok2, prof: Profession.Kaun1, side: Side.Upward }, null, { color: Color.Kok1, prof: Profession.Tuk2, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Tuk2, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Tuk2, side: Side.Upward }, null],
    [null, null, { color: Color.Kok1, prof: Profession.Io, side: Side.Upward }, null, null, null, null, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, null],
    [null, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward }, null, { color: Color.Huok2, prof: Profession.Maun1, side: Side.Upward }, null, null, null, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, "Tam2"]
];
var GAME_STATE = {
    currentBoard: [
        [null, null, null, null, null, null, null, null, "Tam2"],
        [null, null, null, null, null, null, null, null, "Tam2"],
        [null, null, null, null, null, null, null, null, "Tam2"],
        [null, null, null, null, null, null, null, null, "Tam2"],
        [null, null, null, null, null, null, null, null, "Tam2"],
        [null, null, null, null, null, null, null, null, "Tam2"],
        [null, null, null, null, null, null, null, null, "Tam2"],
        [null, null, null, null, null, null, null, null, "Tam2"],
        [null, null, null, null, null, null, null, null, "Tam2"]
    ],
    IA_is_down: true
};
var UI_STATE = {
    selectedCoord: null
};
function eraseGuide() {
    var contains_guides = document.getElementById("contains_guides");
    // delete everything
    while (contains_guides.firstChild) {
        contains_guides.removeChild(contains_guides.firstChild);
    }
}
function drawSelectednessOnBoard(coord) {
    var row_index = coord[0], column_index = coord[1];
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
        UI_STATE.selectedCoord = null;
    });
    return i;
}
function toAbsoluteCoord(_a) {
    var row = _a[0], col = _a[1];
    return [
        [
            AbsoluteRow.A, AbsoluteRow.E, AbsoluteRow.I,
            AbsoluteRow.U, AbsoluteRow.O, AbsoluteRow.Y,
            AbsoluteRow.AI, AbsoluteRow.AU, AbsoluteRow.IA
        ][GAME_STATE.IA_is_down ? row : 8 - row],
        [
            AbsoluteColumn.K, AbsoluteColumn.L, AbsoluteColumn.N,
            AbsoluteColumn.T, AbsoluteColumn.Z, AbsoluteColumn.X,
            AbsoluteColumn.C, AbsoluteColumn.M, AbsoluteColumn.P
        ][GAME_STATE.IA_is_down ? col : 8 - col]
    ];
}
function getThingsGoing(ev, sq, from, to) {
    var dest = GAME_STATE.currentBoard[to[0]][to[1]];
    if (dest == null) { // dest is empty square; try to simply move
        var message = void 0;
        if (sq !== "Tam2") {
            var abs_src = toAbsoluteCoord(from);
            var abs_dst = toAbsoluteCoord(to);
            message = {
                type: "NonTamMove",
                data: {
                    type: "SrcDst",
                    src: abs_src,
                    dest: abs_dst
                }
            };
            console.log("sending normal move:", JSON.stringify(message));
            eraseGuide();
            UI_STATE.selectedCoord = null;
            alert("message sent.");
            return;
        }
        else {
            alert("implement Tam2 movement");
            return;
        }
    }
    if (dest === "Tam2" || dest.side === Side.Upward) { // can step, but cannot take
        alert("implement stepping");
        return;
    }
    if (confirm(DICTIONARY.ja.whetherToTake)) {
        alert("implement taking");
        return;
    }
    else {
        alert("implement stepping");
        return;
    }
}
var DICTIONARY = {
    ja: {
        whetherToTake: "駒を取りますか？"
    }
};
function showGuideOf(coord, sq) {
    var contains_guides = document.getElementById("contains_guides");
    var centralNode = drawSelectednessOnBoard(coord);
    contains_guides.appendChild(centralNode);
    var guideList = calculateMovablePositions(coord, sq, GAME_STATE.currentBoard);
    var _loop_1 = function (ind) {
        // draw the yellow guides
        var _a = guideList[ind], row_index = _a[0], column_index = _a[1];
        var img = document.createElement("img");
        img.classList.add("guide");
        img.style.top = 1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2 + "px";
        img.style.left = 1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2 + "px";
        img.src = "image/ct.png";
        img.width = MAX_PIECE_SIZE;
        img.height = MAX_PIECE_SIZE;
        img.style.cursor = "pointer";
        img.style.opacity = "0.3";
        // click on it to get things going
        img.addEventListener('click', function (ev) {
            getThingsGoing(ev, sq, coord, guideList[ind]);
        });
        contains_guides.appendChild(img);
    };
    for (var ind = 0; ind < guideList.length; ind++) {
        _loop_1(ind);
    }
}
function selectOwnPieceOnBoard(ev, coord, sq, imgNode) {
    var i = coord[0], j = coord[1];
    console.log(ev, i, j, sq);
    if (UI_STATE.selectedCoord != null && coordEq(UI_STATE.selectedCoord, coord)) {
        eraseGuide();
        UI_STATE.selectedCoord = null;
    }
    else {
        eraseGuide();
        UI_STATE.selectedCoord = coord;
        showGuideOf(coord, sq);
    }
}
function drawBoard(board) {
    var contains_pieces_on_board = document.getElementById("contains_pieces_on_board");
    GAME_STATE.currentBoard = board;
    // delete everything
    while (contains_pieces_on_board.firstChild) {
        contains_pieces_on_board.removeChild(contains_pieces_on_board.firstChild);
    }
    for (var i = 0; i < board.length; i++) {
        var _loop_2 = function (j) {
            var sq = board[i][j];
            if (sq == null) {
                return "continue";
            }
            var coord = [i, j];
            var imgNode;
            var selectable = void 0;
            if (sq === "Tam2") {
                imgNode = drawPieceOnBoard(coord, "piece/tam");
                selectable = true;
            }
            else {
                imgNode = drawPieceOnBoard(coord, toPath(sq));
                selectable = (sq.side === Side.Upward);
            }
            if (selectable) {
                imgNode.style.cursor = "pointer";
                imgNode.addEventListener('click', function (ev) {
                    selectOwnPieceOnBoard(ev, coord, sq, imgNode);
                });
            }
            contains_pieces_on_board.appendChild(imgNode);
        };
        for (var j = 0; j < board[i].length; j++) {
            _loop_2(j);
        }
    }
}
