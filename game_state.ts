type Hop1Zuo1 = NonTam2Piece[];

interface Field {
    currentBoard: Board;
    hop1zuo1OfUpward: NonTam2PieceUpward[];
    hop1zuo1OfDownward: NonTam2PieceDownward[];
}

interface GAME_STATE {
    f: Field;
    IA_is_down: boolean;
    tam_itself_is_tam_hue: boolean;
    is_my_turn: boolean;
    backupDuringStepping: null | [Coord, Piece];
}

function toAbsoluteCoord_([row, col]: Coord, IA_is_down: boolean): AbsoluteCoord {
    return [
        [
            AbsoluteRow.A, AbsoluteRow.E, AbsoluteRow.I,
            AbsoluteRow.U, AbsoluteRow.O, AbsoluteRow.Y,
            AbsoluteRow.AI, AbsoluteRow.AU, AbsoluteRow.IA,
        ][IA_is_down ? row : 8 - row],
        [
            AbsoluteColumn.K, AbsoluteColumn.L, AbsoluteColumn.N,
            AbsoluteColumn.T, AbsoluteColumn.Z, AbsoluteColumn.X,
            AbsoluteColumn.C, AbsoluteColumn.M, AbsoluteColumn.P,
        ][IA_is_down ? col : 8 - col],
    ];
}

function fromAbsoluteCoord_([absrow, abscol]: AbsoluteCoord, IA_is_down: boolean): Coord {
    let rowind: BoardIndex;

    if (absrow === AbsoluteRow.A) { rowind = 0; } else if (absrow === AbsoluteRow.E) { rowind = 1; } else if (absrow === AbsoluteRow.I) { rowind = 2; } else if (absrow === AbsoluteRow.U) { rowind = 3; } else if (absrow === AbsoluteRow.O) { rowind = 4; } else if (absrow === AbsoluteRow.Y) { rowind = 5; } else if (absrow === AbsoluteRow.AI) { rowind = 6; } else if (absrow === AbsoluteRow.AU) { rowind = 7; } else if (absrow === AbsoluteRow.IA) { rowind = 8; } else {
        const _should_not_reach_here: never = absrow;
        throw new Error("does not happen");
    }

    let colind: BoardIndex;

    if (abscol === AbsoluteColumn.K) { colind = 0; } else if (abscol === AbsoluteColumn.L) { colind = 1; } else if (abscol === AbsoluteColumn.N) { colind = 2; } else if (abscol === AbsoluteColumn.T) { colind = 3; } else if (abscol === AbsoluteColumn.Z) { colind = 4; } else if (abscol === AbsoluteColumn.X) { colind = 5; } else if (abscol === AbsoluteColumn.C) { colind = 6; } else if (abscol === AbsoluteColumn.M) { colind = 7; } else if (abscol === AbsoluteColumn.P) { colind = 8; } else {
        const _should_not_reach_here: never = abscol;
        throw new Error("does not happen");
    }

    if (IA_is_down) {
        return [rowind, colind];
    } else {
        return [8 - rowind as BoardIndex, 8 - colind as BoardIndex];
    }
}

function toAbsoluteCoord(coord: Coord): AbsoluteCoord {
    return toAbsoluteCoord_(coord, GAME_STATE.IA_is_down);
}

function fromAbsoluteCoord(abs: AbsoluteCoord): Coord {
    return fromAbsoluteCoord_(abs, GAME_STATE.IA_is_down);
}

let GAME_STATE: GAME_STATE = ((p: {IA_is_down: boolean}) => {
    console.log("0");
    const initial_board_with_IA_down: Board = [
        [{ color: Color.Huok2, prof: Profession.Kua2, side: Side.Downward },
            { color: Color.Huok2, prof: Profession.Maun1, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Kaun1, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Uai1, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Io, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Uai1, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Kaun1, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Maun1, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Kua2, side: Side.Downward }],
        [{ color: Color.Kok1, prof: Profession.Tuk2, side: Side.Downward }, {color: Color.Kok1, prof: Profession.Gua2, side: Side.Downward }, null, { color: Color.Kok1, prof: Profession.Dau2, side: Side.Downward }, null, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Downward }, null, {color: Color.Huok2, prof: Profession.Gua2, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Tuk2, side: Side.Downward }],
        [{ color: Color.Huok2, prof: Profession.Kauk2, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Nuak1, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Downward }],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, "Tam2", null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [{ color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Nuak1, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward }],
        [{ color: Color.Huok2, prof: Profession.Tuk2, side: Side.Upward }, {color: Color.Huok2, prof: Profession.Gua2, side: Side.Upward }, null, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, null, { color: Color.Kok1, prof: Profession.Dau2, side: Side.Upward }, null, {color: Color.Kok1, prof: Profession.Gua2, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Tuk2, side: Side.Upward }],
        [{ color: Color.Kok1, prof: Profession.Kua2, side: Side.Upward },
            { color: Color.Kok1, prof: Profession.Maun1, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Kaun1, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Uai1, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Io, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Uai1, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Kaun1, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Maun1, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Kua2, side: Side.Upward }],
    ];
    let _is_my_turn: boolean = true; // override this by calling the setter
    return {
    f: {
        currentBoard: p.IA_is_down ? initial_board_with_IA_down : rotateBoard(initial_board_with_IA_down),
        hop1zuo1OfDownward: [],
        hop1zuo1OfUpward: [],
    },
    IA_is_down: p.IA_is_down,
    tam_itself_is_tam_hue: true,
    set is_my_turn(i: boolean) {
        _is_my_turn = !!i;
        if (_is_my_turn) {
            document.getElementById("larta_me")!.style.display = "block";
            document.getElementById("larta_opponent")!.style.display = "none";
            document.getElementById("protective_cover_over_field_while_waiting_for_opponent")!.classList.add("nocover");
        } else {
            document.getElementById("larta_me")!.style.display = "none";
            document.getElementById("larta_opponent")!.style.display = "block";
            document.getElementById("protective_cover_over_field_while_waiting_for_opponent")!.classList.remove("nocover");
            window.setTimeout(sendMainPoll, 500 * 0.8093);
        }
    },

    get is_my_turn() {
        return _is_my_turn;
    },
    backupDuringStepping: null,
}; })({IA_is_down: Math.random() < 0.5});
