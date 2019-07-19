"use strict";
var type__piece;
(function (type__piece) {
    var Color;
    (function (Color) {
        Color[Color["Kok1"] = 0] = "Kok1";
        Color[Color["Huok2"] = 1] = "Huok2"; // Black, 黒
    })(Color = type__piece.Color || (type__piece.Color = {}));
    var Side;
    (function (Side) {
        Side[Side["Upward"] = 0] = "Upward";
        Side[Side["Downward"] = 1] = "Downward"; // Pieces that points downward. Denoted by @_@ in the ASCII notation.
    })(Side = type__piece.Side || (type__piece.Side = {}));
    var Profession;
    (function (Profession) {
        Profession[Profession["Nuak1"] = 0] = "Nuak1";
        Profession[Profession["Kauk2"] = 1] = "Kauk2";
        Profession[Profession["Gua2"] = 2] = "Gua2";
        Profession[Profession["Kaun1"] = 3] = "Kaun1";
        Profession[Profession["Dau2"] = 4] = "Dau2";
        Profession[Profession["Maun1"] = 5] = "Maun1";
        Profession[Profession["Kua2"] = 6] = "Kua2";
        Profession[Profession["Tuk2"] = 7] = "Tuk2";
        Profession[Profession["Uai1"] = 8] = "Uai1";
        Profession[Profession["Io"] = 9] = "Io";
    })(Profession = type__piece.Profession || (type__piece.Profession = {}));
    function fromUpOrDown(u_or_d) {
        return {
            color: u_or_d.color,
            prof: u_or_d.prof,
            side: u_or_d.side
        };
    }
    type__piece.fromUpOrDown = fromUpOrDown;
    function toUpOrDown(nontam) {
        if (nontam.side === Side.Downward) {
            return {
                color: nontam.color,
                prof: nontam.prof,
                side: nontam.side
            };
        }
        else {
            return {
                color: nontam.color,
                prof: nontam.prof,
                side: nontam.side
            };
        }
    }
    type__piece.toUpOrDown = toUpOrDown;
    function coordEq(a, b) {
        return a[0] === b[0] && a[1] === b[1];
    }
    type__piece.coordEq = coordEq;
    function toPath(p) {
        var sideToPath = function (side) {
            if (side === Side.Downward)
                return "piece_rev";
            if (side === Side.Upward)
                return "piece";
            var _should_not_reach_here = side;
            return _should_not_reach_here;
        };
        var colorToPath = function (color) {
            if (color === Color.Huok2)
                return "b";
            if (color === Color.Kok1)
                return "r";
            var _should_not_reach_here = color;
            return _should_not_reach_here;
        };
        var profToPath = function (prof) {
            if (prof === Profession.Dau2)
                return "dau";
            if (prof === Profession.Gua2)
                return "gua";
            if (prof === Profession.Io)
                return "io";
            if (prof === Profession.Kauk2)
                return "kauk";
            if (prof === Profession.Kaun1)
                return "kaun";
            if (prof === Profession.Kua2)
                return "kua";
            if (prof === Profession.Maun1)
                return "maun";
            if (prof === Profession.Nuak1)
                return "nuak";
            if (prof === Profession.Tuk2)
                return "tuk";
            if (prof === Profession.Uai1)
                return "uai";
            var _should_not_reach_here = prof;
            return _should_not_reach_here;
        };
        return sideToPath(p.side) + "/" + colorToPath(p.color) + profToPath(p.prof);
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
