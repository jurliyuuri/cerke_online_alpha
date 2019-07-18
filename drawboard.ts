const BOX_SIZE = 70;
const MAX_PIECE_SIZE = BOX_SIZE - 1;
const PIECE_SIZE = 60;

function createPieceImgToBePlacedOnBoardByPath(coord: Coord, path: string): HTMLImageElement {
    let [row_index, column_index] = coord;
    let i = document.createElement("img");
    i.classList.add("piece_image_on_board");
    i.style.top = `${1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2}px`;
    i.style.left = `${1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2}px`;
    i.src = `image/${path}.png`;
    i.width = PIECE_SIZE;
    i.height = PIECE_SIZE;
    return i;
}

function toPath(p: NonTam2Piece): string {
    const sideToPath = function (side: Side): string {
        if (side === Side.Downward) return "piece_rev";
        if (side === Side.Upward) return "piece";

        let _should_not_reach_here: never = side;
        return _should_not_reach_here;
    }

    const colorToPath = function (color: Color): string {
        if (color === Color.Huok2) return "b";
        if (color === Color.Kok1) return "r";

        let _should_not_reach_here: never = color;
        return _should_not_reach_here;
    }

    const profToPath = function (prof: Profession): string {
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

        let _should_not_reach_here: never = prof;
        return _should_not_reach_here;
    }

    return `${sideToPath(p.side)}/${colorToPath(p.color)}${profToPath(p.prof)}`
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
    let contains_guides = document.getElementById("contains_guides")!;

    // delete everything
    while (contains_guides.firstChild) {
        contains_guides.removeChild(contains_guides.firstChild);
    }

    let contains_guides_on_upward = document.getElementById("contains_guides_on_upward")!;

    // delete everything
    while (contains_guides_on_upward.firstChild) {
        contains_guides_on_upward.removeChild(contains_guides_on_upward.firstChild);
    }
}



function drawSelectednessOnBoard(coord: Coord) {
    let [row_index, column_index] = coord;
    let i = document.createElement("img");
    i.classList.add("selection");
    i.style.top = `${1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2}px`;
    i.style.left = `${1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2}px`;
    i.src = `image/selection2.png`;
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

function drawHoverAt(coord: Coord, piece: Piece) {
    let contains_phantom = document.getElementById("contains_phantom")!;

    let [row_index, column_index] = coord;
    let img = document.createElement("img");
    img.classList.add("piece_image_on_board");
    img.style.top = `${1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE)}px`;
    img.style.left = `${1 + column_index * BOX_SIZE}px`;
    img.src = `image/${toPath_(piece)}.png`;
    img.width = PIECE_SIZE;
    img.height = PIECE_SIZE;

    img.style.zIndex = "100";
    img.style.cursor = "pointer";

    // TODO: draw as being already selected
    img.addEventListener('click', function (ev) {
        alert("foo");
    });
    contains_phantom.appendChild(img);
}


function drawCancel() {
    let contains_phantom = document.getElementById("contains_phantom")!;

    let [row_index, column_index] = [9, 7.5];
    let img = document.createElement("img");
    img.classList.add("piece_image_on_board");
    img.style.top = `${1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE)}px`;
    img.style.left = `${1 + column_index * BOX_SIZE}px`;
    img.src = `image/piece/bmun.png`;
    img.width = 80;
    img.height = 80;

    img.style.zIndex = "100";
    img.style.cursor = "pointer";

    // TODO: draw as being already selected
    img.addEventListener('click', function (ev) {
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
    });
    contains_phantom.appendChild(img);
}


function drawPhantomAt(coord: Coord, piece: Piece) {
    let contains_phantom = document.getElementById("contains_phantom")!;
    erasePhantom();

    const phantom: HTMLImageElement = createPieceImgToBePlacedOnBoard(coord, piece);
    phantom.style.opacity = "0.1";
    contains_phantom.appendChild(phantom);
}

function stepping(from: Coord, piece: Piece, to: Coord, destPiece: Piece) {
    eraseGuide();
    document.getElementById("protective_cover_over_field")!.classList.remove("nocover");

    // delete the original one
    GAME_STATE.backupDuringStepping = [from, piece];
    GAME_STATE.f.currentBoard[from[0]][from[1]] = null;

    // draw
    drawField(GAME_STATE.f);

    drawPhantomAt(from, piece);

    drawCancel();

    drawHoverAt(to, piece);
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
            console.log("sending normal move:", JSON.stringify(message));

            eraseGuide();
            UI_STATE.selectedCoord = null;

            alert("message sent.");
            return;
        } else {
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

        console.log("sending normal move:", JSON.stringify(message));

        eraseGuide();
        UI_STATE.selectedCoord = null;

        alert("message sent.");
        return;
    } else {
        stepping(from, piece, to, destPiece);
        return;
    }
}

function createYellowGuideImageAt(coord: Coord, path: string) {
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

function showGuideOfBoardPiece(coord: Coord, piece: Piece) {
    const contains_guides = document.getElementById("contains_guides")!;
    const centralNode: HTMLImageElement = drawSelectednessOnBoard(coord);
    contains_guides.appendChild(centralNode);

    const {finite: guideListYellow, infinite: guideListGreen} = calculateMovablePositions(
        coord,
        piece,
        GAME_STATE.f.currentBoard,
        GAME_STATE.tam_itself_is_tam_hue);

    const guideList = [...guideListYellow, ...guideListGreen]

    for (let ind = 0; ind < guideList.length; ind++) {

        // draw the yellow guides
        let img = createYellowGuideImageAt(guideList[ind], "ct");

        // click on it to get things going
        img.addEventListener('click', function (ev) {
            getThingsGoing(ev, piece, coord, guideList[ind]);

        });

        contains_guides.appendChild(img);
    }

}

function selectOwnPieceOnBoard(ev: MouseEvent, coord: Coord, piece: Piece, imgNode: HTMLImageElement) {
    const [i, j] = coord;
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
    } else {
        eraseGuide();
        UI_STATE.selectedCoord = coord;
        showGuideOfBoardPiece(coord, piece);
    }

}

function drawSelectednessOnHop1zuo1At(ind: number) {
    let i = document.createElement("img");
    i.classList.add("selection");
    i.style.top = `${1 + (MAX_PIECE_SIZE - PIECE_SIZE) / 2}px`;
    i.style.left = `${1 + ind * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2}px`;
    i.src = `image/selection2.png`;
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

function showGuideOnHop1zuo1At(ind: number, piece: Piece) {
    const contains_guides_on_upward = document.getElementById("contains_guides_on_upward")!;
    const centralNode: HTMLImageElement = drawSelectednessOnHop1zuo1At(ind);
    contains_guides_on_upward.appendChild(centralNode);

    const contains_guides = document.getElementById("contains_guides")!;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let ij: Coord = [i as BoardIndex, j as BoardIndex];
            if (GAME_STATE.f.currentBoard[i][j] != null) {
                continue;
            }

            // draw the yellow guides
            let img = createYellowGuideImageAt(ij, "ct");

            // click on it to get things going
            img.addEventListener('click', function (ev) {
                getThingsGoingFromHop1zuo1(ev, piece, ["Hop1zuo1", ind], ij);

            });

            contains_guides.appendChild(img);
        }
    }
}

function selectOwnPieceOnHop1zuo1(ev: MouseEvent, ind: number, piece: Piece, imgNode: HTMLImageElement) {
    console.log(ev, ind, piece);

    /* If the piece that was originally selected were Hop1zuo1 */
    if (UI_STATE.selectedCoord != null && UI_STATE.selectedCoord[0] === "Hop1zuo1") {
        if (UI_STATE.selectedCoord[1] === ind) { /* re-click: deselect */
            eraseGuide();
            UI_STATE.selectedCoord = null;
            return;
        } else {
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

function createPieceImgToBePlacedOnHop1zuo1(ind: number, path: string): HTMLImageElement {
    let img = document.createElement("img");
    img.classList.add("piece_image_on_hop1zuo1");
    img.style.top = `${1 + (MAX_PIECE_SIZE - PIECE_SIZE) / 2}px`;
    img.style.left = `${1 + ind * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2}px`;
    img.src = `image/${path}.png`;
    img.width = PIECE_SIZE;
    img.height = PIECE_SIZE;
    return img;
}

function toPath_(piece: Piece) {
    if (piece === "Tam2") {
        return "piece/tam";
    } else {
        return toPath(piece);
    }
}

function createPieceImgToBePlacedOnBoard(coord: Coord, piece: Piece) {
    return createPieceImgToBePlacedOnBoardByPath(coord, toPath_(piece));
}

function drawField(field: Field) {
    const drawBoard = function (board: Board) {
        const contains_pieces_on_board = document.getElementById("contains_pieces_on_board")!;
        GAME_STATE.f.currentBoard = board;

        // delete everything
        while (contains_pieces_on_board.firstChild) {
            contains_pieces_on_board.removeChild(contains_pieces_on_board.firstChild);
        }

        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                const piece: Piece | null = board[i][j];
                if (piece == null) {
                    continue;
                }

                const coord: Coord = [i as BoardIndex, j as BoardIndex];
                let imgNode: HTMLImageElement;
                let selectable;

                imgNode = createPieceImgToBePlacedOnBoard(coord, piece);

                if (piece === "Tam2") {
                    selectable = true;
                } else {
                    selectable = (piece.side === Side.Upward);
                }

                if (selectable) {
                    imgNode.style.cursor = "pointer";
                    imgNode.addEventListener('click', function (ev) {
                        selectOwnPieceOnBoard(ev, coord, piece, imgNode)
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
        while (contains_pieces_on_upward.firstChild) {
            contains_pieces_on_upward.removeChild(contains_pieces_on_upward.firstChild);
        }

        for (let i = 0; i < list.length; i++) {
            const piece: NonTam2PieceUpward = list[i];
            let imgNode = createPieceImgToBePlacedOnHop1zuo1(i, toPath(piece));
            let selectable = true;

            if (selectable) {
                imgNode.style.cursor = "pointer";
                imgNode.addEventListener('click', function (ev) {
                    selectOwnPieceOnHop1zuo1(ev, i, piece, imgNode)
                });
            }

            contains_pieces_on_upward.appendChild(imgNode);
        }
    }

    const drawHop1zuo1OfDownward = function (list: NonTam2PieceDownward[]) {
        const contains_pieces_on_downward = document.getElementById("contains_pieces_on_downward")!;
        GAME_STATE.f.hop1zuo1OfDownward = list;

        // delete everything
        while (contains_pieces_on_downward.firstChild) {
            contains_pieces_on_downward.removeChild(contains_pieces_on_downward.firstChild);
        }

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
