"use strict";
var type__message;
(function (type__message) {
    var AbsoluteRow;
    (function (AbsoluteRow) {
        AbsoluteRow[AbsoluteRow["A"] = 0] = "A";
        AbsoluteRow[AbsoluteRow["E"] = 1] = "E";
        AbsoluteRow[AbsoluteRow["I"] = 2] = "I";
        AbsoluteRow[AbsoluteRow["U"] = 3] = "U";
        AbsoluteRow[AbsoluteRow["O"] = 4] = "O";
        AbsoluteRow[AbsoluteRow["Y"] = 5] = "Y";
        AbsoluteRow[AbsoluteRow["AI"] = 6] = "AI";
        AbsoluteRow[AbsoluteRow["AU"] = 7] = "AU";
        AbsoluteRow[AbsoluteRow["IA"] = 8] = "IA";
    })(AbsoluteRow = type__message.AbsoluteRow || (type__message.AbsoluteRow = {}));
    var AbsoluteColumn;
    (function (AbsoluteColumn) {
        AbsoluteColumn[AbsoluteColumn["K"] = 0] = "K";
        AbsoluteColumn[AbsoluteColumn["L"] = 1] = "L";
        AbsoluteColumn[AbsoluteColumn["N"] = 2] = "N";
        AbsoluteColumn[AbsoluteColumn["T"] = 3] = "T";
        AbsoluteColumn[AbsoluteColumn["Z"] = 4] = "Z";
        AbsoluteColumn[AbsoluteColumn["X"] = 5] = "X";
        AbsoluteColumn[AbsoluteColumn["C"] = 6] = "C";
        AbsoluteColumn[AbsoluteColumn["M"] = 7] = "M";
        AbsoluteColumn[AbsoluteColumn["P"] = 8] = "P";
    })(AbsoluteColumn = type__message.AbsoluteColumn || (type__message.AbsoluteColumn = {}));
    function toAbsoluteCoord_(_a, IA_is_down) {
        var row = _a[0], col = _a[1];
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
    type__message.toAbsoluteCoord_ = toAbsoluteCoord_;
    function fromAbsoluteCoord_(_a, IA_is_down) {
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
        if (IA_is_down) {
            return [rowind, colind];
        }
        else {
            return [8 - rowind, 8 - colind];
        }
    }
    type__message.fromAbsoluteCoord_ = fromAbsoluteCoord_;
})(type__message || (type__message = {}));
