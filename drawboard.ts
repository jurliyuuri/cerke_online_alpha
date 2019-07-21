const BOX_SIZE = 70;
const MAX_PIECE_SIZE = BOX_SIZE - 1;
const PIECE_SIZE = 60;

function createPieceSizeImageOnBoardByPathAndXY(top: number, left: number, path: string, className: string): HTMLImageElement {
    let i = document.createElement("img");
    i.classList.add(className);
    i.style.top = `${top}px`;
    i.style.left = `${left}px`;
    i.src = `image/${path}.png`;
    i.width = PIECE_SIZE;
    i.height = PIECE_SIZE;
    return i;
}

function createPieceSizeImageOnBoardByPath(coord: Coord, path: string, className: string): HTMLImageElement {
    let [row_index, column_index] = coord;
    return createPieceSizeImageOnBoardByPathAndXY(
        1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
        1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
        path,
        className
    );
}

function createPieceSizeImageOnBoardByPath_Shifted(coord: readonly [number, number], path: string, className: string): HTMLImageElement {
    let [row_index, column_index] = coord;
    return createPieceSizeImageOnBoardByPathAndXY(
        1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE),
        1 + column_index * BOX_SIZE,
        path,
        className
    );
}

type Hop1Zuo1 = NonTam2Piece[];

type Field = {
    currentBoard: Board,
    hop1zuo1OfUpward: NonTam2PieceUpward[],
    hop1zuo1OfDownward: NonTam2PieceDownward[],
}

type GAME_STATE = {
    f: Field,
    IA_is_down: boolean,
    tam_itself_is_tam_hue: boolean,
    backupDuringStepping: null | [Coord, Piece]
};

let GAME_STATE: GAME_STATE = {
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
        ] as Board,
        hop1zuo1OfDownward: [],
        hop1zuo1OfUpward: [],
    },
    IA_is_down: true,
    tam_itself_is_tam_hue: true,
    backupDuringStepping: null
}

type UI_STATE = {
    selectedCoord: null | Coord | ["Hop1zuo1", number];
};

let UI_STATE: UI_STATE = {
    selectedCoord: null
};

function eraseGuide(): void {
    removeChildren(document.getElementById("contains_guides")!);
    removeChildren(document.getElementById("contains_guides_on_upward")!);
}

function toAbsoluteCoord([row, col]: Coord): AbsoluteCoord {
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

function fromAbsoluteCoord([absrow, abscol]: AbsoluteCoord): Coord {
    let rowind: BoardIndex;

    if (absrow === AbsoluteRow.A) { rowind = 0; }
    else if (absrow === AbsoluteRow.E) { rowind = 1; }
    else if (absrow === AbsoluteRow.I) { rowind = 2; }
    else if (absrow === AbsoluteRow.U) { rowind = 3; }
    else if (absrow === AbsoluteRow.O) { rowind = 4; }
    else if (absrow === AbsoluteRow.Y) { rowind = 5; }
    else if (absrow === AbsoluteRow.AI) { rowind = 6; }
    else if (absrow === AbsoluteRow.AU) { rowind = 7; }
    else if (absrow === AbsoluteRow.IA) { rowind = 8; }
    else {
        let _should_not_reach_here: never = absrow;
        throw new Error("does not happen");
    }

    let colind: BoardIndex;

    if (abscol === AbsoluteColumn.K) { colind = 0; }
    else if (abscol === AbsoluteColumn.L) { colind = 1; }
    else if (abscol === AbsoluteColumn.N) { colind = 2; }
    else if (abscol === AbsoluteColumn.T) { colind = 3; }
    else if (abscol === AbsoluteColumn.Z) { colind = 4; }
    else if (abscol === AbsoluteColumn.X) { colind = 5; }
    else if (abscol === AbsoluteColumn.C) { colind = 6; }
    else if (abscol === AbsoluteColumn.M) { colind = 7; }
    else if (abscol === AbsoluteColumn.P) { colind = 8; }
    else {
        let _should_not_reach_here: never = abscol;
        throw new Error("does not happen");
    }

    if (GAME_STATE.IA_is_down) {
        return [rowind, colind];
    } else {
        return [8 - rowind as BoardIndex, 8 - colind as BoardIndex];
    }
}

function getThingsGoingFromHop1zuo1(ev: MouseEvent, piece: Piece, from: ["Hop1zuo1", number], to: Coord) {
    let dest = GAME_STATE.f.currentBoard[to[0]][to[1]];

    // must parachute onto an empty square
    if (dest != null) {
        alert("Cannot parachute onto an occupied square");
        throw new Error("Cannot parachute onto an occupied square");
    }

    if (piece === "Tam2") {
        alert("Cannot parachute Tam2");
        throw new Error("Cannot parachute Tam2");
    }

    let abs_dst: AbsoluteCoord = toAbsoluteCoord(to);
    let message: NormalNonTamMove = {
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
    let contains_phantom = document.getElementById("contains_phantom")!;
    while (contains_phantom.firstChild) {
        contains_phantom.removeChild(contains_phantom.firstChild);
    }
}

function cancelStepping() {
    eraseGuide();
    erasePhantom();
    document.getElementById("protective_cover_over_field")!.classList.add("nocover");

    // resurrect the original one
    const backup: [Coord, Piece] = GAME_STATE.backupDuringStepping!;
    const from: Coord = backup[0];
    GAME_STATE.f.currentBoard[from[0]][from[1]] = backup[1];
    GAME_STATE.backupDuringStepping = null;

    UI_STATE.selectedCoord = null;

    // draw
    drawField(GAME_STATE.f);
}

function stepping(from: Coord, piece: Piece, to: Coord, destPiece: Piece) {
    eraseGuide();
    document.getElementById("protective_cover_over_field")!.classList.remove("nocover");

    // delete the original one
    GAME_STATE.backupDuringStepping = [from, piece];
    GAME_STATE.f.currentBoard[from[0]][from[1]] = null;

    // draw
    drawField(GAME_STATE.f);

    const drawPhantomAt = function (coord: Coord, piece: Piece) {
        let contains_phantom = document.getElementById("contains_phantom")!;
        erasePhantom();

        const phantom: HTMLImageElement = createPieceImgToBePlacedOnBoard(coord, piece);
        phantom.style.opacity = "0.1";
        contains_phantom.appendChild(phantom);
    }

    const drawCancel = function () {
        let contains_phantom = document.getElementById("contains_phantom")!;

        let cancelButton = createPieceSizeImageOnBoardByPath_Shifted([9, 7.5], "piece/bmun", "piece_image_on_board");
        cancelButton.width = 80;
        cancelButton.height = 80;

        cancelButton.style.zIndex = "100";
        cancelButton.style.cursor = "pointer";
        cancelButton.setAttribute('id', 'cancelButton');

        cancelButton.addEventListener('click', cancelStepping);
        contains_phantom.appendChild(cancelButton);
    }

    const drawHoverAt = function (coord: Coord, piece: Piece) {
        let contains_phantom = document.getElementById("contains_phantom")!;

        let img = createPieceSizeImageOnBoardByPath_Shifted(
            coord,
            toPath_(piece),
            "piece_image_on_board"
        );

        img.style.zIndex = "100";
        img.style.cursor = "pointer";

        const selectHover = function () {
            const contains_guides = document.getElementById("contains_guides")!;

            let centralNode = createPieceSizeImageOnBoardByPath_Shifted(coord, "selection2", "selection");

            centralNode.style.cursor = "pointer";

            // click on it to erase
            centralNode.addEventListener('click', function () {
                eraseGuide();
                UI_STATE.selectedCoord = null;
            });

            centralNode.style.zIndex = "200";
            contains_guides.appendChild(centralNode);

            const { finite: guideListYellow, infinite: guideListGreen } = calculateMovablePositions(
                coord,
                piece,
                GAME_STATE.f.currentBoard,
                GAME_STATE.tam_itself_is_tam_hue);

            display_guide_after_stepping(coord, piece, contains_guides, guideListYellow, "ct");

            display_guide_after_stepping(coord, piece, contains_guides, guideListGreen, "ct2");
        }

        img.addEventListener('click', selectHover);
        contains_phantom.appendChild(img);

        // draw as already selected
        selectHover();
    }

    drawPhantomAt(from, piece);
    drawCancel();
    drawHoverAt(to, piece);
}

type MockReturnDataForNormalMove = {
    success: boolean,
    dat: number[]
};


async function sendNormalMessage(message: NormalMove) {
    console.log("Sending normal move:", JSON.stringify(message));
    let url = 'http://localhost:3000/movies';
    const data = {
        "id": (Math.random() * 100000) | 0,
        "message": message
    };

    const res: void | MockReturnDataForNormalMove = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
        .then(response => {
            console.log('Success:', JSON.stringify(response));
            return {
                success: Math.random() < 0.5,
                dat: [1, 2, 3]
            };
        })
        .catch(error => console.error('Error:', error));

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
    } else {
        eraseGuide();
        UI_STATE.selectedCoord = null;
        updateField(GAME_STATE.f, message);
        drawField(GAME_STATE.f);
    }
}

function updateField(field: Field, message: NormalMove) {
    if (message.type === "NonTamMove") {
        if (message.data.type === "FromHand") {
            const k: {
                type: 'FromHand';
                color: Color;
                prof: Profession;
                dest: AbsoluteCoord;
            } = message.data;

            // remove the corresponding one from hand
            const ind = GAME_STATE.f.hop1zuo1OfUpward.findIndex(
                piece => piece.color === k.color && piece.prof === k.prof
            );
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

        } else if (message.data.type === "SrcDst") {
            const k: {
                type: 'SrcDst';
                src: AbsoluteCoord;
                dest: AbsoluteCoord;
            } = message.data;

            const [src_i, src_j] = fromAbsoluteCoord(k.src);
            const [dest_i, dest_j] = fromAbsoluteCoord(k.dest);

            let piece: Piece | null = GAME_STATE.f.currentBoard[src_i][src_j]
            if (piece === null) {
                throw new Error("src is unoccupied");
            }

            let destPiece: Piece | null = GAME_STATE.f.currentBoard[dest_i][dest_j];

            /* it's NOT possible that you are returning to the original position, in which case you don't do anything */

            if (destPiece !== null) {
                if (destPiece === "Tam2") {
                    throw new Error("dest is occupied by Tam2");
                } else if (destPiece.side === Side.Upward) {
                    throw new Error("dest is occupied by an ally");
                } else if (destPiece.side === Side.Downward) {
                    const flipped: NonTam2PieceUpward = {
                        color: destPiece.color,
                        prof: destPiece.prof,
                        side: Side.Upward
                    }
                    GAME_STATE.f.hop1zuo1OfUpward.push(flipped);
                } else {
                    let _should_not_reach_here: never = destPiece.side;
                    throw new Error("should not reach here");
                }
            }

            GAME_STATE.f.currentBoard[src_i][src_j] = null;
            GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        } else if (message.data.type === "SrcStepDstFinite") {
            const k: {
                type: 'SrcStepDstFinite';
                src: AbsoluteCoord;
                step: AbsoluteCoord;
                dest: AbsoluteCoord;
            } = message.data;

            const [src_i, src_j] = fromAbsoluteCoord(k.src);
            const [dest_i, dest_j] = fromAbsoluteCoord(k.dest);

            // GAME_STATE.f.currentBoard[src_i][src_j] has already become a phantom.

            const backup: [Coord, Piece] = GAME_STATE.backupDuringStepping!;

            let piece: Piece = backup[1];

            cancelStepping();

            // this will now restore GAME_STATE.f.currentBoard[src_i][src_j]

            const [step_i, step_j] = fromAbsoluteCoord(k.step);
            if (GAME_STATE.f.currentBoard[step_i][step_j] === null) {
                throw new Error("step is unoccupied");
            }

            let destPiece: Piece | null = GAME_STATE.f.currentBoard[dest_i][dest_j];

            /* it's possible that you are returning to the original position, in which case you don't do anything */
            if (coordEq([src_i, src_j], [dest_i, dest_j])) {
                return;
            }

            if (destPiece !== null) {
                if (destPiece === "Tam2") {
                    throw new Error("dest is occupied by Tam2");
                } else if (destPiece.side === Side.Upward) {
                    throw new Error("dest is occupied by an ally");
                } else if (destPiece.side === Side.Downward) {
                    const flipped: NonTam2PieceUpward = {
                        color: destPiece.color,
                        prof: destPiece.prof,
                        side: Side.Upward
                    }
                    GAME_STATE.f.hop1zuo1OfUpward.push(flipped);
                } else {
                    let _should_not_reach_here: never = destPiece.side;
                    throw new Error("should not reach here");
                }
            }

            GAME_STATE.f.currentBoard[src_i][src_j] = null;
            GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;

        } else {
            let _should_not_reach_here: never = message.data;
        }

    } else if (message.type === "TamMove") {
        const k = message;
        const [src_i, src_j] = fromAbsoluteCoord(k.src);
        const [secondDest_i, secondDest_j] = fromAbsoluteCoord(k.secondDest);

        let piece: Piece | null = GAME_STATE.f.currentBoard[src_i][src_j]
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

    } else {
        let _should_not_reach_here: never = message;
    }
}

function getThingsGoing(ev: MouseEvent, piece: Piece, from: Coord, to: Coord) {
    let destPiece: "Tam2" | null | NonTam2Piece = GAME_STATE.f.currentBoard[to[0]][to[1]];

    if (destPiece == null) { // dest is empty square; try to simply move

        let message: NormalMove;

        if (piece !== "Tam2") {
            let abs_src: AbsoluteCoord = toAbsoluteCoord(from);
            let abs_dst: AbsoluteCoord = toAbsoluteCoord(to);
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
        } else {
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
        let abs_src: AbsoluteCoord = toAbsoluteCoord(from);
        let abs_dst: AbsoluteCoord = toAbsoluteCoord(to);
        let message: NormalNonTamMove = {
            type: "NonTamMove",
            data: {
                type: "SrcDst",
                src: abs_src,
                dest: abs_dst
            }
        }

        sendNormalMessage(message);
        return;
    } else {
        stepping(from, piece, to, destPiece);
        return;
    }
}

function createCircleGuideImageAt(coord: Coord, path: string) {
    const [row_index, column_index] = coord;
    let img = document.createElement("img");
    img.classList.add("guide");
    img.style.top = `${1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2}px`;
    img.style.left = `${1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2}px`;
    img.src = `image/${path}.png`;
    img.width = MAX_PIECE_SIZE;
    img.height = MAX_PIECE_SIZE;
    img.style.cursor = "pointer";
    img.style.opacity = "0.3";
    return img;
}

type Ciurl = [boolean, boolean, boolean, boolean, boolean];

function getThingsGoingAfterStepping_Finite(step: Coord, piece: Piece, dest: Coord) {
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

    const message: NormalNonTamMove = {
        type: "NonTamMove",
        data: {
            type: "SrcStepDstFinite",
            step: toAbsoluteCoord(step),
            dest: toAbsoluteCoord(dest),
            src: toAbsoluteCoord(UI_STATE.selectedCoord)
        }
    }

    sendNormalMessage(message);
    return;
}

type MockReturnDataForInfAfterStep = {
    ciurl: Ciurl,
    dat: number[]
}

async function sendInfAfterStep(message: InfAfterStep) {
    console.log("Sending normal move:", JSON.stringify(message));
    let url = 'http://localhost:3000/movies';
    const data = {
        "id": (Math.random() * 100000) | 0,
        "message": message
    };

    const res: void | MockReturnDataForInfAfterStep = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
        .then(response => {
            console.log('Success:', JSON.stringify(response));
            return {
                ciurl: [
                    Math.random() < 0.5,
                    Math.random() < 0.5,
                    Math.random() < 0.5,
                    Math.random() < 0.5,
                    Math.random() < 0.5
                ] as Ciurl,
                dat: [1, 2, 3]
            };
        })
        .catch(error => console.error('Error:', error));

    console.log(res);

    if (!res) {
        throw new Error("network error!");
    }

    displayCiurl(res.ciurl);

    document.getElementById("cancelButton")!.remove(); // destroy the cancel button, since it can no longer be cancelled

    eraseGuide(); // this removes the central guide, as well as the yellow and green ones

    let step: Coord = fromAbsoluteCoord(message.step);
    let plannedDirection: Coord = fromAbsoluteCoord(message.plannedDirection);
    // recreate the selection node, but this time it is not clickable and hence not deletable
    let centralNode = createPieceSizeImageOnBoardByPath_Shifted(step, "selection2", "selection");
    centralNode.style.zIndex = "200";

    const contains_guides = document.getElementById("contains_guides")!;
    contains_guides.appendChild(centralNode);

    const piece: NonTam2PieceUpward = {
        color: message.color,
        prof: message.prof,
        side: Side.Upward
    };

    // now re-add the green candidates in only one direction
    const { infinite: guideListGreen } = calculateMovablePositions(
        step,
        piece,
        GAME_STATE.f.currentBoard,
        GAME_STATE.tam_itself_is_tam_hue);

    // filter the result
    const filteredList = guideListGreen.filter(function (c: Coord) {
        const subtractStep = function ([x, y]: Coord): [number, number] {
            const [step_x, step_y] = step;
            return [x - step_x, y - step_y];
        }

        const limit: number = res.ciurl.filter(x => x).length;

        const [deltaC_x, deltaC_y] = subtractStep(c);
        const [deltaPlan_x, deltaPlan_y] = subtractStep(plannedDirection);

        return (
            // 1. (c - step) crossed with (plannedDirection - step) gives zero
            deltaC_x * deltaPlan_y - deltaPlan_x * deltaC_y === 0 &&

            // 2.  (c - step) dotted with (plannedDirection - step) gives positive
            deltaC_x * deltaPlan_x + deltaC_y * deltaPlan_y > 0 &&

            // 3. deltaC must not exceed the limit enforced by ciurl
            Math.max(Math.abs(deltaC_x), Math.abs(deltaC_y)) <= limit
        );
    });


    {
        const src = UI_STATE.selectedCoord;

        if (src == null) {
            throw new Error("though stepping, null startpoint!!!!!")
        } else if (src[0] === "Hop1zuo1") {
            throw new Error("though stepping, hop1zuo1 startpoint!!!!!")
        }

        for (let ind = 0; ind < filteredList.length; ind++) {
            const [i, j] = filteredList[ind];
            const destPiece = GAME_STATE.f.currentBoard[i][j];

            // cannot step twice
            if (destPiece === "Tam2" || (destPiece !== null && destPiece.side === Side.Upward)) {
                continue;
            }

            let img = createCircleGuideImageAt(filteredList[ind], "ct2");

            img.addEventListener('click', function (ev) {
                // FIXME: event handler
                alert("FIXME: implement me");
            });

            img.style.zIndex = "200";
            contains_guides.appendChild(img);
        }
    }
}

// copied and pasted from https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
// Standard Normal variate using Box-Muller transform.
function randn_bm(): number {
    var u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function displayCiurl(ciurl: Ciurl) {
    const contains_ciurl = document.getElementById("contains_ciurl")!;

    clearCiurl();

    // should always lie around 300 ~ 370, when BOX_SIZE is 70
    const averageLeft = BOX_SIZE * (335 / 70 + randn_bm() / 6);
    const hop1zuo1_height = 140;
    const board_height = 631;
    const averageTop = 84 + hop1zuo1_height + board_height;

    let imgs: HTMLImageElement[] = []
    for (let ind = 0; ind < ciurl.length; ind++) {
        let img = document.createElement("img");
        img.src = `image/ciurl_${ciurl[ind]}.png`;
        img.width = 150;
        img.height = 15;
        img.classList.add("ciurl");
        img.style.left = `${averageLeft + BOX_SIZE * 0.2 * randn_bm()}px`;
        img.style.top = `${averageTop + (ind + 0.5 - ciurl.length / 2) * 26 + BOX_SIZE * 0.05 * randn_bm()}px`;
        img.style.zIndex = "300";
        img.style.transform = `rotate(${Math.random() * 40 - 20}deg)`;
        img.style.position = "absolute";
        imgs.push(img);

    }

    // Fisher-Yates
    for (let i = imgs.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    }

    for (let i = 0; i < imgs.length; i++) {
        contains_ciurl.appendChild(imgs[i]);
    }

}

function clearCiurl() {
    removeChildren(document.getElementById("contains_ciurl")!);
}



function getThingsGoingAfterStepping_Infinite(src: Coord, step: Coord, piece: Piece, plannedDest: Coord) {
    console.log("stepped on", step);
    console.log("dest", plannedDest);

    if (piece === "Tam2") {
        throw new Error("No, Tam2 should have no infinite movement");
    }

    sendInfAfterStep({
        color: piece.color,
        prof: piece.prof,
        step: toAbsoluteCoord(step),
        plannedDirection: toAbsoluteCoord(plannedDest),
        src: toAbsoluteCoord(src)
    });
}

function display_guide_after_stepping(coord: Coord, piece: Piece, parent: HTMLElement, list: Array<Coord>, path: "ct" | "ct2") {
    const isFinite: boolean = path == "ct";
    const src = UI_STATE.selectedCoord;

    if (src == null) {
        throw new Error("though stepping, null startpoint!!!!!")
    } else if (src[0] === "Hop1zuo1") {
        throw new Error("though stepping, hop1zuo1 startpoint!!!!!")
    }

    for (let ind = 0; ind < list.length; ind++) {
        const [i, j] = list[ind];
        const destPiece = GAME_STATE.f.currentBoard[i][j];

        // cannot step twice
        if (destPiece === "Tam2" || (destPiece !== null && destPiece.side === Side.Upward)) {
            continue;
        }

        let img = createCircleGuideImageAt(list[ind], path);

        img.addEventListener('click', isFinite ? function (ev) {
            getThingsGoingAfterStepping_Finite(coord, piece, list[ind]);
        } : function (ev) {
            getThingsGoingAfterStepping_Infinite(src, coord, piece, list[ind]);
        });

        img.style.zIndex = "200";
        parent.appendChild(img);
    }
}

function display_guide(coord: Coord, piece: Piece, parent: HTMLElement, list: Array<Coord>) {
    for (let ind = 0; ind < list.length; ind++) {
        // draw the yellow guides
        let img = createCircleGuideImageAt(list[ind], "ct");

        // click on it to get things going
        img.addEventListener('click', function (ev) {
            getThingsGoing(ev, piece, coord, list[ind]);

        });

        parent.appendChild(img);
    }
}

function selectOwnPieceOnBoard(coord: Coord, piece: Piece, imgNode: HTMLImageElement) {
    /* erase the guide in all cases, since the guide also contains the selectedness of Hop1zuo1 */
    eraseGuide();

    if (UI_STATE.selectedCoord == null || UI_STATE.selectedCoord[0] === "Hop1zuo1" || !coordEq(UI_STATE.selectedCoord, coord)) {
        UI_STATE.selectedCoord = coord;

        const contains_guides = document.getElementById("contains_guides")!;

        let centralNode = createPieceSizeImageOnBoardByPath(coord, "selection2", "selection");
        centralNode.style.cursor = "pointer";

        // click on it to erase
        centralNode.addEventListener('click', function () {
            eraseGuide();
            UI_STATE.selectedCoord = null;
        });

        contains_guides.appendChild(centralNode);

        const { finite: guideListFinite, infinite: guideListInfinite } = calculateMovablePositions(
            coord,
            piece,
            GAME_STATE.f.currentBoard,
            GAME_STATE.tam_itself_is_tam_hue);

        display_guide(coord, piece, contains_guides, [...guideListFinite, ...guideListInfinite]);

    } else {
        /* Clicking what was originally selected will make it deselect */
        UI_STATE.selectedCoord = null;
    }
}

function selectOwnPieceOnHop1zuo1(ind: number, piece: Piece, imgNode: HTMLImageElement) {
    // erase the existing guide in all circumstances
    eraseGuide();

    if (UI_STATE.selectedCoord == null || UI_STATE.selectedCoord[0] !== "Hop1zuo1" || UI_STATE.selectedCoord[1] !== ind) {

        UI_STATE.selectedCoord = ["Hop1zuo1", ind];

        const contains_guides_on_upward = document.getElementById("contains_guides_on_upward")!;
        let centralNode = createPieceSizeImageOnBoardByPathAndXY(
            1 + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
            1 + ind * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
            "selection2",
            "selection"
        );

        centralNode.style.cursor = "pointer";

        // click on it to erase
        centralNode.addEventListener('click', function () {
            eraseGuide();
            UI_STATE.selectedCoord = null;
        });
        contains_guides_on_upward.appendChild(centralNode);

        const contains_guides = document.getElementById("contains_guides")!;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                let ij: Coord = [i as BoardIndex, j as BoardIndex];

                // skip if already occupied
                if (GAME_STATE.f.currentBoard[i][j] != null) {
                    continue;
                }

                // draw the yellow guides
                let img = createCircleGuideImageAt(ij, "ct");

                // click on it to get things going
                img.addEventListener('click', function (ev) {
                    getThingsGoingFromHop1zuo1(ev, piece, ["Hop1zuo1", ind], ij);
                });

                contains_guides.appendChild(img);
            }
        }
    } else {
        /* re-click: deselect */
        UI_STATE.selectedCoord = null;
    }
}

function createPieceImgToBePlacedOnHop1zuo1(ind: number, path: string): HTMLImageElement {
    return createPieceSizeImageOnBoardByPathAndXY(
        1 + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
        1 + ind * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
        path,
        "piece_image_on_hop1zuo1"
    );
}

function createPieceImgToBePlacedOnBoard(coord: Coord, piece: Piece) {
    return createPieceSizeImageOnBoardByPath(coord, toPath_(piece), "piece_image_on_board");
}

function removeChildren(parent: HTMLElement) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function drawField(field: Field) {
    const drawBoard = function (board: Board) {
        const contains_pieces_on_board = document.getElementById("contains_pieces_on_board")!;
        GAME_STATE.f.currentBoard = board;

        // delete everything
        removeChildren(contains_pieces_on_board);

        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                const piece: Piece | null = board[i][j];
                if (piece == null) {
                    continue;
                }

                const coord: Coord = [i as BoardIndex, j as BoardIndex];
                let imgNode: HTMLImageElement = createPieceImgToBePlacedOnBoard(coord, piece);

                const selectable = (piece === "Tam2") ? true : (piece.side === Side.Upward);

                if (selectable) {
                    imgNode.style.cursor = "pointer";
                    imgNode.addEventListener('click', function () {
                        selectOwnPieceOnBoard(coord, piece, imgNode)
                    });
                }

                contains_pieces_on_board.appendChild(imgNode);
            }
        }
    }

    const drawHop1zuo1OfUpward = function (list: NonTam2PieceUpward[]) {
        const contains_pieces_on_upward = document.getElementById("contains_pieces_on_upward")!;
        GAME_STATE.f.hop1zuo1OfUpward = list;

        // delete everything
        removeChildren(contains_pieces_on_upward);

        for (let i = 0; i < list.length; i++) {
            const piece: NonTam2PieceUpward = list[i];
            let imgNode = createPieceImgToBePlacedOnHop1zuo1(i, toPath(piece));

            imgNode.style.cursor = "pointer";
            imgNode.addEventListener('click', function () {
                selectOwnPieceOnHop1zuo1(i, piece, imgNode)
            });

            contains_pieces_on_upward.appendChild(imgNode);
        }
    }

    const drawHop1zuo1OfDownward = function (list: NonTam2PieceDownward[]) {
        const contains_pieces_on_downward = document.getElementById("contains_pieces_on_downward")!;
        GAME_STATE.f.hop1zuo1OfDownward = list;

        // delete everything
        removeChildren(contains_pieces_on_downward);

        for (let i = 0; i < list.length; i++) {
            const piece: NonTam2PieceDownward = list[i];
            let imgNode = createPieceImgToBePlacedOnHop1zuo1(i, toPath(piece));
            contains_pieces_on_downward.appendChild(imgNode);
        }
    }

    drawBoard(field.currentBoard);
    drawHop1zuo1OfUpward(field.hop1zuo1OfUpward);
    drawHop1zuo1OfDownward(field.hop1zuo1OfDownward);
}
