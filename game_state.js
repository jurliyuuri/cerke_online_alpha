"use strict";
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
