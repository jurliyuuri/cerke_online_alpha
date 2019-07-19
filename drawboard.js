"use strict";
var BOX_SIZE = 70;
var MAX_PIECE_SIZE = BOX_SIZE - 1;
var PIECE_SIZE = 60;
function createPieceSizeImageOnBoardByPathAndXY(top, left, path, className) {
    var i = document.createElement("img");
    i.classList.add(className);
    i.style.top = top + "px";
    i.style.left = left + "px";
    i.src = "image/" + path + ".png";
    i.width = PIECE_SIZE;
    i.height = PIECE_SIZE;
    return i;
}
function createPieceSizeImageOnBoardByPath(coord, path, className) {
    var row_index = coord[0], column_index = coord[1];
    return createPieceSizeImageOnBoardByPathAndXY(1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2, 1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2, path, className);
}
function createPieceSizeImageOnBoardByPath_Shifted(coord, path, className) {
    var row_index = coord[0], column_index = coord[1];
    return createPieceSizeImageOnBoardByPathAndXY(1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE), 1 + column_index * BOX_SIZE, path, className);
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
    removeChildren(document.getElementById("contains_guides"));
    removeChildren(document.getElementById("contains_guides_on_upward"));
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
function stepping(from, piece, to, destPiece) {
    eraseGuide();
    document.getElementById("protective_cover_over_field").classList.remove("nocover");
    // delete the original one
    GAME_STATE.backupDuringStepping = [from, piece];
    GAME_STATE.f.currentBoard[from[0]][from[1]] = null;
    // draw
    drawField(GAME_STATE.f);
    var drawPhantomAt = function (coord, piece) {
        var contains_phantom = document.getElementById("contains_phantom");
        erasePhantom();
        var phantom = createPieceImgToBePlacedOnBoard(coord, piece);
        phantom.style.opacity = "0.1";
        contains_phantom.appendChild(phantom);
    };
    var drawCancel = function () {
        var contains_phantom = document.getElementById("contains_phantom");
        var cancelButton = createPieceSizeImageOnBoardByPath_Shifted([9, 7.5], "piece/bmun", "piece_image_on_board");
        cancelButton.width = 80;
        cancelButton.height = 80;
        cancelButton.style.zIndex = "100";
        cancelButton.style.cursor = "pointer";
        cancelButton.addEventListener('click', function (ev) {
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
        contains_phantom.appendChild(cancelButton);
    };
    var drawHoverAt = function (coord, piece) {
        var contains_phantom = document.getElementById("contains_phantom");
        var img = createPieceSizeImageOnBoardByPath_Shifted(coord, toPath_(piece), "piece_image_on_board");
        img.style.zIndex = "100";
        img.style.cursor = "pointer";
        var selectHover = function () {
            var contains_guides = document.getElementById("contains_guides");
            var centralNode = createPieceSizeImageOnBoardByPath_Shifted(coord, "selection2", "selection");
            centralNode.style.cursor = "pointer";
            // click on it to erase
            centralNode.addEventListener('click', function () {
                eraseGuide();
                UI_STATE.selectedCoord = null;
            });
            centralNode.style.zIndex = "200";
            contains_guides.appendChild(centralNode);
            var _a = calculateMovablePositions(coord, piece, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue), guideListYellow = _a.finite, guideListGreen = _a.infinite;
            display_guide_after_stepping(coord, piece, contains_guides, guideListYellow, "ct");
            display_guide_after_stepping(coord, piece, contains_guides, guideListGreen, "ct2");
        };
        img.addEventListener('click', selectHover);
        contains_phantom.appendChild(img);
        // draw as already selected
        selectHover();
    };
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
function createCircleGuideImageAt(coord, path) {
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
function display_guide_after_stepping(coord, piece, parent, list, path) {
    for (var ind = 0; ind < list.length; ind++) {
        var img = createCircleGuideImageAt(list[ind], path);
        // FIXME: implement me
        img.addEventListener('click', function (ev) {
            alert("foo");
        });
        img.style.zIndex = "200";
        parent.appendChild(img);
    }
}
function display_guide(coord, piece, parent, list) {
    var _loop_1 = function (ind) {
        // draw the yellow guides
        var img = createCircleGuideImageAt(list[ind], "ct");
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
function selectOwnPieceOnBoard(coord, piece, imgNode) {
    /* erase the guide in all cases, since the guide also contains the selectedness of Hop1zuo1 */
    eraseGuide();
    if (UI_STATE.selectedCoord == null || UI_STATE.selectedCoord[0] === "Hop1zuo1" || !coordEq(UI_STATE.selectedCoord, coord)) {
        UI_STATE.selectedCoord = coord;
        var contains_guides = document.getElementById("contains_guides");
        var centralNode = createPieceSizeImageOnBoardByPath(coord, "selection2", "selection");
        centralNode.style.cursor = "pointer";
        // click on it to erase
        centralNode.addEventListener('click', function () {
            eraseGuide();
            UI_STATE.selectedCoord = null;
        });
        contains_guides.appendChild(centralNode);
        var _a = calculateMovablePositions(coord, piece, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue), guideListFinite = _a.finite, guideListInfinite = _a.infinite;
        display_guide(coord, piece, contains_guides, guideListFinite.concat(guideListInfinite));
    }
    else {
        /* Clicking what was originally selected will make it deselect */
        UI_STATE.selectedCoord = null;
    }
}
function selectOwnPieceOnHop1zuo1(ind, piece, imgNode) {
    // erase the existing guide in all circumstances
    eraseGuide();
    if (UI_STATE.selectedCoord == null || UI_STATE.selectedCoord[0] !== "Hop1zuo1" || UI_STATE.selectedCoord[1] !== ind) {
        UI_STATE.selectedCoord = ["Hop1zuo1", ind];
        var contains_guides_on_upward = document.getElementById("contains_guides_on_upward");
        var centralNode = createPieceSizeImageOnBoardByPathAndXY(1 + (MAX_PIECE_SIZE - PIECE_SIZE) / 2, 1 + ind * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2, "selection2", "selection");
        centralNode.style.cursor = "pointer";
        // click on it to erase
        centralNode.addEventListener('click', function () {
            eraseGuide();
            UI_STATE.selectedCoord = null;
        });
        contains_guides_on_upward.appendChild(centralNode);
        var contains_guides = document.getElementById("contains_guides");
        for (var i = 0; i < 9; i++) {
            var _loop_2 = function (j) {
                var ij = [i, j];
                // skip if already occupied
                if (GAME_STATE.f.currentBoard[i][j] != null) {
                    return "continue";
                }
                // draw the yellow guides
                var img = createCircleGuideImageAt(ij, "ct");
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
    else {
        /* re-click: deselect */
        UI_STATE.selectedCoord = null;
    }
}
function createPieceImgToBePlacedOnHop1zuo1(ind, path) {
    return createPieceSizeImageOnBoardByPathAndXY(1 + (MAX_PIECE_SIZE - PIECE_SIZE) / 2, 1 + ind * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2, path, "piece_image_on_hop1zuo1");
}
function createPieceImgToBePlacedOnBoard(coord, piece) {
    return createPieceSizeImageOnBoardByPath(coord, toPath_(piece), "piece_image_on_board");
}
function removeChildren(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
function drawField(field) {
    var drawBoard = function (board) {
        var contains_pieces_on_board = document.getElementById("contains_pieces_on_board");
        GAME_STATE.f.currentBoard = board;
        // delete everything
        removeChildren(contains_pieces_on_board);
        for (var i = 0; i < board.length; i++) {
            var _loop_3 = function (j) {
                var piece = board[i][j];
                if (piece == null) {
                    return "continue";
                }
                var coord = [i, j];
                var imgNode = createPieceImgToBePlacedOnBoard(coord, piece);
                var selectable = (piece === "Tam2") ? true : (piece.side === Side.Upward);
                if (selectable) {
                    imgNode.style.cursor = "pointer";
                    imgNode.addEventListener('click', function () {
                        selectOwnPieceOnBoard(coord, piece, imgNode);
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
        removeChildren(contains_pieces_on_upward);
        var _loop_4 = function (i) {
            var piece = list[i];
            var imgNode = createPieceImgToBePlacedOnHop1zuo1(i, toPath(piece));
            imgNode.style.cursor = "pointer";
            imgNode.addEventListener('click', function () {
                selectOwnPieceOnHop1zuo1(i, piece, imgNode);
            });
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
        removeChildren(contains_pieces_on_downward);
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
