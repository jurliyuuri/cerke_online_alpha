import Profession = type__message.Profession;
import Side = type__piece.Side;
import Color = type__message.Color;
import toPath = type__piece.toPath;
import toPath_ = type__piece.toPath_;
import NonTam2Piece = type__piece.NonTam2Piece;
import NonTam2PieceUpward = type__piece.NonTam2PieceUpward;
import NonTam2PieceDownward = type__piece.NonTam2PieceDownward;
import Board = type__piece.Board;
import Piece = type__piece.Piece;
import Coord = type__piece.Coord;
import BoardIndex = type__piece.BoardIndex;
import toUpOrDown = type__piece.toUpOrDown;
import AbsoluteColumn = type__message.AbsoluteColumn;
import AbsoluteCoord = type__message.AbsoluteCoord;
import AbsoluteRow = type__message.AbsoluteRow;
import NormalMove = type__message.NormalMove;
import calculateMovablePositions = calculate_movable.calculateMovablePositions;
import coordEq = type__piece.coordEq;
import rotateCoord = type__piece.rotateCoord;
import rotateBoard = type__piece.rotateBoard;
import NormalNonTamMove = type__message.NormalNonTamMove;
import InfAfterStep = type__message.InfAfterStep;
import AfterHalfAcceptance = type__message.AfterHalfAcceptance;
import Ciurl = type__message.Ciurl;
import Ret_InfAfterStep = type__message.Ret_InfAfterStep;
import Ret_NormalMove = type__message.Ret_NormalMove;
import Ret_AfterHalfAcceptance = type__message.Ret_AfterHalfAcceptance;
import eightNeighborhood = calculate_movable.eightNeighborhood;
import isTamHue = calculate_movable.isTamHue;
import canGetOccupiedBy = calculate_movable.canGetOccupiedBy;

const sampleBoard: Board = [
    [{ color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward },
        null, null, { color: Color.Kok1, prof: Profession.Dau2, side: Side.Upward }, null, null, { color: Color.Kok1, prof: Profession.Gua2, side: Side.Upward }, null, null],
    [null, null, { color: Color.Kok1, prof: Profession.Dau2, side: Side.Downward }, null, null, { color: Color.Kok1, prof: Profession.Maun1, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Kua2, side: Side.Upward }, {color: Color.Kok1, prof: Profession.Kauk2, side: Side.Downward}, null],
    [{ color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, "Tam2", "Tam2", null, { color: Color.Kok1, prof: Profession.Dau2, side: Side.Upward }, null, {color: Color.Kok1, prof: Profession.Uai1, side: Side.Downward}, null, null],
    [null, { color: Color.Huok2, prof: Profession.Kaun1, side: Side.Upward }, "Tam2", null, null, null, null, {color: Color.Huok2, prof: Profession.Uai1, side: Side.Downward}, null],
    [null, null, null, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, null,  { color: Color.Huok2, prof: Profession.Nuak1, side: Side.Downward }, null, null],
    [{ color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward },
        {color: Color.Kok1, prof: Profession.Gua2, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, null, null, { color: Color.Huok2, prof: Profession.Nuak1, side: Side.Upward }, null, null],
    [null, "Tam2", null, { color: Color.Huok2, prof: Profession.Kaun1, side: Side.Upward }, null, { color: Color.Kok1, prof: Profession.Tuk2, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Tuk2, side: Side.Upward }, { color: Color.Kok1, prof: Profession.Tuk2, side: Side.Upward }, null],
    [null, null, { color: Color.Kok1, prof: Profession.Io, side: Side.Upward }, null, { color: Color.Huok2, prof: Profession.Uai1, side: Side.Upward }, null, null, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, null],
    [null, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward }, null, { color: Color.Huok2, prof: Profession.Maun1, side: Side.Upward }, null, null, null, { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward }, "Tam2"],
];

const sampleField: Field = {
    currentBoard: sampleBoard,
    hop1zuo1OfDownward: [{ color: Color.Kok1, prof: Profession.Dau2, side: Side.Downward }, { color: Color.Huok2, prof: Profession.Uai1, side: Side.Downward }],
    hop1zuo1OfUpward: [{ color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward }, { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward }],
};
