"use strict";
function toAbsoluteCoord_([row, col], IA_is_down) {
    return [
        [
            AbsoluteRow.A, AbsoluteRow.E, AbsoluteRow.I,
            AbsoluteRow.U, AbsoluteRow.O, AbsoluteRow.Y,
            AbsoluteRow.AI, AbsoluteRow.AU, AbsoluteRow.IA
        ][IA_is_down ? row : 8 - row],
        [
            AbsoluteColumn.K, AbsoluteColumn.L, AbsoluteColumn.N,
            AbsoluteColumn.T, AbsoluteColumn.Z, AbsoluteColumn.X,
            AbsoluteColumn.C, AbsoluteColumn.M, AbsoluteColumn.P
        ][IA_is_down ? col : 8 - col]
    ];
}
function fromAbsoluteCoord_([absrow, abscol], IA_is_down) {
    let rowind;
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
        let _should_not_reach_here = absrow;
        throw new Error("does not happen");
    }
    let colind;
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
        let _should_not_reach_here = abscol;
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
let GAME_STATE = (() => {
    let _is_my_turn = true;
    return {
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
                window.setTimeout(poll, 500 * 0.8093);
            }
        },
        get is_my_turn() {
            return _is_my_turn;
        },
        backupDuringStepping: null
    };
})();
