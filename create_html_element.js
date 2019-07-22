"use strict";
/**
 * Every function must return an HTMLElement.
 * No write to the global variable is permitted.
 * Every call to document.createElement should live here.
 */
var BOX_SIZE = 70;
var MAX_PIECE_SIZE = BOX_SIZE - 1;
var PIECE_SIZE = 60;
function createPieceSizeImageOnBoardByPathAndXY(top, left, path, className) {
    var i = document.createElement("img");
    i.classList.add(className);
    i.style.top = top + "px";
    i.style.left = left + "px";
    i.src = "image/" + path + ".png";
    i.width = PIECE_SIZE;
    i.height = PIECE_SIZE;
    return i;
}
function createPieceSizeImageOnBoardByPath(coord, path, className) {
    var row_index = coord[0], column_index = coord[1];
    return createPieceSizeImageOnBoardByPathAndXY(1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2, 1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2, path, className);
}
function createPieceSizeImageOnBoardByPath_Shifted(coord, path, className) {
    var row_index = coord[0], column_index = coord[1];
    return createPieceSizeImageOnBoardByPathAndXY(1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE), 1 + column_index * BOX_SIZE, path, className);
}
function createCircleGuideImageAt(coord, path) {
    var row_index = coord[0], column_index = coord[1];
    var img = document.createElement("img");
    img.classList.add("guide");
    img.style.top = 1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2 + "px";
    img.style.left = 1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - MAX_PIECE_SIZE) / 2 + "px";
    img.src = "image/" + path + ".png";
    img.width = MAX_PIECE_SIZE;
    img.height = MAX_PIECE_SIZE;
    img.style.cursor = "pointer";
    img.style.opacity = "0.3";
    return img;
}
function createCiurl(side, o) {
    var img = document.createElement("img");
    img.src = "image/ciurl_" + side + ".png";
    img.width = 150;
    img.height = 15;
    img.classList.add("ciurl");
    img.style.left = o.left + "px";
    img.style.top = o.top + "px";
    img.style.zIndex = "300";
    img.style.transform = "rotate(" + o.rotateDeg + "deg)";
    img.style.position = "absolute";
    return img;
}
