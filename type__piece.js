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
    function coordEq(a, b) {
        return a[0] === b[0] && a[1] === b[1];
    }
    type__piece.coordEq = coordEq;
})(type__piece || (type__piece = {}));
