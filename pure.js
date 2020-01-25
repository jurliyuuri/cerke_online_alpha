"use strict";
/**
 * Every function must be pure. Thus,
 * - no write to the global variable
 * - no DOM editing
 */
var Profession = type__message.Profession;
var Side = type__piece.Side;
var Color = type__message.Color;
var toPath = type__piece.toPath;
var toPath_ = type__piece.toPath_;
var toUpOrDown = type__piece.toUpOrDown;
var calculateMovablePositions = calculate_movable.calculateMovablePositions;
var coordEq = type__piece.coordEq;
var rotateCoord = type__piece.rotateCoord;
var rotateBoard = type__piece.rotateBoard;
var eightNeighborhood = calculate_movable.eightNeighborhood;
var isTamHue = calculate_movable.isTamHue;
var canGetOccupiedBy = calculate_movable.canGetOccupiedBy;
var canGetOccupiedByNonTam = calculate_movable.canGetOccupiedByNonTam;
function filterInOneDirectionTillCiurlLimit(guideListGreen, step, plannedDirection, ciurl) {
    return guideListGreen.filter(function (c) {
        const subtractStep = function ([x, y]) {
            const [step_x, step_y] = step;
            return [x - step_x, y - step_y];
        };
        const limit = ciurl.filter((x) => x).length;
        const [deltaC_x, deltaC_y] = subtractStep(c);
        const [deltaPlan_x, deltaPlan_y] = subtractStep(plannedDirection);
        return (
        // 1. (c - step) crossed with (plannedDirection - step) gives zero
        deltaC_x * deltaPlan_y - deltaPlan_x * deltaC_y === 0 &&
            // 2.  (c - step) dotted with (plannedDirection - step) gives positive
            deltaC_x * deltaPlan_x + deltaC_y * deltaPlan_y > 0 &&
            // 3. deltaC must not exceed the limit enforced by ciurl
            Math.max(Math.abs(deltaC_x), Math.abs(deltaC_y)) <= limit);
    });
}
