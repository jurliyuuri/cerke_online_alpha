"use strict";
function applyDeltas(coord, deltas) {
    var i = coord[0], j = coord[1];
    var assertCoord = function (_a) {
        var l = _a[0], m = _a[1];
        return [l, m];
    };
    return deltas.map(function (_a) {
        var delta_x = _a[0], delta_y = _a[1];
        return [i + delta_x, j + delta_y];
    })
        .filter(function (_a) {
        var l = _a[0], m = _a[1];
        return (0 <= l && l <= 8 && 0 <= m && m <= 8);
    })
        .map(assertCoord);
}
console.assert(JSON.stringify(getBlockerDeltas([-6, 3])) === "[[-4,2],[-2,1]]");
console.assert(JSON.stringify(getBlockerDeltas([-3, 0])) === "[[-2,0],[-1,0]]");
console.assert(JSON.stringify(getBlockerDeltas([0, 3])) === "[[0,1],[0,2]]");
function getBlockerDeltas(delta) {
    /* blocking occurs only when there exists [dx_block, dy_block] such that
    - the dot product with [dx, dy] is positive
    - the cross product with [dx, dy] is zero
    - abs(dx_block, dy_block) < abs(dx, dy)
    */
    var dx = delta[0], dy = delta[1];
    var ans = [];
    for (var dx_block = -8; dx_block <= 8; dx_block++) {
        for (var dy_block = -8; dy_block <= 8; dy_block++) {
            if (dx * dy_block - dy * dx_block !== 0)
                continue; // cross product must be zero
            if (dx * dx_block + dy * dy_block <= 0)
                continue; // cross product must be positive
            if (dx_block * dx_block + dy_block * dy_block >= dx * dx + dy * dy)
                continue;
            // must be strictly small in absolute value
            ans[ans.length] = [dx_block, dy_block];
        }
    }
    return ans;
}
function applyDeltasIfNoIntervention(coord, deltas, board) {
    var _a;
    return (_a = []).concat.apply(_a, deltas.map(function (delta) { return applySingleDeltaIfNoIntervention(coord, delta, board); }));
}
function applySingleDeltaIfNoIntervention(coord, delta, board) {
    var blocker = applyDeltas(coord, getBlockerDeltas(delta));
    // if nothing is blocking the way
    if (blocker.every(function (_a) {
        var i = _a[0], j = _a[1];
        return board[i][j] == null;
    })) {
        return applyDeltas(coord, [delta]);
    }
    else {
        return [];
    }
}
function applySingleDeltaIfSingleIntervention(coord, delta, board) {
    var blocker = applyDeltas(coord, getBlockerDeltas(delta));
    // if a single piece is blocking the way
    if (blocker.filter(function (_a) {
        var i = _a[0], j = _a[1];
        return board[i][j] != null;
    }).length === 1) {
        return applyDeltas(coord, [delta]);
    }
    else {
        return [];
    }
}
function applyDeltasIfSingleIntervention(coord, deltas, board) {
    var _a;
    return (_a = []).concat.apply(_a, deltas.map(function (delta) { return applySingleDeltaIfSingleIntervention(coord, delta, board); }));
}
function eightNeighborhood(coord) {
    return applyDeltas(coord, [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ]);
}
function calculateMovablePositions(coord, sq, board) {
    if (sq === "Tam2") {
        return eightNeighborhood(coord);
    }
    if (sq.side === Side.Downward) {
        alert("We do not expect a downward stuff!!!");
        throw new Error("We do not expect a downward stuff!!!");
    }
    if (sq.prof === Profession.Io) {
        return eightNeighborhood(coord);
    }
    var UPLEFT = [[-8, -8], [-7, -7], [-6, -6], [-5, -5], [-4, -4], [-3, -3], [-2, -2], [-1, -1]];
    var UPRIGHT = [[-8, 8], [-7, 7], [-6, 6], [-5, 5], [-4, 4], [-3, 3], [-2, 2], [-1, 1]];
    var DOWNLEFT = [[8, -8], [7, -7], [6, -6], [5, -5], [4, -4], [3, -3], [2, -2], [1, -1]];
    var DOWNRIGHT = [[8, 8], [7, 7], [6, 6], [5, 5], [4, 4], [3, 3], [2, 2], [1, 1]];
    var UP = [[-1, 0], [-2, 0], [-3, 0], [-4, 0], [-5, 0], [-6, 0], [-7, 0], [-8, 0]];
    var DOWN = [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0]];
    var LEFT = [[0, -1], [0, -2], [0, -3], [0, -4], [0, -5], [0, -6], [0, -7], [0, -8]];
    var RIGHT = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8]];
    if (isTamHue(coord, board)) {
        switch (sq.prof) {
            case Profession.Uai1: // General, 将, varxle
                return eightNeighborhood(coord);
            case Profession.Kaun1:
                return applyDeltas(coord, [[-2, -2], [-2, 2], [2, 2], [2, -2]]); // 車, vadyrd
            case Profession.Kauk2: // Pawn, 兵, elmer
                return applyDeltas(coord, [[-1, 0], [0, -1], [0, 1], [1, 0]]).concat(applySingleDeltaIfNoIntervention(coord, [-2, 0], board));
            case Profession.Nuak1: // Vessel, 船, felkana
                return applyDeltas(coord, [[-1, 0], [0, -1], [0, 1], [1, 0]]).concat(applyDeltasIfNoIntervention(coord, UP.concat(DOWN, [
                    [0, -2], [0, 2]
                ]), board));
            case Profession.Gua2: // Rook, 弓, gustuer
            case Profession.Dau2: // Tiger, 虎, stistyst
                return applyDeltasIfNoIntervention(coord, UPLEFT.concat(UPRIGHT, DOWNLEFT, DOWNRIGHT), board);
            case Profession.Maun1: // Horse, 馬, dodor
                return applyDeltasIfNoIntervention(coord, [
                    [-8, -8], [-7, -7], [-6, -6], [-5, -5], [-4, -4], [-3, -3], [-2, -2],
                    [-8, 8], [-7, 7], [-6, 6], [-5, 5], [-4, 4], [-3, 3], [-2, 2],
                    [8, -8], [7, -7], [6, -6], [5, -5], [4, -4], [3, -3], [2, -2],
                    [8, 8], [7, 7], [6, 6], [5, 5], [4, 4], [3, 3], [2, 2]
                ], board);
            case Profession.Kua2: // Clerk, 筆, kua
                return applyDeltasIfNoIntervention(coord, UP.concat(DOWN, LEFT, RIGHT), board);
            case Profession.Tuk2: // Shaman, 巫, terlsk
                return applyDeltasIfSingleIntervention(coord, UP.concat(DOWN, LEFT, RIGHT, UPLEFT, UPRIGHT, DOWNLEFT, DOWNRIGHT), board);
            default:
                var _should_not_reach_here = sq.prof;
                return _should_not_reach_here;
        }
    }
    else {
        switch (sq.prof) {
            case Profession.Kauk2:
                return applyDeltas(coord, [[-1, 0]]); // Pawn, 兵, elmer
            case Profession.Kaun1:
                return applyDeltas(coord, [[-2, 0], [2, 0], [0, -2], [0, 2]]); // 車, vadyrd
            case Profession.Dau2:
                return applyDeltas(coord, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
            // Tiger, 虎, stistyst
            case Profession.Maun1: // Horse, 馬, dodor
                return applyDeltas(coord, [[-2, -2], [-2, 2], [2, 2], [2, -2]]);
            case Profession.Nuak1: // Vessel, 船, felkana
                return applyDeltasIfNoIntervention(coord, UP, board);
            case Profession.Gua2: // Rook, 弓, gustuer
                return applyDeltasIfNoIntervention(coord, UP.concat(DOWN, LEFT, RIGHT), board);
            case Profession.Kua2: // Clerk, 筆, kua
                return applyDeltas(coord, [[-1, 0], [0, -1], [0, 1], [1, 0]]).concat(applyDeltasIfNoIntervention(coord, UP.concat(DOWN), board));
            case Profession.Tuk2: // Shaman, 巫, terlsk
                return applyDeltas(coord, [[-1, 0], [0, -1], [0, 1], [1, 0]]).concat(applyDeltasIfNoIntervention(coord, LEFT.concat(RIGHT), board));
            case Profession.Uai1: // General, 将, varxle
                return applyDeltas(coord, [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1], [0, 1],
                    [1, -1], [1, 1]
                ]);
            default:
                var _should_not_reach_here = sq.prof;
                return _should_not_reach_here;
        }
    }
}
