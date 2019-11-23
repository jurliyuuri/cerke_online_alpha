"use strict";
const BOX_SIZE = 70;
const MAX_PIECE_SIZE = BOX_SIZE - 1;
const PIECE_SIZE = 60;
function coordToPieceXY(coord) {
    const [row_index, column_index] = coord;
    return {
        top: 1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
        left: 1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2
    };
}
function indToHop1Zuo1Horizontal(ind) {
    return 1 + ind * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2;
}
function indToHo1Zuo1OfDownward(ind) {
    return { top: -135 /* FIXME: magic */, left: indToHop1Zuo1Horizontal(ind) };
}
