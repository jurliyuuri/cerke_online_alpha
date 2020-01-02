"use strict";
const { stopPolling, resumePolling, isPollingAllowed, allowPolling } = (() => {
    let POLLING_ALLOWED = true;
    // to be called when a new hand is completed and is waiting for the ty mok1 / ta xot1 decision.
    const stopPolling = () => {
        POLLING_ALLOWED = false;
    };
    const resumePolling = () => {
        POLLING_ALLOWED = true;
        window.setTimeout(sendMainPoll, 500 * 0.8093);
    };
    const allowPolling = () => {
        POLLING_ALLOWED = true;
    };
    const isPollingAllowed = () => {
        return POLLING_ALLOWED;
    };
    return { stopPolling, resumePolling, isPollingAllowed, allowPolling };
})();
// I repentfully use a global state
async function sendMainPoll() {
    console.log("poll");
    if (!isPollingAllowed()) {
        return;
    }
    const res = await sendStuffTo("mainpoll", "`polling for the opponent's move`", {}, (response) => {
        console.log("Success; the server returned:", JSON.stringify(response));
        return response;
    });
    if (!res.legal) {
        alert(`sending MainPoll somehow resulted in an error: ${res.whyIllegal}`);
        throw new Error(`sending MainPoll somehow resulted in an error: ${res.whyIllegal}`);
    }
    if (res.content !== "not yet") {
        console.log("ding!");
        const opponent_move = res.content;
        console.log(opponent_move);
        if (opponent_move.type === "NonTamMove") {
            if (opponent_move.data.type === "SrcDst") {
                await animateOpponentSrcDst(opponent_move.data);
                GAME_STATE.is_my_turn = true;
            }
            else if (opponent_move.data.type === "FromHand") {
                const piece = { prof: opponent_move.data.prof, color: opponent_move.data.color, side: Side.Downward };
                await animateOpponentFromHand(piece, fromAbsoluteCoord(opponent_move.data.dest));
                GAME_STATE.is_my_turn = true;
            }
            else if (opponent_move.data.type === "SrcStepDstFinite") {
                await animateOpponentSrcStepDstFinite(opponent_move.data);
                GAME_STATE.is_my_turn = true;
            }
            else {
                const a = opponent_move.data;
                throw new Error("does not happen");
            }
        }
        else if (opponent_move.type === "TamMove") {
            if (opponent_move.stepStyle === "NoStep") {
                await animateOpponentTamNoStep(fromAbsoluteCoord(opponent_move.src), fromAbsoluteCoord(opponent_move.firstDest), fromAbsoluteCoord(opponent_move.secondDest));
                GAME_STATE.is_my_turn = true;
            }
            else if (opponent_move.stepStyle === "StepsDuringFormer") {
                await animateOpponentTamSteppingDuringFormer({
                    src: fromAbsoluteCoord(opponent_move.src),
                    firstDest: fromAbsoluteCoord(opponent_move.firstDest),
                    secondDest: fromAbsoluteCoord(opponent_move.secondDest),
                    step: fromAbsoluteCoord(opponent_move.step),
                });
                GAME_STATE.is_my_turn = true;
            }
            else if (opponent_move.stepStyle === "StepsDuringLatter") {
                await animateOpponentTamSteppingDuringLatter({
                    src: fromAbsoluteCoord(opponent_move.src),
                    firstDest: fromAbsoluteCoord(opponent_move.firstDest),
                    secondDest: fromAbsoluteCoord(opponent_move.secondDest),
                    step: fromAbsoluteCoord(opponent_move.step),
                });
                GAME_STATE.is_my_turn = true;
            }
            else {
                const a = opponent_move.stepStyle;
                throw new Error("does not happen");
            }
        }
        else if (opponent_move.type === "InfAfterStep") {
            const finalResult = (() => {
                if (opponent_move.finalResult == null) {
                    return new Promise(async (resolve, reject) => {
                        while (true) {
                            const res = await sendStuffTo("infpoll", "`polling for the opponent's afterhalfacceptance`", {}, (response) => {
                                console.log("Success; the server returned:", JSON.stringify(response));
                                return response;
                            });
                            if (res.legal === false) {
                                throw new Error("not good!!!");
                            }
                            else if (res.content !== "not yet") {
                                if (res.content.type !== "InfAfterStep") {
                                    throw new Error("nooooooo");
                                }
                                resolve(res.content.finalResult);
                                return;
                            }
                            await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
                        }
                    });
                }
                else {
                    return Promise.resolve(opponent_move.finalResult);
                }
            })();
            await animateOpponentInfAfterStep({
                src: fromAbsoluteCoord(opponent_move.src),
                step: fromAbsoluteCoord(opponent_move.step),
                plannedDirection: fromAbsoluteCoord(opponent_move.plannedDirection),
                stepping_ciurl: opponent_move.stepping_ciurl,
                finalResult,
            });
            GAME_STATE.is_my_turn = true;
        }
        else {
            const a = opponent_move;
            throw new Error("does not happen");
        }
    }
    else {
        await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
        await sendMainPoll();
    }
}
let UI_STATE = {
    selectedCoord: null,
};
function eraseGuide() {
    removeChildren(document.getElementById("contains_guides"));
    removeChildren(document.getElementById("contains_guides_on_upward"));
}
function erasePhantomAndOptionallyCancelButton() {
    const contains_phantom = document.getElementById("contains_phantom");
    while (contains_phantom.firstChild) {
        contains_phantom.removeChild(contains_phantom.firstChild);
    }
}
function cancelStepping() {
    eraseGuide();
    erasePhantomAndOptionallyCancelButton();
    document.getElementById("protective_cover_over_field").classList.add("nocover");
    // resurrect the original one
    const backup = GAME_STATE.backupDuringStepping;
    const from = backup[0];
    GAME_STATE.f.currentBoard[from[0]][from[1]] = backup[1];
    GAME_STATE.backupDuringStepping = null;
    UI_STATE.selectedCoord = null;
    drawField();
}
function getThingsGoingAfterSecondTamMoveThatStepsInTheLatterHalf(theVerySrc, firstDest, stepsOn) {
    eraseGuide();
    document.getElementById("protective_cover_over_field").classList.remove("nocover");
    document.getElementById("protective_tam_cover_over_field").classList.remove("nocover");
    // delete the original one
    GAME_STATE.backupDuringStepping = [firstDest, "Tam2"];
    GAME_STATE.f.currentBoard[firstDest[0]][firstDest[1]] = null;
    document.getElementById("cancelButton").remove();
    drawField();
    drawPhantomAt(firstDest, "Tam2");
    drawCancel(function () {
        eraseGuide();
        erasePhantomAndOptionallyCancelButton();
        document.getElementById("protective_cover_over_field").classList.add("nocover");
        document.getElementById("protective_tam_cover_over_field").classList.add("nocover");
        // resurrect the original one
        GAME_STATE.f.currentBoard[theVerySrc[0]][theVerySrc[1]] = "Tam2";
        GAME_STATE.backupDuringStepping = null;
        UI_STATE.selectedCoord = null;
        drawField();
    });
    drawHoverAt_(stepsOn, "Tam2", function (coord, piece) {
        const contains_guides = document.getElementById("contains_guides");
        const centralNode = createPieceSizeSelectionButtonOnBoard_Shifted(coord);
        contains_guides.appendChild(centralNode);
        const { finite: guideListYellow, infinite: guideListGreen } = calculateMovablePositions(coord, piece, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue);
        if (guideListGreen.length > 0) {
            throw new Error("should not happen");
        }
        for (let ind = 0; ind < guideListYellow.length; ind++) {
            const secondDest = guideListYellow[ind];
            const [i, j] = secondDest;
            const destPiece = GAME_STATE.f.currentBoard[i][j];
            // cannot step twice
            if (destPiece === "Tam2" || (destPiece !== null && destPiece.side === Side.Upward)) {
                continue;
            }
            const img = createCircleGuideImageAt(secondDest, "ctam");
            img.addEventListener("click", function () {
                const message = {
                    type: "TamMove",
                    stepStyle: "StepsDuringLatter",
                    src: toAbsoluteCoord(theVerySrc),
                    step: toAbsoluteCoord(stepsOn),
                    firstDest: toAbsoluteCoord(firstDest),
                    secondDest: toAbsoluteCoord(secondDest),
                };
                sendNormalMessage(message);
                eraseGuide();
                erasePhantomAndOptionallyCancelButton();
                document.getElementById("protective_cover_over_field").classList.add("nocover");
                document.getElementById("protective_tam_cover_over_field").classList.add("nocover");
                return;
            });
            img.style.zIndex = "200";
            contains_guides.appendChild(img);
        }
        return;
    });
    return;
}
/**
 * @param from where the first half started
 * @param to where the first half ended
 * @param step supplied when the first half of the move stepped a piece
 */
function afterFirstTamMove(from, to, step) {
    eraseGuide();
    document.getElementById("protective_tam_cover_over_field").classList.remove("nocover");
    // stepping should now have been completed
    document.getElementById("protective_cover_over_field").classList.add("nocover");
    GAME_STATE.f.currentBoard[from[0]][from[1]] = null;
    GAME_STATE.f.currentBoard[to[0]][to[1]] = "Tam2";
    drawField();
    const drawTam2HoverNonshiftedAt = function (coord) {
        const contains_phantom = document.getElementById("contains_phantom");
        const img = createPieceSizeImageOnBoardByPath(coord, toPath_("Tam2"), "piece_image_on_board");
        img.style.zIndex = "100";
        img.style.cursor = "pointer";
        const selectTam2Hover = function () {
            const contains_guides = document.getElementById("contains_guides");
            const centralNode = createPieceSizeImageOnBoardByPath(coord, "selection2", "selection");
            centralNode.style.cursor = "pointer";
            centralNode.style.zIndex = "200";
            contains_guides.appendChild(centralNode);
            const { finite: guideListYellow, infinite: guideListGreen } = calculateMovablePositions(coord, "Tam2", GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue);
            if (guideListGreen.length > 0) {
                throw new Error("should not happen");
            }
            for (let ind = 0; ind < guideListYellow.length; ind++) {
                const [i, j] = guideListYellow[ind];
                const destPiece = GAME_STATE.f.currentBoard[i][j];
                // cannot step twice
                if (step !== undefined && destPiece !== null) {
                    continue;
                }
                const img = createCircleGuideImageAt(guideListYellow[ind], "ctam");
                if (destPiece === null) {
                    img.addEventListener("click", function () {
                        (function getThingsGoingAfterSecondTamMoveThatDoesNotStepInTheLatterHalf(theVerySrc, firstDest, to) {
                            console.assert(GAME_STATE.f.currentBoard[to[0]][to[1]] == null);
                            const message = step ? {
                                type: "TamMove",
                                stepStyle: "StepsDuringFormer",
                                src: toAbsoluteCoord(theVerySrc),
                                step: toAbsoluteCoord(step),
                                firstDest: toAbsoluteCoord(firstDest),
                                secondDest: toAbsoluteCoord(to),
                            } : {
                                type: "TamMove",
                                stepStyle: "NoStep",
                                src: toAbsoluteCoord(theVerySrc),
                                firstDest: toAbsoluteCoord(firstDest),
                                secondDest: toAbsoluteCoord(to),
                            };
                            sendNormalMessage(message);
                            document.getElementById("protective_tam_cover_over_field").classList.add("nocover");
                            // the cancel button, which must be destroyed since the move can no longer be cancelled, is also destroyed here
                            erasePhantomAndOptionallyCancelButton();
                            eraseGuide(); // this removes the central guide, as well as the yellow and green ones
                            return;
                        })(from, coord, guideListYellow[ind]);
                    });
                }
                else {
                    img.addEventListener("click", function () {
                        getThingsGoingAfterSecondTamMoveThatStepsInTheLatterHalf(from, coord, guideListYellow[ind]);
                    });
                }
                img.style.zIndex = "200";
                contains_guides.appendChild(img);
            }
        };
        img.addEventListener("click", selectTam2Hover);
        contains_phantom.appendChild(img);
        // draw as already selected
        selectTam2Hover();
    };
    drawPhantomAt(from, "Tam2");
    drawCancel(function cancelTam2FirstMove() {
        eraseGuide();
        erasePhantomAndOptionallyCancelButton();
        document.getElementById("protective_tam_cover_over_field").classList.add("nocover");
        document.getElementById("protective_cover_over_field").classList.add("nocover");
        // resurrect the original one
        GAME_STATE.f.currentBoard[to[0]][to[1]] = null;
        GAME_STATE.f.currentBoard[from[0]][from[1]] = "Tam2";
        UI_STATE.selectedCoord = null;
        drawField();
    });
    drawTam2HoverNonshiftedAt(to);
}
function drawPhantomAt(coord, piece) {
    const contains_phantom = document.getElementById("contains_phantom");
    erasePhantomAndOptionallyCancelButton();
    const phantom = createPieceImgToBePlacedOnBoard(coord, piece);
    phantom.style.opacity = "0.1";
    contains_phantom.appendChild(phantom);
}
function drawCancel(fn) {
    const contains_phantom = document.getElementById("contains_phantom");
    const cancelButton = createCancelButton();
    cancelButton.width = 80;
    cancelButton.height = 80;
    cancelButton.style.zIndex = "100";
    cancelButton.style.cursor = "pointer";
    cancelButton.setAttribute("id", "cancelButton");
    cancelButton.addEventListener("click", fn);
    contains_phantom.appendChild(cancelButton);
}
function drawHoverAt_(coord, piece, selectHover_) {
    const contains_phantom = document.getElementById("contains_phantom");
    const img = createPieceSizeImageOnBoardByPath_Shifted(coord, toPath_(piece), "piece_image_on_board");
    img.style.zIndex = "100";
    img.style.cursor = "pointer";
    const selectHover = function () {
        selectHover_(coord, piece);
    };
    img.addEventListener("click", selectHover);
    contains_phantom.appendChild(img);
    // draw as already selected
    selectHover();
}
function stepping(from, piece, to) {
    eraseGuide();
    document.getElementById("protective_cover_over_field").classList.remove("nocover");
    // delete the original one
    GAME_STATE.backupDuringStepping = [from, piece];
    GAME_STATE.f.currentBoard[from[0]][from[1]] = null;
    drawField();
    drawPhantomAt(from, piece);
    drawCancel(cancelStepping);
    drawHoverAt_(to, piece, function (coord, piece) {
        const contains_guides = document.getElementById("contains_guides");
        const centralNode = createPieceSizeSelectionButtonOnBoard_Shifted(coord);
        contains_guides.appendChild(centralNode);
        const { finite: guideListYellow, infinite: guideListGreen } = calculateMovablePositions(coord, piece, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue);
        /* calculateMovablePositions does not filter out what is banned by tam2 hue a uai1; display_guide_after_stepping handles that. */
        display_guide_after_stepping(coord, { piece, path: "ct" }, contains_guides, guideListYellow);
        if (piece === "Tam2") {
            if (guideListGreen.length > 0) {
                throw new Error("should not happen");
            }
            return;
        }
        display_guide_after_stepping(coord, { piece, path: "ct2" }, contains_guides, guideListGreen);
    });
}
async function sendAfterHalfAcceptance(message, src, step) {
    const res = await sendStuff("`after half acceptance`", message, (response) => {
        console.log("Success; the server returned:", JSON.stringify(response));
        return response;
    });
    if (!res.legal) {
        alert(`Illegal API sent, the reason being ${res.whyIllegal}`);
        throw new Error(`Illegal API sent, the reason being ${res.whyIllegal}`);
    }
    if (!res.dat.waterEntryHappened) {
        eraseGuide();
        UI_STATE.selectedCoord = null;
        updateFieldAfterHalfAcceptance(message, src, step);
        drawField();
        GAME_STATE.is_my_turn = false;
        return;
    }
    await animateWaterEntryLogo();
    displayCiurl(res.dat.ciurl);
    await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
    if (res.dat.ciurl.filter((a) => a).length < 3) {
        alert(DICTIONARY.ja.failedWaterEntry);
        eraseGuide();
        UI_STATE.selectedCoord = null;
        cancelStepping();
        GAME_STATE.is_my_turn = false;
    }
    else {
        eraseGuide();
        UI_STATE.selectedCoord = null;
        updateFieldAfterHalfAcceptance(message, src, step);
        drawField();
        GAME_STATE.is_my_turn = false;
    }
}
async function sendStuffTo(api_name, log, message, validateInput) {
    // cover up the UI
    const cover_while_asyncawait = document.getElementById("protective_cover_over_field_while_asyncawait");
    cover_while_asyncawait.classList.remove("nocover");
    console.log(`Sending ${log}:`, JSON.stringify(message));
    const url = `http://localhost:23564/${api_name}/`;
    const data = {
        id: (Math.random() * 100000) | 0,
        message,
    };
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.access_token}`
        },
    }).then(function (res) {
        cover_while_asyncawait.classList.add("nocover");
        return res.json();
    }).then(validateInput)
        .catch(function (error) {
        cover_while_asyncawait.classList.add("nocover");
        console.error("Error:", error);
        return;
    });
    console.log(res);
    cover_while_asyncawait.classList.add("nocover");
    if (!res) {
        alert("network error!");
        cover_while_asyncawait.classList.add("nocover");
        throw new Error("network error!");
    }
    return res;
}
async function sendStuff(log, message, validateInput) {
    return await sendStuffTo("slow", log, message, validateInput);
}
async function sendNormalMessage(message) {
    const res = await sendStuff("normal move", message, (response) => {
        console.log("Success; the server returned:", JSON.stringify(response));
        return response;
    });
    if (!res.legal) {
        alert(`Illegal API sent, the reason being ${res.whyIllegal}`);
        throw new Error(`Illegal API sent, the reason being ${res.whyIllegal}`);
    }
    if (!res.dat.waterEntryHappened) {
        eraseGuide();
        UI_STATE.selectedCoord = null;
        updateField(message);
        drawField();
        GAME_STATE.is_my_turn = false;
        return;
    }
    await animateWaterEntryLogo();
    displayCiurl(res.dat.ciurl);
    await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
    if (res.dat.ciurl.filter((a) => a).length < 3) {
        alert(DICTIONARY.ja.failedWaterEntry);
        eraseGuide();
        UI_STATE.selectedCoord = null;
        if (message.type === "NonTamMove" && message.data.type === "SrcStepDstFinite") {
            cancelStepping();
        }
        GAME_STATE.is_my_turn = false;
    }
    else {
        eraseGuide();
        UI_STATE.selectedCoord = null;
        updateField(message);
        drawField();
        GAME_STATE.is_my_turn = false;
    }
}
function updateFieldAfterHalfAcceptance(message, src, step) {
    console.log(src, step);
    if (message.dest === null) {
        cancelStepping();
        return;
    }
    const [dest_i, dest_j] = fromAbsoluteCoord(message.dest);
    // GAME_STATE.f.currentBoard[src_i][src_j] has already become a phantom.
    const backup = GAME_STATE.backupDuringStepping;
    const piece = backup[1];
    cancelStepping(); // this will now restore GAME_STATE.f.currentBoard[src_i][src_j]
    const [src_i, src_j] = src;
    const [step_i, step_j] = step;
    if (GAME_STATE.f.currentBoard[step_i][step_j] === null) {
        throw new Error("step is unoccupied");
    }
    const destPiece = GAME_STATE.f.currentBoard[dest_i][dest_j];
    /* it's possible that you are returning to the original position, in which case you don't do anything */
    if (coordEq([src_i, src_j], [dest_i, dest_j])) {
        return;
    }
    if (destPiece !== null) {
        takeTheDownwardPieceAndCheckHand(destPiece);
    }
    GAME_STATE.f.currentBoard[src_i][src_j] = null;
    GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
}
/**
 * Unsafe function.
 * @param destPiece Assumed to be downward; if not, an error is thrown
 */
function takeTheDownwardPieceAndCheckHand(destPiece) {
    const flipped = (() => {
        if (destPiece === "Tam2") {
            throw new Error("dest is occupied by Tam2");
        }
        else if (destPiece.side === Side.Upward) {
            throw new Error("dest is occupied by an ally");
        }
        else if (destPiece.side === Side.Downward) {
            const flipped = {
                color: destPiece.color,
                prof: destPiece.prof,
                side: Side.Upward,
            };
            return flipped;
        }
        else {
            const _should_not_reach_here = destPiece.side;
            throw new Error("should not reach here");
        }
    })();
    const old_state = calculateHandsAndScore(GAME_STATE.f.hop1zuo1OfUpward);
    GAME_STATE.f.hop1zuo1OfUpward.push(flipped);
    const new_state = calculateHandsAndScore(GAME_STATE.f.hop1zuo1OfUpward);
    if (new_state.score === old_state.score) {
        return;
    }
    setTimeout(() => {
        drawScoreDisplay(new_state.hands);
        drawTyMok1AndTaXot1Buttons(new_state.score);
    }, 1000 * 0.8093);
    stopPolling();
}
function calculateHandsAndScore(pieces) {
    const hop1zuo1 = pieces.map((p) => toObtainablePiece(p.color, p.prof));
    const res = calculate_hands_and_score_from_pieces(hop1zuo1);
    if (res.error === true) {
        throw new Error(`should not happen: too many of ${res.too_many.join(",")}`);
    }
    return { hands: res.hands, score: res.score };
}
function toObtainablePiece(color, prof) {
    const a = [
        ["赤船", "赤兵", "赤弓", "赤車", "赤虎", "赤馬", "赤筆", "赤巫", "赤将", "赤王"],
        ["黒船", "黒兵", "黒弓", "黒車", "黒虎", "黒馬", "黒筆", "黒巫", "黒将", "黒王"],
    ];
    return a[color][prof];
}
function updateField(message) {
    if (message.type === "NonTamMove") {
        if (message.data.type === "FromHand") {
            const k = message.data;
            // remove the corresponding one from hand
            const ind = GAME_STATE.f.hop1zuo1OfUpward.findIndex((piece) => piece.color === k.color && piece.prof === k.prof);
            if (ind === -1) {
                throw new Error("What should exist in the hand does not exist");
            }
            const [removed] = GAME_STATE.f.hop1zuo1OfUpward.splice(ind, 1);
            // add the removed piece to the destination
            const [i, j] = fromAbsoluteCoord(k.dest);
            if (GAME_STATE.f.currentBoard[i][j] !== null) {
                throw new Error("Trying to parachute the piece onto an occupied space");
            }
            GAME_STATE.f.currentBoard[i][j] = removed;
        }
        else if (message.data.type === "SrcDst") {
            const k = message.data;
            const [src_i, src_j] = fromAbsoluteCoord(k.src);
            const [dest_i, dest_j] = fromAbsoluteCoord(k.dest);
            const piece = GAME_STATE.f.currentBoard[src_i][src_j];
            if (piece === null) {
                throw new Error("src is unoccupied");
            }
            const destPiece = GAME_STATE.f.currentBoard[dest_i][dest_j];
            /* it's NOT possible that you are returning to the original position, in which case you don't do anything */
            if (destPiece !== null) {
                takeTheDownwardPieceAndCheckHand(destPiece);
            }
            GAME_STATE.f.currentBoard[src_i][src_j] = null;
            GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        }
        else if (message.data.type === "SrcStepDstFinite") {
            const k = message.data;
            const [src_i, src_j] = fromAbsoluteCoord(k.src);
            const [dest_i, dest_j] = fromAbsoluteCoord(k.dest);
            // GAME_STATE.f.currentBoard[src_i][src_j] has already become a phantom.
            const backup = GAME_STATE.backupDuringStepping;
            const piece = backup[1];
            cancelStepping();
            // this will now restore GAME_STATE.f.currentBoard[src_i][src_j]
            const [step_i, step_j] = fromAbsoluteCoord(k.step);
            if (GAME_STATE.f.currentBoard[step_i][step_j] === null) {
                throw new Error("step is unoccupied");
            }
            const destPiece = GAME_STATE.f.currentBoard[dest_i][dest_j];
            /* it's possible that you are returning to the original position, in which case you don't do anything */
            if (coordEq([src_i, src_j], [dest_i, dest_j])) {
                return;
            }
            if (destPiece !== null) {
                takeTheDownwardPieceAndCheckHand(destPiece);
            }
            GAME_STATE.f.currentBoard[src_i][src_j] = null;
            GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        }
        else {
            const _should_not_reach_here = message.data;
        }
    }
    else if (message.type === "TamMove") {
        const k = message;
        const [firstDest_i, firstDest_j] = fromAbsoluteCoord(k.firstDest);
        const [secondDest_i, secondDest_j] = fromAbsoluteCoord(k.secondDest);
        if (message.stepStyle === "StepsDuringLatter") {
            // We decided that Tam2 should not be present on the board if it is StepsDuringLatter
            GAME_STATE.f.currentBoard[secondDest_i][secondDest_j] = "Tam2";
            return;
        }
        // If not StepsDuringLatter, we decided that the piece should actually be located in firstDest after the first move
        const piece = GAME_STATE.f.currentBoard[firstDest_i][firstDest_j];
        if (piece === null) {
            throw new Error("firstDest is unoccupied");
        }
        if (piece !== "Tam2") {
            throw new Error("TamMove but not Tam2");
        }
        /* it's possible that you are returning to the original position, in which case you don't do anything */
        if (coordEq([firstDest_i, firstDest_j], [secondDest_i, secondDest_j])) {
            return;
        }
        GAME_STATE.f.currentBoard[firstDest_i][firstDest_j] = null;
        GAME_STATE.f.currentBoard[secondDest_i][secondDest_j] = piece;
    }
    else {
        const _should_not_reach_here = message;
    }
}
function getThingsGoing(piece_to_move, from, to, ask_whether_to_step) {
    const destPiece = GAME_STATE.f.currentBoard[to[0]][to[1]];
    if (destPiece == null) { // dest is empty square; try to simply move
        let message;
        if (piece_to_move !== "Tam2") {
            const abs_src = toAbsoluteCoord(from);
            const abs_dst = toAbsoluteCoord(to);
            message = {
                type: "NonTamMove",
                data: {
                    type: "SrcDst",
                    src: abs_src,
                    dest: abs_dst,
                },
            };
            sendNormalMessage(message);
            return;
        }
        else {
            afterFirstTamMove(from, to);
            return;
        }
    }
    // dest is not an empty square; it is always possible to step
    if (!canGetOccupiedBy(Side.Upward, to, piece_to_move, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue)) { // can step, but cannot take
        stepping(from, piece_to_move, to);
        return;
    }
    // short-circuit evaluation
    if (ask_whether_to_step && confirm(DICTIONARY.ja.whetherToTake)) {
        const abs_src = toAbsoluteCoord(from);
        const abs_dst = toAbsoluteCoord(to);
        const message = {
            type: "NonTamMove",
            data: {
                type: "SrcDst",
                src: abs_src,
                dest: abs_dst,
            },
        };
        sendNormalMessage(message);
        return;
    }
    else {
        stepping(from, piece_to_move, to);
        return;
    }
}
function getThingsGoingAfterStepping_Finite(src, step, piece, dest) {
    if (piece === "Tam2") {
        afterFirstTamMove(src, dest, step);
        return;
    }
    const message = {
        type: "NonTamMove",
        data: {
            type: "SrcStepDstFinite",
            step: toAbsoluteCoord(step),
            dest: toAbsoluteCoord(dest),
            src: toAbsoluteCoord(src),
        },
    };
    sendNormalMessage(message);
    return;
}
async function sendInfAfterStep(message) {
    const res = await sendStuff("inf after step", message, (response) => {
        console.log("Success; the server returned:", JSON.stringify(response));
        return response;
    });
    if (!res.legal) {
        alert(`Illegal API sent, the reason being ${res.whyIllegal}`);
        throw new Error(`Illegal API sent, the reason being ${res.whyIllegal}`);
    }
    displayCiurl(res.ciurl);
    document.getElementById("cancelButton").remove(); // destroy the cancel button, since it can no longer be cancelled
    eraseGuide(); // this removes the central guide, as well as the yellow and green ones
    const step = fromAbsoluteCoord(message.step);
    const plannedDirection = fromAbsoluteCoord(message.plannedDirection);
    // recreate the selection node, but this time it is not clickable and hence not deletable
    const centralNode = createPieceSizeImageOnBoardByPath_Shifted(step, "selection2", "selection");
    centralNode.style.zIndex = "200";
    const contains_guides = document.getElementById("contains_guides");
    contains_guides.appendChild(centralNode);
    const piece = {
        color: message.color,
        prof: message.prof,
        side: Side.Upward,
    };
    // now re-add the green candidates in only one direction.
    // first, get all the green candidates;
    const { infinite: guideListGreen } = calculateMovablePositions(step, piece, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue);
    // then filter the result
    const filteredList = filterInOneDirectionTillCiurlLimit(guideListGreen, step, plannedDirection, res.ciurl);
    const src = fromAbsoluteCoord(message.src);
    const passer = createCircleGuideImageAt(src, "ct");
    passer.addEventListener("click", function (ev) {
        sendAfterHalfAcceptance({
            type: "AfterHalfAcceptance",
            dest: null,
        }, src, step);
    });
    passer.style.zIndex = "200";
    contains_guides.appendChild(passer);
    for (let ind = 0; ind < filteredList.length; ind++) {
        const dest = filteredList[ind];
        const [i, j] = dest;
        if (coordEq(src, dest)) {
            continue; // yellow takes precedence over green
        }
        const destPiece = GAME_STATE.f.currentBoard[i][j];
        // cannot step twice
        if (destPiece === "Tam2" || (destPiece !== null && destPiece.side === Side.Upward)) {
            continue;
        }
        const img = createCircleGuideImageAt(filteredList[ind], "ct2");
        img.addEventListener("click", function (ev) {
            sendAfterHalfAcceptance({
                type: "AfterHalfAcceptance",
                dest: toAbsoluteCoord(dest),
            }, src, step);
        });
        img.style.zIndex = "200";
        contains_guides.appendChild(img);
    }
}
async function animateWaterEntryLogo() {
    const water_entry_logo = document.getElementById("water_entry_logo");
    water_entry_logo.style.display = "block";
    water_entry_logo.classList.add("water_entry");
    const cover_while_asyncawait = document.getElementById("protective_cover_over_field_while_asyncawait");
    cover_while_asyncawait.classList.remove("nocover");
    setTimeout(function () {
        water_entry_logo.style.display = "none";
        cover_while_asyncawait.classList.add("nocover");
    }, 1200 * 0.8093);
    await new Promise((resolve) => setTimeout(resolve, 1000 * 0.8093));
}
function displayCiurl(ciurl, side) {
    // copied and pasted from https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
    // Standard Normal variate using Box-Muller transform.
    const randn_bm = function () {
        let u = 0, v = 0;
        while (u === 0) {
            u = Math.random();
        } // Converting [0,1) to (0,1)
        while (v === 0) {
            v = Math.random();
        }
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    };
    const contains_ciurl = document.getElementById("contains_ciurl");
    clearCiurl();
    const averageLeft = BOX_SIZE * (335 / 70 + randn_bm() / 6);
    const hop1zuo1_height = 140;
    const board_height = 631;
    const averageTop = 84 + ((side == null || side === Side.Upward) ? hop1zuo1_height + board_height : 0);
    const imgs = ciurl.map((side, ind) => createCiurl(side, {
        left: averageLeft + BOX_SIZE * 0.2 * randn_bm(),
        top: averageTop + (ind + 0.5 - ciurl.length / 2) * 26 + BOX_SIZE * 0.05 * randn_bm(),
        rotateDeg: Math.random() * 40 - 20,
    }));
    // Fisher-Yates
    for (let i = imgs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    }
    for (let i = 0; i < imgs.length; i++) {
        contains_ciurl.appendChild(imgs[i]);
    }
    const sound = new Audio("sound/ciurl4.ogg");
    sound.play();
}
function clearCiurl() {
    removeChildren(document.getElementById("contains_ciurl"));
}
function display_guide_after_stepping(coord, q, parent, list) {
    const src = UI_STATE.selectedCoord;
    if (src == null) {
        throw new Error("though stepping, null startpoint!!!!!");
    }
    else if (src[0] === "Hop1zuo1") {
        throw new Error("though stepping, hop1zuo1 startpoint!!!!!");
    }
    for (let ind = 0; ind < list.length; ind++) {
        // Since you cannot step twice, the destination must be occupiable, that is, either empty or opponent's unprotected piece.
        if (!canGetOccupiedBy(Side.Upward, list[ind], q.piece, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue)) {
            continue;
        }
        const img = createCircleGuideImageAt(list[ind], q.path);
        img.addEventListener("click", q.path === "ct" ? function () {
            getThingsGoingAfterStepping_Finite(src, coord, q.piece, list[ind]);
        } : function () {
            sendInfAfterStep({
                type: "InfAfterStep",
                color: q.piece.color,
                prof: q.piece.prof,
                step: toAbsoluteCoord(coord),
                plannedDirection: toAbsoluteCoord(list[ind]),
                src: toAbsoluteCoord(src),
            });
        });
        img.style.zIndex = "200";
        parent.appendChild(img);
    }
}
function display_guides(coord, piece, parent, list) {
    for (let ind = 0; ind < list.length; ind++) {
        // draw the yellow guides
        const img = createCircleGuideImageAt(list[ind], "ct");
        // click on it to get things going
        img.addEventListener("click", function () {
            getThingsGoing(piece, coord, list[ind], /* ask whether to step, when clicked */ true);
        });
        img.addEventListener("contextmenu", function (e) {
            e.preventDefault();
            getThingsGoing(piece, coord, list[ind], /* when right-clicked, default to step */ false);
        });
        parent.appendChild(img);
    }
}
function selectOwnPieceOnBoard(coord, piece) {
    /* erase the guide in all cases, since the guide also contains the selectedness of Hop1zuo1 */
    eraseGuide();
    if (UI_STATE.selectedCoord == null || UI_STATE.selectedCoord[0] === "Hop1zuo1" || !coordEq(UI_STATE.selectedCoord, coord)) {
        UI_STATE.selectedCoord = coord;
        const contains_guides = document.getElementById("contains_guides");
        const centralNode = createPieceSizeImageOnBoardByPath(coord, "selection2", "selection");
        centralNode.style.cursor = "pointer";
        // click on it to erase
        centralNode.addEventListener("click", function () {
            eraseGuide();
            UI_STATE.selectedCoord = null;
        });
        contains_guides.appendChild(centralNode);
        const { finite: guideListFinite, infinite: guideListInfinite } = calculateMovablePositions(coord, piece, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue);
        display_guides(coord, piece, contains_guides, [...guideListFinite, ...guideListInfinite]);
    }
    else {
        /* Clicking what was originally selected will make it deselect */
        UI_STATE.selectedCoord = null;
    }
}
function selectOwnPieceOnHop1zuo1(ind, piece) {
    // erase the existing guide in all circumstances
    eraseGuide();
    if (UI_STATE.selectedCoord == null || UI_STATE.selectedCoord[0] !== "Hop1zuo1" || UI_STATE.selectedCoord[1] !== ind) {
        UI_STATE.selectedCoord = ["Hop1zuo1", ind];
        const contains_guides_on_upward = document.getElementById("contains_guides_on_upward");
        const centralNode = createPieceSizeImageOnBoardByPathAndXY(1 + (MAX_PIECE_SIZE - PIECE_SIZE) / 2, indToHop1Zuo1Horizontal(ind), "selection2", "selection");
        centralNode.style.cursor = "pointer";
        // click on it to erase
        centralNode.addEventListener("click", function () {
            eraseGuide();
            UI_STATE.selectedCoord = null;
        });
        contains_guides_on_upward.appendChild(centralNode);
        const contains_guides = document.getElementById("contains_guides");
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const ij = [i, j];
                // skip if already occupied
                if (GAME_STATE.f.currentBoard[i][j] != null) {
                    continue;
                }
                // draw the yellow guides
                const img = createCircleGuideImageAt(ij, "ct");
                // click on it to get things going
                img.addEventListener("click", function () {
                    (function getThingsGoingFromHop1zuo1(piece, to) {
                        const dest = GAME_STATE.f.currentBoard[to[0]][to[1]];
                        // must parachute onto an empty square
                        if (dest != null) {
                            alert("Cannot parachute onto an occupied square");
                            throw new Error("Cannot parachute onto an occupied square");
                        }
                        const abs_dst = toAbsoluteCoord(to);
                        const message = {
                            type: "NonTamMove",
                            data: {
                                type: "FromHand",
                                color: piece.color,
                                prof: piece.prof,
                                dest: abs_dst,
                            },
                        };
                        sendNormalMessage(message);
                    })(piece, ij);
                });
                contains_guides.appendChild(img);
            }
        }
    }
    else {
        /* re-click: deselect */
        UI_STATE.selectedCoord = null;
    }
}
function removeChildren(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
function toDigits(num) {
    if (num % 1 !== 0) {
        throw new Error("non-integer");
    }
    else if (num >= 100 || num <= -100) {
        alert("internal error: add linzi image for 100");
        throw new Error("add linzi image for 100"); /* FIXME */
    }
    else if (num < 0) {
        return ["neg", ...toDigits(-num)];
    }
    else if (num == 0) {
        return ["num00"];
    }
    const lastDigitArr = num % 10 === 0 ? [] : [`num0${num % 10}`];
    if (num >= 20) {
        return [`num0${Math.floor(num / 10)}`, "num10", ...lastDigitArr];
    }
    else if (num >= 10) {
        return ["num10", ...lastDigitArr];
    }
    else {
        return lastDigitArr;
    }
}
function drawScoreDisplay(hands_) {
    const hands = hands_.sort((a, b) => {
        const hands_ordering = [
            "同色無抗行処", "無抗行処",
            "同色筆兵無傾", "筆兵無傾",
            "同色地心", "地心",
            "同色馬弓兵", "馬弓兵",
            "同色行行", "行行",
            "王",
            "同色獣", "獣",
            "同色戦集", "戦集",
            "同色助友", "助友",
            "同色闇戦之集", "闇戦之集",
            "撃皇",
            "皇再来",
        ];
        return hands_ordering.indexOf(a) - hands_ordering.indexOf(b);
    });
    const top_padding = 15;
    if (hands.length > 11) {
        throw new Error("too many hands");
    }
    const starting_position_left = [550, 550, 550, 550, 550, 550, 550, 550, 550, 575, 585, 595][hands.length];
    const spacing = [60, 60, 60, 60, 60, 60, 60, 60, 60, 57, 53, 49][hands.length];
    function drawDigits(left, top, width, digits) {
        const letter_spacing = -0.06;
        return digits.map((digit, index) => `<img
                src="image/dat2/${digit}.png"
                style="position:absolute; left: ${left}px; top: ${(1 + letter_spacing) * width * index + top}px;" width="${width}"
            >`).join("");
    }
    function drawHandAndScore(hand, left) {
        const digits = toDigits(hand_to_score[hand]);
        let ans = "";
        if (hand.slice(0, 2) === "同色") {
            ans += `
            <img src="image/dat2/${hand.slice(2)}.png" style="position:absolute; left: ${left}px; top: ${top_padding}px;" width="50">
            <img src="image/dat2/同色.png" style="position:absolute; left: ${left}px; top: ${185 + top_padding}px;" width="50">`;
        }
        else {
            ans += `<img src="image/dat2/${hand}.png" style="position:absolute; left: ${left}px; top: ${top_padding}px;" width="50">`;
        }
        ans += drawDigits(left, 280 + top_padding, 50, digits);
        return ans;
    }
    const score_display = document.getElementById("score_display");
    score_display.classList.remove("nocover");
    const base_score = hands.map((h) => hand_to_score[h]).reduce((a, b) => a + b, 0);
    const base_score_digits = toDigits(base_score);
    score_display.innerHTML =
        hands.map((hand, index) => drawHandAndScore(hand, starting_position_left - spacing * index)).join("") +
            drawDigits(20, 234 - 70 * base_score_digits.length / 2, 70, base_score_digits);
}
function increaseRateAndAnimate(done_by_me) {
    const score_display = document.getElementById("score_display");
    score_display.classList.add("nocover");
    const orig_log2_rate = GAME_STATE.log2_rate;
    const log2RateProgressMap = {
        0: 1,
        1: 2,
        2: 3,
        3: 4,
        4: 5,
        5: 6,
        6: 6,
    };
    drawScoreboard(); // cargo cult
    GAME_STATE.log2_rate = log2RateProgressMap[orig_log2_rate];
    const denote_rate = document.getElementById("denote_rate");
    setTimeout(async () => {
        denote_rate.style.display = "block";
        await new Promise((resolve) => setTimeout(resolve, 200 * 0.8093));
        await animateNode(denote_rate, 1000 * 0.8093, getDenoteRateNodeTopLeft(GAME_STATE.log2_rate), getDenoteRateNodeTopLeft(orig_log2_rate));
        await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
        drawScoreboard();
        if (done_by_me) {
            resumePolling();
        }
        else {
            GAME_STATE.is_my_turn = true;
        }
        document.getElementById("protective_cover_over_field_while_asyncawait").classList.add("nocover");
    }, 200 * 0.8093);
}
function drawTyMok1AndTaXot1Buttons(base_score) {
    const score_display = document.getElementById("score_display");
    const ty_mok1_button = createImageButton("dat2/再行", 0);
    ty_mok1_button.addEventListener("click", async () => {
        // FIXME: must send server of this decision
        increaseRateAndAnimate(true);
        const res = await sendStuffTo("whethertymok", "`send whether ty mok1`", true, (response) => {
            console.log("Success; the server returned:", JSON.stringify(response));
            return response;
        });
        if (res.legal !== true) {
            throw new Error("bad!!!!");
        }
    });
    score_display.appendChild(ty_mok1_button);
    const ta_xot1_button = createImageButton("dat2/終季", 250);
    ta_xot1_button.addEventListener("click", async () => {
        const res = await sendStuffTo("whethertymok", "`send whether ty mok1`", false, (response) => {
            console.log("Success; the server returned:", JSON.stringify(response));
            return response;
        });
        if (res.legal !== true) {
            throw new Error("bad!!!!");
        }
        const is_first_move_my_move_in_the_next_season = res.is_first_move_my_move;
        endSeason(base_score, is_first_move_my_move_in_the_next_season);
    });
    score_display.appendChild(ta_xot1_button);
}
function endSeason(base_score, is_first_move_my_move_in_the_next_season) {
    const score_display = document.getElementById("score_display");
    score_display.classList.add("nocover");
    // FIXME: must send server of this decision
    const denote_season = document.getElementById("denote_season");
    const denote_score = document.getElementById("denote_score");
    const orig_score = GAME_STATE.my_score;
    const orig_season = GAME_STATE.season;
    GAME_STATE.my_score += base_score * Math.pow(2, GAME_STATE.log2_rate);
    const seasonProgressMap = {
        0: 1,
        1: 2,
        2: 3,
        3: null,
    };
    const new_season = seasonProgressMap[orig_season];
    if (new_season == null) {
        setTimeout(async () => {
            await animateNode(denote_score, 1000 * 0.8093, getDenoteScoreNodeTopLeft(GAME_STATE.my_score), getDenoteScoreNodeTopLeft(orig_score));
            alert(DICTIONARY.ja.gameEnd);
            if (GAME_STATE.my_score > 20) {
                alert("you win!"); // FIXME
                return;
            }
            else if (GAME_STATE.my_score < 20) {
                alert("you lose..."); // FIXME
                return;
            }
            else {
                alert("draw");
                return;
            }
        }, 200 * 0.8093);
        return;
    }
    GAME_STATE.season = new_season;
    setTimeout(async () => {
        var _a, _b, _c, _d, _e;
        await animateNode(denote_score, 1000 * 0.8093, getDenoteScoreNodeTopLeft(GAME_STATE.my_score), getDenoteScoreNodeTopLeft(orig_score));
        if (GAME_STATE.my_score >= 40) {
            alert("you win!"); // FIXME
            return;
        }
        else if (GAME_STATE.my_score <= 0) {
            alert("you lose..."); // FIXME
            return;
        }
        await animateNode(denote_season, 700 * 0.8093, getDenoteSeasonNodeTopLeft(GAME_STATE.season), getDenoteSeasonNodeTopLeft(orig_season));
        await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
        drawScoreboard();
        alert(DICTIONARY.ja.newSeason[GAME_STATE.season]);
        await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
        (_a = document.getElementById("protective_cover_over_field")) === null || _a === void 0 ? void 0 : _a.classList.remove("nocover");
        (_b = document.getElementById("protective_tam_cover_over_field")) === null || _b === void 0 ? void 0 : _b.classList.remove("nocover");
        await new Promise((resolve) => setTimeout(resolve, 4000 * 0.8093));
        GAME_STATE.f = {
            currentBoard: GAME_STATE.IA_is_down ? rotateBoard(rotateBoard(initial_board_with_IA_down)) : rotateBoard(initial_board_with_IA_down),
            hop1zuo1OfDownward: [],
            hop1zuo1OfUpward: [],
        };
        GAME_STATE.log2_rate = 0;
        allowPolling(); // reset another global state
        drawField();
        await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
        (_c = document.getElementById("protective_cover_over_field")) === null || _c === void 0 ? void 0 : _c.classList.add("nocover");
        (_d = document.getElementById("protective_tam_cover_over_field")) === null || _d === void 0 ? void 0 : _d.classList.add("nocover");
        GAME_STATE.is_my_turn = is_first_move_my_move_in_the_next_season;
        (_e = document.getElementById("protective_cover_over_field_while_asyncawait")) === null || _e === void 0 ? void 0 : _e.classList.add("nocover");
    }, 200 * 0.8093);
}
function getDenoteSeasonNodeTopLeft(season) {
    return { top: 360 + 51 * season, left: 3 };
}
function getDenoteScoreNodeTopLeft(score) {
    return { top: 447 + 21.83333333333333 * (20 - score), left: 65 };
}
function getDenoteRateNodeTopLeft(log2_rate) {
    return { top: 873 - 96.66666666666667 * (log2_rate - 1), left: 4 };
}
function drawScoreboard() {
    const denote_season = document.getElementById("denote_season");
    denote_season.style.top = `${getDenoteSeasonNodeTopLeft(GAME_STATE.season).top}px`;
    denote_season.style.transition = ``; // needs to clear the animation
    denote_season.style.transform = ``;
    const denote_score = document.getElementById("denote_score");
    denote_score.style.top = `${getDenoteScoreNodeTopLeft(GAME_STATE.my_score).top}px`;
    denote_score.style.transition = ``;
    denote_score.style.transform = ``;
    const denote_rate = document.getElementById("denote_rate");
    if (GAME_STATE.log2_rate === 0) {
        denote_rate.style.display = "none";
    }
    else {
        denote_rate.style.display = "block";
    }
    denote_rate.style.top = `${getDenoteRateNodeTopLeft(GAME_STATE.log2_rate).top}px`;
    denote_rate.style.transition = ``;
    denote_rate.style.transform = ``;
}
function drawField() {
    (function drawBoard(board) {
        const contains_pieces_on_board = document.getElementById("contains_pieces_on_board");
        // delete everything
        removeChildren(contains_pieces_on_board);
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                const piece = board[i][j];
                if (piece == null) {
                    continue;
                }
                const coord = [i, j];
                const imgNode = createPieceImgToBePlacedOnBoard(coord, piece);
                imgNode.id = `field_piece_${i}_${j}`;
                if (piece === "Tam2") {
                    imgNode.style.cursor = "pointer";
                    imgNode.addEventListener("click", function () {
                        selectOwnPieceOnBoard(coord, piece);
                    });
                }
                else if (piece.side === Side.Upward) {
                    const q = {
                        prof: piece.prof,
                        side: Side.Upward,
                        color: piece.color,
                    };
                    imgNode.style.cursor = "pointer";
                    imgNode.addEventListener("click", function () {
                        selectOwnPieceOnBoard(coord, q);
                    });
                }
                contains_pieces_on_board.appendChild(imgNode);
            }
        }
    })(GAME_STATE.f.currentBoard);
    (function drawHop1zuo1OfUpward(list) {
        const contains_pieces_on_upward = document.getElementById("contains_pieces_on_upward");
        // delete everything
        removeChildren(contains_pieces_on_upward);
        for (let i = 0; i < list.length; i++) {
            const piece = list[i];
            const imgNode = createPieceImgToBePlacedOnHop1zuo1(i, toPath(piece));
            imgNode.style.cursor = "pointer";
            imgNode.addEventListener("click", function () {
                selectOwnPieceOnHop1zuo1(i, piece);
            });
            contains_pieces_on_upward.appendChild(imgNode);
        }
    })(GAME_STATE.f.hop1zuo1OfUpward);
    (function drawHop1zuo1OfDownward(list) {
        const contains_pieces_on_downward = document.getElementById("contains_pieces_on_downward");
        // delete everything
        removeChildren(contains_pieces_on_downward);
        for (let i = 0; i < list.length; i++) {
            const piece = list[i];
            const imgNode = createPieceImgToBePlacedOnHop1zuo1(i, toPath(piece));
            imgNode.id = `hop1zuo1OfDownward_${i}`;
            contains_pieces_on_downward.appendChild(imgNode);
        }
    })(GAME_STATE.f.hop1zuo1OfDownward);
}
