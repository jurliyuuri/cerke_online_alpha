"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
function fromAbsoluteCoord(_a) {
    var absrow = _a[0], abscol = _a[1];
    var rowind;
    if (absrow === AbsoluteRow.A) {
        rowind = 0;
    }
    else if (absrow === AbsoluteRow.E) {
        rowind = 1;
    }
    else if (absrow === AbsoluteRow.I) {
        rowind = 2;
    }
    else if (absrow === AbsoluteRow.U) {
        rowind = 3;
    }
    else if (absrow === AbsoluteRow.O) {
        rowind = 4;
    }
    else if (absrow === AbsoluteRow.Y) {
        rowind = 5;
    }
    else if (absrow === AbsoluteRow.AI) {
        rowind = 6;
    }
    else if (absrow === AbsoluteRow.AU) {
        rowind = 7;
    }
    else if (absrow === AbsoluteRow.IA) {
        rowind = 8;
    }
    else {
        var _should_not_reach_here = absrow;
        throw new Error("does not happen");
    }
    var colind;
    if (abscol === AbsoluteColumn.K) {
        colind = 0;
    }
    else if (abscol === AbsoluteColumn.L) {
        colind = 1;
    }
    else if (abscol === AbsoluteColumn.N) {
        colind = 2;
    }
    else if (abscol === AbsoluteColumn.T) {
        colind = 3;
    }
    else if (abscol === AbsoluteColumn.Z) {
        colind = 4;
    }
    else if (abscol === AbsoluteColumn.X) {
        colind = 5;
    }
    else if (abscol === AbsoluteColumn.C) {
        colind = 6;
    }
    else if (abscol === AbsoluteColumn.M) {
        colind = 7;
    }
    else if (abscol === AbsoluteColumn.P) {
        colind = 8;
    }
    else {
        var _should_not_reach_here = abscol;
        throw new Error("does not happen");
    }
    if (GAME_STATE.IA_is_down) {
        return [rowind, colind];
    }
    else {
        return [8 - rowind, 8 - colind];
    }
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
function cancelStepping() {
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
        cancelButton.setAttribute('id', 'cancelButton');
        cancelButton.addEventListener('click', cancelStepping);
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
function sendAfterHalfAcceptance(message, src, step) {
    return __awaiter(this, void 0, void 0, function () {
        var url, data, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Sending `after half acceptance`:", JSON.stringify(message));
                    url = 'http://localhost:3000/movies';
                    data = {
                        "id": (Math.random() * 100000) | 0,
                        "message": message
                    };
                    return [4 /*yield*/, fetch(url, {
                            method: 'POST',
                            body: JSON.stringify(data),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).then(function (res) { return res.json(); })
                            .then(function (response) {
                            console.log('Success:', JSON.stringify(response));
                            return {
                                success: Math.random() < 0.5,
                                dat: [1, 2, 3]
                            };
                        })
                            .catch(function (error) { return console.error('Error:', error); })];
                case 1:
                    res = _a.sent();
                    console.log(res);
                    if (!res) {
                        throw new Error("network error!");
                    }
                    if (!res.success) {
                        alert(DICTIONARY.ja.failedWaterEntry);
                        eraseGuide();
                        UI_STATE.selectedCoord = null;
                        cancelStepping();
                        // now it's opponent's turn
                    }
                    else {
                        eraseGuide();
                        UI_STATE.selectedCoord = null;
                        updateFieldAfterHalfAcceptance(message, src, step);
                        drawField(GAME_STATE.f);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function sendNormalMessage(message) {
    return __awaiter(this, void 0, void 0, function () {
        var url, data, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Sending normal move:", JSON.stringify(message));
                    url = 'http://localhost:3000/movies';
                    data = {
                        "id": (Math.random() * 100000) | 0,
                        "message": message
                    };
                    return [4 /*yield*/, fetch(url, {
                            method: 'POST',
                            body: JSON.stringify(data),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).then(function (res) { return res.json(); })
                            .then(function (response) {
                            console.log('Success:', JSON.stringify(response));
                            return {
                                success: Math.random() < 0.5,
                                dat: [1, 2, 3]
                            };
                        })
                            .catch(function (error) { return console.error('Error:', error); })];
                case 1:
                    res = _a.sent();
                    console.log(res);
                    if (!res) {
                        throw new Error("network error!");
                    }
                    if (!res.success) {
                        alert(DICTIONARY.ja.failedWaterEntry);
                        eraseGuide();
                        UI_STATE.selectedCoord = null;
                        if (message.type === "NonTamMove" && message.data.type === "SrcStepDstFinite") {
                            cancelStepping();
                            // FIXME: implement handing over the turn
                        }
                    }
                    else {
                        eraseGuide();
                        UI_STATE.selectedCoord = null;
                        updateField(message);
                        drawField(GAME_STATE.f);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function updateFieldAfterHalfAcceptance(message, src, step) {
    if (message.dest === null) {
        cancelStepping();
        return;
    }
    var _a = fromAbsoluteCoord(message.dest), dest_i = _a[0], dest_j = _a[1];
    // GAME_STATE.f.currentBoard[src_i][src_j] has already become a phantom.
    var backup = GAME_STATE.backupDuringStepping;
    var piece = backup[1];
    cancelStepping(); // this will now restore GAME_STATE.f.currentBoard[src_i][src_j]
    var src_i = src[0], src_j = src[1];
    var step_i = step[0], step_j = step[1];
    if (GAME_STATE.f.currentBoard[step_i][step_j] === null) {
        throw new Error("step is unoccupied");
    }
    var destPiece = GAME_STATE.f.currentBoard[dest_i][dest_j];
    /* it's possible that you are returning to the original position, in which case you don't do anything */
    if (coordEq([src_i, src_j], [dest_i, dest_j])) {
        return;
    }
    if (destPiece !== null) {
        if (destPiece === "Tam2") {
            throw new Error("dest is occupied by Tam2");
        }
        else if (destPiece.side === Side.Upward) {
            throw new Error("dest is occupied by an ally");
        }
        else if (destPiece.side === Side.Downward) {
            var flipped = {
                color: destPiece.color,
                prof: destPiece.prof,
                side: Side.Upward
            };
            GAME_STATE.f.hop1zuo1OfUpward.push(flipped);
        }
        else {
            var _should_not_reach_here = destPiece.side;
            throw new Error("should not reach here");
        }
    }
    GAME_STATE.f.currentBoard[src_i][src_j] = null;
    GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
}
function updateField(message) {
    if (message.type === "NonTamMove") {
        if (message.data.type === "FromHand") {
            var k_1 = message.data;
            // remove the corresponding one from hand
            var ind = GAME_STATE.f.hop1zuo1OfUpward.findIndex(function (piece) { return piece.color === k_1.color && piece.prof === k_1.prof; });
            if (ind === -1) {
                throw new Error("What should exist in the hand does not exist");
            }
            var removed = GAME_STATE.f.hop1zuo1OfUpward.splice(ind, 1)[0];
            // add the removed piece to the destination
            var _a = fromAbsoluteCoord(k_1.dest), i = _a[0], j = _a[1];
            if (GAME_STATE.f.currentBoard[i][j] !== null) {
                throw new Error("Trying to parachute the piece onto an occupied space");
            }
            GAME_STATE.f.currentBoard[i][j] = removed;
        }
        else if (message.data.type === "SrcDst") {
            var k = message.data;
            var _b = fromAbsoluteCoord(k.src), src_i = _b[0], src_j = _b[1];
            var _c = fromAbsoluteCoord(k.dest), dest_i = _c[0], dest_j = _c[1];
            var piece = GAME_STATE.f.currentBoard[src_i][src_j];
            if (piece === null) {
                throw new Error("src is unoccupied");
            }
            var destPiece = GAME_STATE.f.currentBoard[dest_i][dest_j];
            /* it's NOT possible that you are returning to the original position, in which case you don't do anything */
            if (destPiece !== null) {
                if (destPiece === "Tam2") {
                    throw new Error("dest is occupied by Tam2");
                }
                else if (destPiece.side === Side.Upward) {
                    throw new Error("dest is occupied by an ally");
                }
                else if (destPiece.side === Side.Downward) {
                    var flipped = {
                        color: destPiece.color,
                        prof: destPiece.prof,
                        side: Side.Upward
                    };
                    GAME_STATE.f.hop1zuo1OfUpward.push(flipped);
                }
                else {
                    var _should_not_reach_here = destPiece.side;
                    throw new Error("should not reach here");
                }
            }
            GAME_STATE.f.currentBoard[src_i][src_j] = null;
            GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        }
        else if (message.data.type === "SrcStepDstFinite") {
            var k = message.data;
            var _d = fromAbsoluteCoord(k.src), src_i = _d[0], src_j = _d[1];
            var _e = fromAbsoluteCoord(k.dest), dest_i = _e[0], dest_j = _e[1];
            // GAME_STATE.f.currentBoard[src_i][src_j] has already become a phantom.
            var backup = GAME_STATE.backupDuringStepping;
            var piece = backup[1];
            cancelStepping();
            // this will now restore GAME_STATE.f.currentBoard[src_i][src_j]
            var _f = fromAbsoluteCoord(k.step), step_i = _f[0], step_j = _f[1];
            if (GAME_STATE.f.currentBoard[step_i][step_j] === null) {
                throw new Error("step is unoccupied");
            }
            var destPiece = GAME_STATE.f.currentBoard[dest_i][dest_j];
            /* it's possible that you are returning to the original position, in which case you don't do anything */
            if (coordEq([src_i, src_j], [dest_i, dest_j])) {
                return;
            }
            if (destPiece !== null) {
                if (destPiece === "Tam2") {
                    throw new Error("dest is occupied by Tam2");
                }
                else if (destPiece.side === Side.Upward) {
                    throw new Error("dest is occupied by an ally");
                }
                else if (destPiece.side === Side.Downward) {
                    var flipped = {
                        color: destPiece.color,
                        prof: destPiece.prof,
                        side: Side.Upward
                    };
                    GAME_STATE.f.hop1zuo1OfUpward.push(flipped);
                }
                else {
                    var _should_not_reach_here = destPiece.side;
                    throw new Error("should not reach here");
                }
            }
            GAME_STATE.f.currentBoard[src_i][src_j] = null;
            GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        }
        else {
            var _should_not_reach_here = message.data;
        }
    }
    else if (message.type === "TamMove") {
        var k = message;
        var _g = fromAbsoluteCoord(k.src), src_i = _g[0], src_j = _g[1];
        var _h = fromAbsoluteCoord(k.secondDest), secondDest_i = _h[0], secondDest_j = _h[1];
        var piece = GAME_STATE.f.currentBoard[src_i][src_j];
        if (piece === null) {
            throw new Error("src is unoccupied");
        }
        if (piece !== "Tam2") {
            throw new Error("TamMove but not Tam2");
        }
        /* it's possible that you are returning to the original position, in which case you don't do anything */
        if (coordEq([src_i, src_j], [secondDest_i, secondDest_j])) {
            return;
        }
        GAME_STATE.f.currentBoard[src_i][src_j] = null;
        GAME_STATE.f.currentBoard[secondDest_i][secondDest_j] = piece;
    }
    else {
        var _should_not_reach_here = message;
    }
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
            sendNormalMessage(message);
            return;
        }
        else {
            // FIXME: implement me
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
        sendNormalMessage(message);
        return;
    }
    else {
        stepping(from, piece, to, destPiece);
        return;
    }
}
function getThingsGoingAfterStepping_Finite(step, piece, dest) {
    console.log("src", UI_STATE.selectedCoord);
    console.log("stepped on", step);
    console.log("dest", dest);
    if (piece === "Tam2") {
        alert("FIXME: implement Tam2's movement, who initially stepped");
        return;
    }
    if (UI_STATE.selectedCoord == null) {
        alert("stepping, but initial is NULL!!!!!!!");
        throw new Error("stepping, but initial is NULL!!!!!!!");
    }
    if (UI_STATE.selectedCoord[0] === "Hop1zuo1") {
        alert("stepping, but initial is Hop1zuo1!!!!!!!");
        throw new Error("stepping, but initial is Hop1zuo1!!!!!!!");
    }
    var message = {
        type: "NonTamMove",
        data: {
            type: "SrcStepDstFinite",
            step: toAbsoluteCoord(step),
            dest: toAbsoluteCoord(dest),
            src: toAbsoluteCoord(UI_STATE.selectedCoord)
        }
    };
    sendNormalMessage(message);
    return;
}
function sendInfAfterStep(message) {
    return __awaiter(this, void 0, void 0, function () {
        var url, data, res, step, plannedDirection, centralNode, contains_guides, piece, guideListGreen, filteredList, src, passer, _loop_1, ind;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Sending normal move:", JSON.stringify(message));
                    url = 'http://localhost:3000/movies';
                    data = {
                        "id": (Math.random() * 100000) | 0,
                        "message": message
                    };
                    return [4 /*yield*/, fetch(url, {
                            method: 'POST',
                            body: JSON.stringify(data),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).then(function (res) { return res.json(); })
                            .then(function (response) {
                            console.log('Success:', JSON.stringify(response));
                            return {
                                ciurl: [
                                    Math.random() < 0.5,
                                    Math.random() < 0.5,
                                    Math.random() < 0.5,
                                    Math.random() < 0.5,
                                    Math.random() < 0.5
                                ],
                                dat: [1, 2, 3]
                            };
                        })
                            .catch(function (error) { return console.error('Error:', error); })];
                case 1:
                    res = _a.sent();
                    console.log(res);
                    if (!res) {
                        throw new Error("network error!");
                    }
                    displayCiurl(res.ciurl);
                    document.getElementById("cancelButton").remove(); // destroy the cancel button, since it can no longer be cancelled
                    eraseGuide(); // this removes the central guide, as well as the yellow and green ones
                    step = fromAbsoluteCoord(message.step);
                    plannedDirection = fromAbsoluteCoord(message.plannedDirection);
                    centralNode = createPieceSizeImageOnBoardByPath_Shifted(step, "selection2", "selection");
                    centralNode.style.zIndex = "200";
                    contains_guides = document.getElementById("contains_guides");
                    contains_guides.appendChild(centralNode);
                    piece = {
                        color: message.color,
                        prof: message.prof,
                        side: Side.Upward
                    };
                    guideListGreen = calculateMovablePositions(step, piece, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue).infinite;
                    filteredList = guideListGreen.filter(function (c) {
                        var subtractStep = function (_a) {
                            var x = _a[0], y = _a[1];
                            var step_x = step[0], step_y = step[1];
                            return [x - step_x, y - step_y];
                        };
                        var limit = res.ciurl.filter(function (x) { return x; }).length;
                        var _a = subtractStep(c), deltaC_x = _a[0], deltaC_y = _a[1];
                        var _b = subtractStep(plannedDirection), deltaPlan_x = _b[0], deltaPlan_y = _b[1];
                        return (
                        // 1. (c - step) crossed with (plannedDirection - step) gives zero
                        deltaC_x * deltaPlan_y - deltaPlan_x * deltaC_y === 0 &&
                            // 2.  (c - step) dotted with (plannedDirection - step) gives positive
                            deltaC_x * deltaPlan_x + deltaC_y * deltaPlan_y > 0 &&
                            // 3. deltaC must not exceed the limit enforced by ciurl
                            Math.max(Math.abs(deltaC_x), Math.abs(deltaC_y)) <= limit);
                    });
                    src = fromAbsoluteCoord(message.src);
                    passer = createCircleGuideImageAt(src, "ct");
                    passer.addEventListener('click', function (ev) {
                        sendAfterHalfAcceptance({
                            type: "AfterHalfAcceptance",
                            dest: null
                        }, src, step);
                    });
                    passer.style.zIndex = "200";
                    contains_guides.appendChild(passer);
                    _loop_1 = function (ind) {
                        var _a = filteredList[ind], i = _a[0], j = _a[1];
                        if (coordEq(src, [i, j])) {
                            return "continue";
                        }
                        var destPiece = GAME_STATE.f.currentBoard[i][j];
                        // cannot step twice
                        if (destPiece === "Tam2" || (destPiece !== null && destPiece.side === Side.Upward)) {
                            return "continue";
                        }
                        var img = createCircleGuideImageAt(filteredList[ind], "ct2");
                        img.addEventListener('click', function (ev) {
                            sendAfterHalfAcceptance({
                                type: "AfterHalfAcceptance",
                                dest: [i, j]
                            }, src, step);
                        });
                        img.style.zIndex = "200";
                        contains_guides.appendChild(img);
                    };
                    for (ind = 0; ind < filteredList.length; ind++) {
                        _loop_1(ind);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// copied and pasted from https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
// Standard Normal variate using Box-Muller transform.
function randn_bm() {
    var u = 0, v = 0;
    while (u === 0)
        u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0)
        v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
function displayCiurl(ciurl) {
    var _a;
    var contains_ciurl = document.getElementById("contains_ciurl");
    clearCiurl();
    // should always lie around 300 ~ 370, when BOX_SIZE is 70
    var averageLeft = BOX_SIZE * (335 / 70 + randn_bm() / 6);
    var hop1zuo1_height = 140;
    var board_height = 631;
    var averageTop = 84 + hop1zuo1_height + board_height;
    var imgs = ciurl.map(function (side, ind) { return createCiurl(side, {
        left: averageLeft + BOX_SIZE * 0.2 * randn_bm(),
        top: averageTop + (ind + 0.5 - ciurl.length / 2) * 26 + BOX_SIZE * 0.05 * randn_bm(),
        rotateDeg: Math.random() * 40 - 20
    }); });
    // Fisher-Yates
    for (var i = imgs.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [imgs[j], imgs[i]], imgs[i] = _a[0], imgs[j] = _a[1];
    }
    for (var i = 0; i < imgs.length; i++) {
        contains_ciurl.appendChild(imgs[i]);
    }
}
function clearCiurl() {
    removeChildren(document.getElementById("contains_ciurl"));
}
function getThingsGoingAfterStepping_Infinite(src, step, piece, plannedDest) {
    console.log("stepped on", step);
    console.log("dest", plannedDest);
    if (piece === "Tam2") {
        throw new Error("No, Tam2 should have no infinite movement");
    }
    sendInfAfterStep({
        type: "InfAfterStep",
        color: piece.color,
        prof: piece.prof,
        step: toAbsoluteCoord(step),
        plannedDirection: toAbsoluteCoord(plannedDest),
        src: toAbsoluteCoord(src)
    });
}
function display_guide_after_stepping(coord, piece, parent, list, path) {
    var isFinite = path == "ct";
    var src = UI_STATE.selectedCoord;
    if (src == null) {
        throw new Error("though stepping, null startpoint!!!!!");
    }
    else if (src[0] === "Hop1zuo1") {
        throw new Error("though stepping, hop1zuo1 startpoint!!!!!");
    }
    var _loop_2 = function (ind) {
        var _a = list[ind], i = _a[0], j = _a[1];
        var destPiece = GAME_STATE.f.currentBoard[i][j];
        // cannot step twice
        if (destPiece === "Tam2" || (destPiece !== null && destPiece.side === Side.Upward)) {
            return "continue";
        }
        var img = createCircleGuideImageAt(list[ind], path);
        img.addEventListener('click', isFinite ? function (ev) {
            getThingsGoingAfterStepping_Finite(coord, piece, list[ind]);
        } : function (ev) {
            getThingsGoingAfterStepping_Infinite(src, coord, piece, list[ind]);
        });
        img.style.zIndex = "200";
        parent.appendChild(img);
    };
    for (var ind = 0; ind < list.length; ind++) {
        _loop_2(ind);
    }
}
function display_guide(coord, piece, parent, list) {
    var _loop_3 = function (ind) {
        // draw the yellow guides
        var img = createCircleGuideImageAt(list[ind], "ct");
        // click on it to get things going
        img.addEventListener('click', function (ev) {
            getThingsGoing(ev, piece, coord, list[ind]);
        });
        parent.appendChild(img);
    };
    for (var ind = 0; ind < list.length; ind++) {
        _loop_3(ind);
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
            var _loop_4 = function (j) {
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
                _loop_4(j);
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
            var _loop_5 = function (j) {
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
                _loop_5(j);
            }
        }
    };
    var drawHop1zuo1OfUpward = function (list) {
        var contains_pieces_on_upward = document.getElementById("contains_pieces_on_upward");
        GAME_STATE.f.hop1zuo1OfUpward = list;
        // delete everything
        removeChildren(contains_pieces_on_upward);
        var _loop_6 = function (i) {
            var piece = list[i];
            var imgNode = createPieceImgToBePlacedOnHop1zuo1(i, toPath(piece));
            imgNode.style.cursor = "pointer";
            imgNode.addEventListener('click', function () {
                selectOwnPieceOnHop1zuo1(i, piece, imgNode);
            });
            contains_pieces_on_upward.appendChild(imgNode);
        };
        for (var i = 0; i < list.length; i++) {
            _loop_6(i);
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
