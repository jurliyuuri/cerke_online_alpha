"use strict";
var BOX_SIZE = 70;
var MAX_PIECE_SIZE = BOX_SIZE - 1;
var PIECE_SIZE = 60;
function createPieceImgToBePlacedOnBoardByPath(coord, path) {
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
var GAME_STATE = {
    f: {
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
        hop1zuo1OfDownward: [],
        hop1zuo1OfUpward: [],
    },
    IA_is_down: true,
    tam_itself_is_tam_hue: true,
    backupDuringStepping: null
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
    var contains_guides_on_upward = document.getElementById("contains_guides_on_upward");
    // delete everything
    while (contains_guides_on_upward.firstChild) {
        contains_guides_on_upward.removeChild(contains_guides_on_upward.firstChild);
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
function getThingsGoingFromHop1zuo1(ev, piece, from, to) {
    var dest = GAME_STATE.f.currentBoard[to[0]][to[1]];
    // must parachute onto an empty square
    if (dest != null) {
        alert("Cannot parachute onto an occupied square");
        throw new Error("Cannot parachute onto an occupied square");
    }
    if (piece === "Tam2") {
        alert("Cannot parachute Tam2");
        throw new Error("Cannot parachute Tam2");
    }
    var abs_dst = toAbsoluteCoord(to);
    var message = {
        type: "NonTamMove",
        data: {
            type: "FromHand",
            color: piece.color,
            prof: piece.prof,
            dest: abs_dst
        }
    };
    console.log("sending normal move:", JSON.stringify(message));
    eraseGuide();
    UI_STATE.selectedCoord = null;
    alert("message sent.");
    return;
}
function erasePhantom() {
    var contains_phantom = document.getElementById("contains_phantom");
    while (contains_phantom.firstChild) {
        contains_phantom.removeChild(contains_phantom.firstChild);
    }
}
function drawHoverAt(coord, piece) {
    var contains_phantom = document.getElementById("contains_phantom");
    var row_index = coord[0], column_index = coord[1];
    var img = document.createElement("img");
    img.classList.add("piece_image_on_board");
    img.style.top = 1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) + "px";
    img.style.left = 1 + column_index * BOX_SIZE + "px";
    img.src = "image/" + toPath_(piece) + ".png";
    img.width = PIECE_SIZE;
    img.height = PIECE_SIZE;
    img.style.zIndex = "100";
    img.style.cursor = "pointer";
    // TODO: draw as being already selected
    img.addEventListener('click', function (ev) {
        var contains_guides = document.getElementById("contains_guides");
        var row_index = coord[0], column_index = coord[1];
        var centralNode = document.createElement("img");
        centralNode.classList.add("selection");
        centralNode.style.top = 1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) + "px";
        centralNode.style.left = 1 + column_index * BOX_SIZE + "px";
        centralNode.src = "image/selection2.png";
        centralNode.width = PIECE_SIZE;
        centralNode.height = PIECE_SIZE;
        centralNode.style.cursor = "pointer";
        // click on it to erase
        centralNode.addEventListener('click', function () {
            eraseGuide();
            UI_STATE.selectedCoord = null;
        });
        centralNode.style.zIndex = "200";
        contains_guides.appendChild(centralNode);
        var _a = calculateMovablePositions(coord, piece, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue), guideListYellow = _a.finite, guideListGreen = _a.infinite;
        display_guide_after_stepping(coord, piece, contains_guides, guideListYellow, "ct", "200");
        display_guide_after_stepping(coord, piece, contains_guides, guideListGreen, "ct2", "200");
    });
    contains_phantom.appendChild(img);
}
function drawCancel() {
    var contains_phantom = document.getElementById("contains_phantom");
    var _a = [9, 7.5], row_index = _a[0], column_index = _a[1];
    var img = document.createElement("img");
    img.classList.add("piece_image_on_board");
    img.style.top = 1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) + "px";
    img.style.left = 1 + column_index * BOX_SIZE + "px";
    img.src = "image/piece/bmun.png";
    img.width = 80;
    img.height = 80;
    img.style.zIndex = "100";
    img.style.cursor = "pointer";
    // TODO: draw as being already selected
    img.addEventListener('click', function (ev) {
        eraseGuide();
        erasePhantom();
        document.getElementById("protective_cover_over_field").classList.add("nocover");
        // resurrect the original one
        var backup = GAME_STATE.backupDuringStepping;
        var from = backup[0];
        GAME_STATE.f.currentBoard[from[0]][from[1]] = backup[1];
        GAME_STATE.backupDuringStepping = null;
        UI_STATE.selectedCoord = null;
        // draw
        drawField(GAME_STATE.f);
    });
    contains_phantom.appendChild(img);
}
function drawPhantomAt(coord, piece) {
    var contains_phantom = document.getElementById("contains_phantom");
    erasePhantom();
    var phantom = createPieceImgToBePlacedOnBoard(coord, piece);
    phantom.style.opacity = "0.1";
    contains_phantom.appendChild(phantom);
}
function stepping(from, piece, to, destPiece) {
    eraseGuide();
    document.getElementById("protective_cover_over_field").classList.remove("nocover");
    // delete the original one
    GAME_STATE.backupDuringStepping = [from, piece];
    GAME_STATE.f.currentBoard[from[0]][from[1]] = null;
    // draw
    drawField(GAME_STATE.f);
    drawPhantomAt(from, piece);
    drawCancel();
    drawHoverAt(to, piece);
}
function getThingsGoing(ev, piece, from, to) {
    var destPiece = GAME_STATE.f.currentBoard[to[0]][to[1]];
    if (destPiece == null) { // dest is empty square; try to simply move
        var message = void 0;
        if (piece !== "Tam2") {
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
    if (destPiece === "Tam2" || destPiece.side === Side.Upward || piece === "Tam2") { // can step, but cannot take
        stepping(from, piece, to, destPiece);
        return;
    }
    if (confirm(DICTIONARY.ja.whetherToTake)) {
        var abs_src = toAbsoluteCoord(from);
        var abs_dst = toAbsoluteCoord(to);
        var message = {
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
        stepping(from, piece, to, destPiece);
        return;
    }
}
function createYellowGuideImageAt(coord, path) {
    var row_index = coord[0], column_index = coord[1];
    var img = document.createElement("img");
    img.classList.add("guide");
    img.style.top = 1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2 + "px";
    img.style.left = 1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2 + "px";
    img.src = "image/" + path + ".png";
    img.width = MAX_PIECE_SIZE;
    img.height = MAX_PIECE_SIZE;
    img.style.cursor = "pointer";
    img.style.opacity = "0.3";
    return img;
}
function display_guide_after_stepping(coord, piece, parent, list, path, zIndex) {
    for (var ind = 0; ind < list.length; ind++) {
        // draw the yellow guides
        var img = createYellowGuideImageAt(list[ind], path);
        // click on it to get things going
        img.addEventListener('click', function (ev) {
            alert("foo");
        });
        img.style.zIndex = zIndex || "auto";
        parent.appendChild(img);
    }
}
function display_guide(coord, piece, parent, list, path) {
    var _loop_1 = function (ind) {
        // draw the yellow guides
        var img = createYellowGuideImageAt(list[ind], path);
        // click on it to get things going
        img.addEventListener('click', function (ev) {
            getThingsGoing(ev, piece, coord, list[ind]);
        });
        parent.appendChild(img);
    };
    for (var ind = 0; ind < list.length; ind++) {
        _loop_1(ind);
    }
}
function showGuideOfBoardPiece(coord, piece) {
    var contains_guides = document.getElementById("contains_guides");
    var centralNode = drawSelectednessOnBoard(coord);
    contains_guides.appendChild(centralNode);
    var _a = calculateMovablePositions(coord, piece, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue), guideListYellow = _a.finite, guideListGreen = _a.infinite;
    display_guide(coord, piece, contains_guides, guideListYellow.concat(guideListGreen), "ct");
}
function selectOwnPieceOnBoard(ev, coord, piece, imgNode) {
    var i = coord[0], j = coord[1];
    console.log(ev, i, j, piece);
    /* If the piece that was originally selected were Hop1zuo1, nevertheless erase the guide, since the guide contains both */
    if (UI_STATE.selectedCoord != null && UI_STATE.selectedCoord[0] === "Hop1zuo1") {
        eraseGuide();
        UI_STATE.selectedCoord = coord;
        showGuideOfBoardPiece(coord, piece);
        return;
    }
    /* Clicking what was originally selected will make it deselect */
    if (UI_STATE.selectedCoord != null && coordEq(UI_STATE.selectedCoord, coord)) {
        eraseGuide();
        UI_STATE.selectedCoord = null;
    }
    else {
        eraseGuide();
        UI_STATE.selectedCoord = coord;
        showGuideOfBoardPiece(coord, piece);
    }
}
function drawSelectednessOnHop1zuo1At(ind) {
    var i = document.createElement("img");
    i.classList.add("selection");
    i.style.top = 1 + (MAX_PIECE_SIZE - PIECE_SIZE) / 2 + "px";
    i.style.left = 1 + ind * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2 + "px";
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
function showGuideOnHop1zuo1At(ind, piece) {
    var contains_guides_on_upward = document.getElementById("contains_guides_on_upward");
    var centralNode = drawSelectednessOnHop1zuo1At(ind);
    contains_guides_on_upward.appendChild(centralNode);
    var contains_guides = document.getElementById("contains_guides");
    for (var i = 0; i < 9; i++) {
        var _loop_2 = function (j) {
            var ij = [i, j];
            if (GAME_STATE.f.currentBoard[i][j] != null) {
                return "continue";
            }
            // draw the yellow guides
            var img = createYellowGuideImageAt(ij, "ct");
            // click on it to get things going
            img.addEventListener('click', function (ev) {
                getThingsGoingFromHop1zuo1(ev, piece, ["Hop1zuo1", ind], ij);
            });
            contains_guides.appendChild(img);
        };
        for (var j = 0; j < 9; j++) {
            _loop_2(j);
        }
    }
}
function selectOwnPieceOnHop1zuo1(ev, ind, piece, imgNode) {
    console.log(ev, ind, piece);
    /* If the piece that was originally selected were Hop1zuo1 */
    if (UI_STATE.selectedCoord != null && UI_STATE.selectedCoord[0] === "Hop1zuo1") {
        if (UI_STATE.selectedCoord[1] === ind) { /* re-click: deselect */
            eraseGuide();
            UI_STATE.selectedCoord = null;
            return;
        }
        else {
            eraseGuide();
            showGuideOnHop1zuo1At(ind, piece);
            UI_STATE.selectedCoord = ["Hop1zuo1", ind];
            return;
        }
    }
    eraseGuide();
    showGuideOnHop1zuo1At(ind, piece);
    UI_STATE.selectedCoord = ["Hop1zuo1", ind];
}
function createPieceImgToBePlacedOnHop1zuo1(ind, path) {
    var img = document.createElement("img");
    img.classList.add("piece_image_on_hop1zuo1");
    img.style.top = 1 + (MAX_PIECE_SIZE - PIECE_SIZE) / 2 + "px";
    img.style.left = 1 + ind * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2 + "px";
    img.src = "image/" + path + ".png";
    img.width = PIECE_SIZE;
    img.height = PIECE_SIZE;
    return img;
}
function toPath_(piece) {
    if (piece === "Tam2") {
        return "piece/tam";
    }
    else {
        return toPath(piece);
    }
}
function createPieceImgToBePlacedOnBoard(coord, piece) {
    return createPieceImgToBePlacedOnBoardByPath(coord, toPath_(piece));
}
function drawField(field) {
    var drawBoard = function (board) {
        var contains_pieces_on_board = document.getElementById("contains_pieces_on_board");
        GAME_STATE.f.currentBoard = board;
        // delete everything
        while (contains_pieces_on_board.firstChild) {
            contains_pieces_on_board.removeChild(contains_pieces_on_board.firstChild);
        }
        for (var i = 0; i < board.length; i++) {
            var _loop_3 = function (j) {
                var piece = board[i][j];
                if (piece == null) {
                    return "continue";
                }
                var coord = [i, j];
                var imgNode;
                var selectable = void 0;
                imgNode = createPieceImgToBePlacedOnBoard(coord, piece);
                if (piece === "Tam2") {
                    selectable = true;
                }
                else {
                    selectable = (piece.side === Side.Upward);
                }
                if (selectable) {
                    imgNode.style.cursor = "pointer";
                    imgNode.addEventListener('click', function (ev) {
                        selectOwnPieceOnBoard(ev, coord, piece, imgNode);
                    });
                }
                contains_pieces_on_board.appendChild(imgNode);
            };
            for (var j = 0; j < board[i].length; j++) {
                _loop_3(j);
            }
        }
    };
    var drawHop1zuo1OfUpward = function (list) {
        var contains_pieces_on_upward = document.getElementById("contains_pieces_on_upward");
        GAME_STATE.f.hop1zuo1OfUpward = list;
        // delete everything
        while (contains_pieces_on_upward.firstChild) {
            contains_pieces_on_upward.removeChild(contains_pieces_on_upward.firstChild);
        }
        var _loop_4 = function (i) {
            var piece = list[i];
            var imgNode = createPieceImgToBePlacedOnHop1zuo1(i, toPath(piece));
            var selectable = true;
            if (selectable) {
                imgNode.style.cursor = "pointer";
                imgNode.addEventListener('click', function (ev) {
                    selectOwnPieceOnHop1zuo1(ev, i, piece, imgNode);
                });
            }
            contains_pieces_on_upward.appendChild(imgNode);
        };
        for (var i = 0; i < list.length; i++) {
            _loop_4(i);
        }
    };
    var drawHop1zuo1OfDownward = function (list) {
        var contains_pieces_on_downward = document.getElementById("contains_pieces_on_downward");
        GAME_STATE.f.hop1zuo1OfDownward = list;
        // delete everything
        while (contains_pieces_on_downward.firstChild) {
            contains_pieces_on_downward.removeChild(contains_pieces_on_downward.firstChild);
        }
        for (var i = 0; i < list.length; i++) {
            var piece = list[i];
            var imgNode = createPieceImgToBePlacedOnHop1zuo1(i, toPath(piece));
            contains_pieces_on_downward.appendChild(imgNode);
        }
    };
    drawBoard(field.currentBoard);
    drawHop1zuo1OfUpward(field.hop1zuo1OfUpward);
    drawHop1zuo1OfDownward(field.hop1zuo1OfDownward);
}
