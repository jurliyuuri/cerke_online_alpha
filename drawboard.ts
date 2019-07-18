const BOX_SIZE = 70;
const MAX_PIECE_SIZE = BOX_SIZE - 1;
const PIECE_SIZE = 60;

function createPieceImgToBePlacedOnBoard(coord: Coord, path: string): HTMLImageElement {
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
    IA_is_down: boolean
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
    IA_is_down: true
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


function getThingsGoing(ev: MouseEvent, piece: Piece, from: Coord, to: Coord) {
    let dest = GAME_STATE.f.currentBoard[to[0]][to[1]];

    if (dest == null) { // dest is empty square; try to simply move

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

    if (dest === "Tam2" || dest.side === Side.Upward || piece === "Tam2") { // can step, but cannot take
        alert("implement stepping");
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
        alert("implement stepping");
        return;
    }
}

function createYellowGuideImageAt(coord: Coord) {
    const [row_index, column_index] = coord;
    let img = document.createElement("img");
    img.classList.add("guide");
    img.style.top = `${1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2}px`;
    img.style.left = `${1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2}px`;
    img.src = `image/ct.png`;
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

    const guideList: Array<Coord> = calculateMovablePositions(coord, piece, GAME_STATE.f.currentBoard);

    for (let ind = 0; ind < guideList.length; ind++) {

        // draw the yellow guides
        let img = createYellowGuideImageAt(guideList[ind])

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
            let img = createYellowGuideImageAt(ij)

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
                if (piece === "Tam2") {
                    imgNode = createPieceImgToBePlacedOnBoard(coord, "piece/tam");
                    selectable = true;
                } else {
                    imgNode = createPieceImgToBePlacedOnBoard(coord, toPath(piece));
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
