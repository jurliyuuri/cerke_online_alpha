"use strict";
var Profession = type__message.Profession;
var Side = type__piece.Side;
var Color = type__message.Color;
var toPath = type__piece.toPath;
var toPath_ = type__piece.toPath_;
var toUpOrDown = type__piece.toUpOrDown;
var AbsoluteColumn = type__message.AbsoluteColumn;
var AbsoluteRow = type__message.AbsoluteRow;
var calculateMovablePositions = calculate_movable.calculateMovablePositions;
var coordEq = type__piece.coordEq;
const sampleBoard = [
    [{ color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward },
        null, null, { color: Color.Kok1, prof: Profession.Dau2, side: Side.Upward }, null, null, null, null, null],
    [null, null, { color: Color.Kok1, prof: Profession.Dau2, side: Side.Downward }, null, null, null, null, null, null],
    [{ color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, "Tam2", "Tam2", null, { color: Color.Kok1, prof: Profession.Dau2, side: Side.Upward }, null, null, null, null],
    [null, { color: Color.Huok2, prof: Profession.Kaun1, side: Side.Upward }, "Tam2", null, null, null, null, null, null],
    [null, null, null, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, null, null, null, null],
    [{ color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward },
        null, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, null, null, null, null, null],
    [null, null, null, { color: Color.Huok2, prof: Profession.Kaun1, side: Side.Upward }, null, { color: Color.Kok1, prof: Profession.Tuk2, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Tuk2, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Tuk2, side: Side.Upward }, null],
    [null, null, { color: Color.Kok1, prof: Profession.Io, side: Side.Upward }, null, null, null, null, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, null],
    [null, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward }, null, { color: Color.Huok2, prof: Profession.Maun1, side: Side.Upward }, null, null, null, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, "Tam2"]
];
const sampleField = {
    currentBoard: sampleBoard,
    hop1zuo1OfDownward: [{ color: Color.Kok1, prof: Profession.Dau2, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Uai1, side: Side.Downward }],
    hop1zuo1OfUpward: [{ color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward }]
};
