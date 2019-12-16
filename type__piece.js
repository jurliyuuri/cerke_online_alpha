"use strict";
var type__piece;
(function (type__piece) {
    var Color = type__message.Color;
    var Profession = type__message.Profession;
    let Side;
    (function (Side) {
        Side[Side["Upward"] = 0] = "Upward";
        Side[Side["Downward"] = 1] = "Downward";
    })(Side = type__piece.Side || (type__piece.Side = {}));
    function fromUpOrDown(u_or_d) {
        return {
            color: u_or_d.color,
            prof: u_or_d.prof,
            side: u_or_d.side,
        };
    }
    type__piece.fromUpOrDown = fromUpOrDown;
    function toUpOrDown(nontam) {
        if (nontam.side === Side.Downward) {
            return {
                color: nontam.color,
                prof: nontam.prof,
                side: nontam.side,
            };
        }
        else {
            return {
                color: nontam.color,
                prof: nontam.prof,
                side: nontam.side,
            };
        }
    }
    type__piece.toUpOrDown = toUpOrDown;
    function coordEq(a, b) {
        return a[0] === b[0] && a[1] === b[1];
    }
    type__piece.coordEq = coordEq;
    function rotateCoord(c) {
        return [8 - c[0], 8 - c[1]];
    }
    type__piece.rotateCoord = rotateCoord;
    function rotateBoard(b) {
        const ans = [
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
        ];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                ans[i][j] = rotatePieceOrNull(b[8 - i][8 - j]);
            }
        }
        return ans;
    }
    type__piece.rotateBoard = rotateBoard;
    function rotatePieceOrNull(p) {
        if (p === null || p === "Tam2") {
            return p;
        }
        else {
            return { prof: p.prof, color: p.color, side: 1 - p.side };
        }
    }
    function toPath(p) {
        const sideToPath = function (side) {
            if (side === Side.Downward) {
                return "piece_rev";
            }
            if (side === Side.Upward) {
                return "piece";
            }
            const _should_not_reach_here = side;
            return _should_not_reach_here;
        };
        const colorToPath = function (color) {
            if (color === Color.Huok2) {
                return "b";
            }
            if (color === Color.Kok1) {
                return "r";
            }
            const _should_not_reach_here = color;
            return _should_not_reach_here;
        };
        const profToPath = function (prof) {
            if (prof === Profession.Dau2) {
                return "dau";
            }
            if (prof === Profession.Gua2) {
                return "gua";
            }
            if (prof === Profession.Io) {
                return "io";
            }
            if (prof === Profession.Kauk2) {
                return "kauk";
            }
            if (prof === Profession.Kaun1) {
                return "kaun";
            }
            if (prof === Profession.Kua2) {
                return "kua";
            }
            if (prof === Profession.Maun1) {
                return "maun";
            }
            if (prof === Profession.Nuak1) {
                return "nuak";
            }
            if (prof === Profession.Tuk2) {
                return "tuk";
            }
            if (prof === Profession.Uai1) {
                return "uai";
            }
            const _should_not_reach_here = prof;
            return _should_not_reach_here;
        };
        return `${sideToPath(p.side)}/${colorToPath(p.color)}${profToPath(p.prof)}`;
    }
    type__piece.toPath = toPath;
    function toPath_(piece) {
        if (piece === "Tam2") {
            return "piece/tam";
        }
        else {
            return toPath(piece);
        }
    }
    type__piece.toPath_ = toPath_;
})(type__piece || (type__piece = {}));
