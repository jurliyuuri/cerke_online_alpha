function applyDeltas(coord: Coord, deltas: Array<[number, number]>): Array<Coord> {
    const [i, j] = coord;
    const assertCoord: (k: number[]) => Coord = ([l, m]) => ([l, m] as Coord);
    return deltas.map(([delta_x, delta_y]) => [i + delta_x, j + delta_y])
        .filter(([l, m]) => (0 <= l && l <= 8 && 0 <= m && m <= 8))
        .map(assertCoord);
}

console.assert(JSON.stringify(getBlockerDeltas([-6, 3])) === "[[-4,2],[-2,1]]");
console.assert(JSON.stringify(getBlockerDeltas([-3, 0])) === "[[-2,0],[-1,0]]");
console.assert(JSON.stringify(getBlockerDeltas([0, 3])) === "[[0,1],[0,2]]");
function getBlockerDeltas(delta: [number, number]): Array<[number, number]> {
    /* blocking occurs only when there exists [dx_block, dy_block] such that 
    - the dot product with [dx, dy] is positive 
    - the cross product with [dx, dy] is zero
    - abs(dx_block, dy_block) < abs(dx, dy)
    */
    const [dx, dy] = delta;

    let ans: Array<[number, number]> = [];

    for (let dx_block = -8; dx_block <= 8; dx_block++) {
        for (let dy_block = -8; dy_block <= 8; dy_block++) {
            if (dx * dy_block - dy * dx_block !== 0) continue; // cross product must be zero
            if (dx * dx_block + dy * dy_block <= 0) continue; // cross product must be positive
            if (dx_block * dx_block + dy_block * dy_block >= dx * dx + dy * dy) continue;
            // must be strictly small in absolute value

            ans[ans.length] = [dx_block, dy_block];
        }
    }
    return ans;
}

function applyDeltasIfNoIntervention(coord: Coord, deltas: Array<[number, number]>, board: Board): Array<Coord> {
    return ([] as Coord[]).concat(...deltas.map(delta => applySingleDeltaIfNoIntervention(coord, delta, board)));
}

function applySingleDeltaIfNoIntervention(coord: Coord, delta: [number, number], board: Board): Array<Coord> {
    let blocker: Array<Coord> = applyDeltas(coord, getBlockerDeltas(delta));

    // if nothing is blocking the way
    if (blocker.every(([i, j]) => board[i][j] == null)) {
        return applyDeltas(coord, [delta]);
    } else {
        return [];
    }
}

function applySingleDeltaIfSingleIntervention(coord: Coord, delta: [number, number], board: Board): Array<Coord> {
    let blocker: Array<Coord> = applyDeltas(coord, getBlockerDeltas(delta));

    // if a single piece is blocking the way
    if (blocker.filter(([i, j]) => board[i][j] != null).length === 1) {
        return applyDeltas(coord, [delta]);
    } else {
        return [];
    }
}

function applyDeltasIfSingleIntervention(coord: Coord, deltas: Array<[number, number]>, board: Board): Array<Coord> {
    return ([] as Coord[]).concat(...deltas.map(delta => applySingleDeltaIfSingleIntervention(coord, delta, board)));
}


function eightNeighborhood(coord: Coord): Array<Coord> {
    return applyDeltas(coord, [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ]);
}

function calculateMovablePositions(coord: Coord, sq: Piece, board: Board): Array<Coord> {
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
    
    const UPLEFT: Array<[number, number]> = [[-8, -8], [-7, -7], [-6, -6], [-5, -5], [-4, -4], [-3, -3], [-2, -2], [-1, -1]];
    const UPRIGHT: Array<[number, number]> = [[-8, 8], [-7, 7], [-6, 6], [-5, 5], [-4, 4], [-3, 3], [-2, 2], [-1, 1]];
    const DOWNLEFT: Array<[number, number]> = [[8, -8], [7, -7], [6, -6], [5, -5], [4, -4], [3, -3], [2, -2], [1, -1]];
    const DOWNRIGHT: Array<[number, number]> = [[8, 8], [7, 7], [6, 6], [5, 5], [4, 4], [3, 3], [2, 2], [1, 1]];
    const UP: Array<[number, number]> = [[-1, 0], [-2, 0], [-3, 0], [-4, 0], [-5, 0], [-6, 0], [-7, 0], [-8, 0]];
    const DOWN: Array<[number, number]> = [[1, 0], [2, 0], [ 3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0]];
    const LEFT: Array<[number, number]> = [[0, -1], [0, -2], [0, -3], [0, -4], [0, -5], [0, -6], [0, -7], [0, -8]];
    const RIGHT: Array<[number, number]> = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8]];

    if (isTamHue(coord, board)) {
        switch (sq.prof) {
            case Profession.Uai1: // General, 将, varxle
                return eightNeighborhood(coord);

            case Profession.Kaun1:
                return applyDeltas(coord, [[-2, -2], [-2, 2], [2, 2], [2, -2]]);// 車, vadyrd

            case Profession.Kauk2: // Pawn, 兵, elmer
                return [
                    ...applyDeltas(coord, [[-1, 0], [0, -1], [0, 1], [1, 0]]),
                    ...applySingleDeltaIfNoIntervention(coord, [-2, 0], board)
                ];

            case Profession.Nuak1:  // Vessel, 船, felkana
                return [
                    ...applyDeltas(coord, [[-1, 0], [0, -1], [0, 1], [1, 0]]),
                    ...applyDeltasIfNoIntervention(coord, [
                        ...UP,
                        ...DOWN,
                        [0,-2],[ 0, 2]
                    ], board)
                ];

            case Profession.Gua2: // Rook, 弓, gustuer
            case Profession.Dau2: // Tiger, 虎, stistyst
                return applyDeltasIfNoIntervention(coord, [
                    ...UPLEFT,
                    ...UPRIGHT,
                    ...DOWNLEFT,
                    ...DOWNRIGHT
                ], board);

            case Profession.Maun1: // Horse, 馬, dodor
                return applyDeltasIfNoIntervention(coord, [
                    [-8, -8], [-7, -7], [-6, -6], [-5, -5], [-4, -4], [-3, -3], [-2, -2], 
                    [-8, 8], [-7, 7], [-6, 6], [-5, 5], [-4, 4], [-3, 3], [-2, 2], 
                    [8, -8], [7, -7], [6, -6], [5, -5], [4, -4], [3, -3], [2, -2], 
                    [8, 8], [7, 7], [6, 6], [5, 5], [4, 4], [3, 3], [2, 2]
                ], board);

            case Profession.Kua2: // Clerk, 筆, kua
                return applyDeltasIfNoIntervention(coord, [
                    ...UP,
                    ...DOWN,
                    ...LEFT,
                    ...RIGHT
                ], board);
            
            case Profession.Tuk2: // Shaman, 巫, terlsk
                return applyDeltasIfSingleIntervention(coord, [
                    ...UP,
                    ...DOWN,
                    ...LEFT,
                    ...RIGHT,
                    ...UPLEFT,
                    ...UPRIGHT,
                    ...DOWNLEFT,
                    ...DOWNRIGHT
                ], board)

            default: 
            let _should_not_reach_here : never = sq.prof;
            return _should_not_reach_here;
        }
    } else {
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


            case Profession.Nuak1:  // Vessel, 船, felkana
                return applyDeltasIfNoIntervention(coord, UP, board);

            case Profession.Gua2: // Rook, 弓, gustuer
                return applyDeltasIfNoIntervention(coord, [
                    ...UP,
                    ...DOWN,
                    ...LEFT,
                    ...RIGHT
                ], board);

            case Profession.Kua2: // Clerk, 筆, kua
                return [
                    ...applyDeltas(coord, [[-1, 0], [0, -1], [0, 1], [1, 0]]),
                    ...applyDeltasIfNoIntervention(coord, [
                        ...UP,
                        ...DOWN
                    ], board)
                ];

            case Profession.Tuk2: // Shaman, 巫, terlsk
                return [
                    ...applyDeltas(coord, [[-1, 0], [0, -1], [0, 1], [1, 0]]),
                    ...applyDeltasIfNoIntervention(coord, [
                        ...LEFT,
                        ...RIGHT
                    ], board)
                ];

            case Profession.Uai1: // General, 将, varxle
                return applyDeltas(coord, [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1], [0, 1],
                    [1, -1], [1, 1]
                ]);

            default:
                let _should_not_reach_here: never = sq.prof;
                return _should_not_reach_here;
        }
    }
}
