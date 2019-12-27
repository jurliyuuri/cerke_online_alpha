"use strict";
function toAbsoluteCoord_([row, col], IA_is_down) {
    const columns = [
        "K", "L", "N",
        "T", "Z", "X",
        "C", "M", "P",
    ];
    const rows = [
        "A", "E", "I",
        "U", "O", "Y",
        "AI", "AU", "IA",
    ];
    return [
        rows[IA_is_down ? row : 8 - row],
        columns[IA_is_down ? col : 8 - col],
    ];
}
function fromAbsoluteCoord_([absrow, abscol], IA_is_down) {
    let rowind;
    if (absrow === "A") {
        rowind = 0;
    }
    else if (absrow === "E") {
        rowind = 1;
    }
    else if (absrow === "I") {
        rowind = 2;
    }
    else if (absrow === "U") {
        rowind = 3;
    }
    else if (absrow === "O") {
        rowind = 4;
    }
    else if (absrow === "Y") {
        rowind = 5;
    }
    else if (absrow === "AI") {
        rowind = 6;
    }
    else if (absrow === "AU") {
        rowind = 7;
    }
    else if (absrow === "IA") {
        rowind = 8;
    }
    else {
        const _should_not_reach_here = absrow;
        throw new Error("does not happen");
    }
    let colind;
    if (abscol === "K") {
        colind = 0;
    }
    else if (abscol === "L") {
        colind = 1;
    }
    else if (abscol === "N") {
        colind = 2;
    }
    else if (abscol === "T") {
        colind = 3;
    }
    else if (abscol === "Z") {
        colind = 4;
    }
    else if (abscol === "X") {
        colind = 5;
    }
    else if (abscol === "C") {
        colind = 6;
    }
    else if (abscol === "M") {
        colind = 7;
    }
    else if (abscol === "P") {
        colind = 8;
    }
    else {
        const _should_not_reach_here = abscol;
        throw new Error("does not happen");
    }
    if (IA_is_down) {
        return [rowind, colind];
    }
    else {
        return [8 - rowind, 8 - colind];
    }
}
function toAbsoluteCoord(coord) {
    return toAbsoluteCoord_(coord, GAME_STATE.IA_is_down);
}
function fromAbsoluteCoord(abs) {
    return fromAbsoluteCoord_(abs, GAME_STATE.IA_is_down);
}
let GAME_STATE = ((p) => {
    console.log("0");
    const initial_board_with_IA_down = [
        [{ color: Color.Huok2, prof: Profession.Kua2, side: Side.Downward },
            { color: Color.Huok2, prof: Profession.Maun1, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Kaun1, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Uai1, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Io, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Uai1, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Kaun1, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Maun1, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Kua2, side: Side.Downward }],
        [{ color: Color.Kok1, prof: Profession.Tuk2, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Gua2, side: Side.Downward }, null, { color: Color.Kok1, prof: Profession.Dau2, side: Side.Downward }, null, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Downward }, null, { color: Color.Huok2, prof: Profession.Gua2, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Tuk2, side: Side.Downward }],
        [{ color: Color.Huok2, prof: Profession.Kauk2, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Nuak1, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Downward }, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Downward }],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, "Tam2", null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [{ color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Nuak1, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward }],
        [{ color: Color.Huok2, prof: Profession.Tuk2, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Gua2, side: Side.Upward }, null, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, null, { color: Color.Kok1, prof: Profession.Dau2, side: Side.Upward }, null, { color: Color.Kok1, prof: Profession.Gua2, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Tuk2, side: Side.Upward }],
        [{ color: Color.Kok1, prof: Profession.Kua2, side: Side.Upward },
            { color: Color.Kok1, prof: Profession.Maun1, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Kaun1, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Uai1, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Io, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Uai1, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Kaun1, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Maun1, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Kua2, side: Side.Upward }],
    ];
    let _is_my_turn = true; // override this by calling the setter
    const season = 0;
    const log2_rate = 0;
    return {
        f: {
            currentBoard: p.IA_is_down ? initial_board_with_IA_down : rotateBoard(initial_board_with_IA_down),
            hop1zuo1OfDownward: [],
            hop1zuo1OfUpward: [],
        },
        IA_is_down: p.IA_is_down,
        tam_itself_is_tam_hue: true,
        set is_my_turn(i) {
            _is_my_turn = !!i;
            if (_is_my_turn) {
                document.getElementById("larta_me").style.display = "block";
                document.getElementById("larta_opponent").style.display = "none";
                document.getElementById("protective_cover_over_field_while_waiting_for_opponent").classList.add("nocover");
            }
            else {
                document.getElementById("larta_me").style.display = "none";
                document.getElementById("larta_opponent").style.display = "block";
                document.getElementById("protective_cover_over_field_while_waiting_for_opponent").classList.remove("nocover");
                window.setTimeout(sendMainPoll, 500 * 0.8093);
            }
        },
        get is_my_turn() {
            return _is_my_turn;
        },
        backupDuringStepping: null,
        my_score: 20,
        season,
        log2_rate
    };
})({ IA_is_down: Math.random() < 0.5 });
