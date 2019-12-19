"use strict";
/**
 * Every function must return an HTMLElement.
 * No write to the global variable is permitted.
 * Every call to document.createElement should live here.
 */
function createArrowPiece(path, coord) {
    const [row_index, column_index] = coord;
    const top = 1 + row_index * BOX_SIZE + 159.5;
    const left = column_index * BOX_SIZE + 19.25;
    const i = document.createElement("img");
    i.classList.add("selection");
    i.style.top = `${top}px`;
    i.style.left = `${left}px`;
    i.src = `image/${path}.png`;
    i.width = 140;
    i.height = 140;
    return i;
}
function createPieceSizeImageOnBoardByPathAndXY(top, left, path, className) {
    const i = document.createElement("img");
    i.setAttribute("draggable", "false");
    i.classList.add(className);
    i.style.top = `${top}px`;
    i.style.left = `${left}px`;
    i.src = `image/${path}.png`;
    i.width = PIECE_SIZE;
    i.height = PIECE_SIZE;
    return i;
}
function createPieceSizeImageOnBoardByPath(coord, path, className) {
    const { top, left } = coordToPieceXY(coord);
    return createPieceSizeImageOnBoardByPathAndXY(top, left, path, className);
}
function createCancelButton() {
    return createPieceSizeImageOnBoardByPathAndXY(1 + 9 * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE), 1 + 7.5 * BOX_SIZE, "piece/bmun", "piece_image_on_board");
}
function createPieceSizeImageOnBoardByPath_Shifted(coord, path, className) {
    const { top, left } = coordToPieceXY_Shifted(coord);
    return createPieceSizeImageOnBoardByPathAndXY(top, left, path, className);
}
function createCircleGuideImageAt(coord, path) {
    const [row_index, column_index] = coord;
    const img = document.createElement("img");
    img.setAttribute("draggable", "false");
    img.classList.add("guide");
    img.style.top = `${1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2}px`;
    img.style.left = `${1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2}px`;
    img.src = `image/${path}.png`;
    img.width = MAX_PIECE_SIZE;
    img.height = MAX_PIECE_SIZE;
    img.style.cursor = "pointer";
    img.style.opacity = "0.3";
    return img;
}
function createCiurl(side, o) {
    const img = document.createElement("img");
    img.setAttribute("draggable", "false");
    img.src = `image/ciurl_${side}.png`;
    img.width = 150;
    img.height = 15;
    img.classList.add("ciurl");
    img.style.left = `${o.left}px`;
    img.style.top = `${o.top}px`;
    img.style.zIndex = "300";
    img.style.transform = `rotate(${o.rotateDeg}deg)`;
    img.style.position = "absolute";
    return img;
}
function createPieceImgToBePlacedOnHop1zuo1(ind, path) {
    return createPieceSizeImageOnBoardByPathAndXY(1 + (MAX_PIECE_SIZE - PIECE_SIZE) / 2, indToHop1Zuo1Horizontal(ind), path, "piece_image_on_hop1zuo1");
}
function createPieceImgToBePlacedOnBoard(coord, piece) {
    return createPieceSizeImageOnBoardByPath(coord, toPath_(piece), "piece_image_on_board");
}
