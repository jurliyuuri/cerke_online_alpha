namespace calculate_movable {
    import Profession = type__message.Profession;
    import Board = type__piece.Board;
    import Coord = type__piece.Coord;
    import coordEq = type__piece.coordEq;

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

    function applySingleDeltaIfZeroOrOneIntervention(coord: Coord, delta: [number, number], board: Board): Array<Coord> {
        let blocker: Array<Coord> = applyDeltas(coord, getBlockerDeltas(delta));

        // if no piece or a single piece is blocking the way
        if (blocker.filter(([i, j]) => board[i][j] != null).length <= 1) {
            return applyDeltas(coord, [delta]);
        } else {
            return [];
        }
    }

    function applyDeltasIfZeroOrOneIntervention(coord: Coord, deltas: Array<[number, number]>, board: Board): Array<Coord> {
        return ([] as Coord[]).concat(...deltas.map(delta => applySingleDeltaIfZeroOrOneIntervention(coord, delta, board)));
    }


    export function eightNeighborhood(coord: Coord): Array<Coord> {
        return applyDeltas(coord, [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ]);
    }

    function isTamHue(coord: Coord, board: Readonly<Board>, tam_itself_is_tam_hue: boolean): boolean {
        // unconditionally TamHue
        if (coordEq(coord, [2, 2]) || coordEq(coord, [2, 6]) ||
            coordEq(coord, [3, 3]) || coordEq(coord, [3, 5]) ||
            coordEq(coord, [4, 4]) ||
            coordEq(coord, [5, 3]) || coordEq(coord, [5, 5]) ||
            coordEq(coord, [6, 2]) || coordEq(coord, [6, 6])
        ) {
            return true;
        }

        if (tam_itself_is_tam_hue && board[coord[0]][coord[1]] === "Tam2") {
            return true;
        }

        // is Tam2 available at any neighborhood?
        return eightNeighborhood(coord).some(([i, j]) => board[i][j] === "Tam2");
    }


    export function calculateMovablePositions(coord: Coord, sq: "Tam2" | NonTam2PieceUpward, board: Board, tam_itself_is_tam_hue: boolean): { finite: Array<Coord>, infinite: Array<Coord> } {
        if (sq === "Tam2") {
            return { finite: eightNeighborhood(coord), infinite: [] };
        }

        if (sq.prof === Profession.Io) {
            return { finite: eightNeighborhood(coord), infinite: [] };
        }

        const UPLEFT: Array<[number, number]> = [[-8, -8], [-7, -7], [-6, -6], [-5, -5], [-4, -4], [-3, -3], [-2, -2], [-1, -1]];
        const UPRIGHT: Array<[number, number]> = [[-8, 8], [-7, 7], [-6, 6], [-5, 5], [-4, 4], [-3, 3], [-2, 2], [-1, 1]];
        const DOWNLEFT: Array<[number, number]> = [[8, -8], [7, -7], [6, -6], [5, -5], [4, -4], [3, -3], [2, -2], [1, -1]];
        const DOWNRIGHT: Array<[number, number]> = [[8, 8], [7, 7], [6, 6], [5, 5], [4, 4], [3, 3], [2, 2], [1, 1]];
        const UP: Array<[number, number]> = [[-1, 0], [-2, 0], [-3, 0], [-4, 0], [-5, 0], [-6, 0], [-7, 0], [-8, 0]];
        const DOWN: Array<[number, number]> = [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0]];
        const LEFT: Array<[number, number]> = [[0, -1], [0, -2], [0, -3], [0, -4], [0, -5], [0, -6], [0, -7], [0, -8]];
        const RIGHT: Array<[number, number]> = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8]];

        if (isTamHue(coord, board, tam_itself_is_tam_hue)) {
            switch (sq.prof) {
                case Profession.Uai1: // General, 将, varxle
                    return { finite: eightNeighborhood(coord), infinite: [] };

                case Profession.Kaun1:
                    return { finite: applyDeltas(coord, [[-2, -2], [-2, 2], [2, 2], [2, -2]]), infinite: [] };// 車, vadyrd

                case Profession.Kauk2: // Pawn, 兵, elmer
                    return {
                        finite: [
                            ...applyDeltas(coord, [[-1, 0], [0, -1], [0, 1], [1, 0]]),
                            ...applySingleDeltaIfNoIntervention(coord, [-2, 0], board)
                        ], infinite: []
                    };

                case Profession.Nuak1:  // Vessel, 船, felkana
                    return {
                        finite: [
                            ...applyDeltas(coord, [[0, -1], [0, 1]]),
                            ...applyDeltasIfNoIntervention(coord, [
                                [0, -2], [0, 2]
                            ], board)
                        ], infinite: applyDeltasIfNoIntervention(coord, [
                            ...UP,
                            ...DOWN
                        ], board)
                    };

                case Profession.Gua2: // Rook, 弓, gustuer
                case Profession.Dau2: // Tiger, 虎, stistyst
                    return {
                        finite: [], infinite: applyDeltasIfNoIntervention(coord, [
                            ...UPLEFT,
                            ...UPRIGHT,
                            ...DOWNLEFT,
                            ...DOWNRIGHT
                        ], board)
                    };

                case Profession.Maun1: // Horse, 馬, dodor
                    return {
                        finite: [], infinite: applyDeltasIfNoIntervention(coord, [
                            [-8, -8], [-7, -7], [-6, -6], [-5, -5], [-4, -4], [-3, -3], [-2, -2],
                            [-8, 8], [-7, 7], [-6, 6], [-5, 5], [-4, 4], [-3, 3], [-2, 2],
                            [8, -8], [7, -7], [6, -6], [5, -5], [4, -4], [3, -3], [2, -2],
                            [8, 8], [7, 7], [6, 6], [5, 5], [4, 4], [3, 3], [2, 2]
                        ], board)
                    };

                case Profession.Kua2: // Clerk, 筆, kua
                    return {
                        finite: [], infinite: applyDeltasIfNoIntervention(coord, [
                            ...UP,
                            ...DOWN,
                            ...LEFT,
                            ...RIGHT
                        ], board)
                    };

                case Profession.Tuk2: // Shaman, 巫, terlsk
                    return {
                        finite: [], infinite: applyDeltasIfZeroOrOneIntervention(coord, [
                            ...UP,
                            ...DOWN,
                            ...LEFT,
                            ...RIGHT,
                            ...UPLEFT,
                            ...UPRIGHT,
                            ...DOWNLEFT,
                            ...DOWNRIGHT
                        ], board)
                    };

                default:
                    let _should_not_reach_here: never = sq.prof;
                    return _should_not_reach_here;
            }
        } else {
            switch (sq.prof) {
                case Profession.Kauk2:
                    return { finite: applyDeltas(coord, [[-1, 0]]), infinite: [] }; // Pawn, 兵, elmer

                case Profession.Kaun1:
                    return { finite: applyDeltas(coord, [[-2, 0], [2, 0], [0, -2], [0, 2]]), infinite: [] }; // 車, vadyrd

                case Profession.Dau2: // Tiger, 虎, stistyst
                    return { finite: applyDeltas(coord, [[-1, -1], [-1, 1], [1, -1], [1, 1]]), infinite: [] };

                case Profession.Maun1: // Horse, 馬, dodor
                    return { finite: applyDeltas(coord, [[-2, -2], [-2, 2], [2, 2], [2, -2]]), infinite: [] };


                case Profession.Nuak1:  // Vessel, 船, felkana
                    return { finite: [], infinite: applyDeltasIfNoIntervention(coord, UP, board) };

                case Profession.Gua2: // Rook, 弓, gustuer
                    return {
                        finite: [], infinite: applyDeltasIfNoIntervention(coord, [
                            ...UP,
                            ...DOWN,
                            ...LEFT,
                            ...RIGHT
                        ], board)
                    };

                case Profession.Kua2: // Clerk, 筆, kua
                    return {
                        finite: applyDeltas(coord, [[0, -1], [0, 1]]),
                        infinite: applyDeltasIfNoIntervention(coord, [
                            ...UP,
                            ...DOWN
                        ], board)
                    };

                case Profession.Tuk2: // Shaman, 巫, terlsk
                    return {
                        finite: applyDeltas(coord, [[-1, 0], [1, 0]]),
                        infinite: applyDeltasIfNoIntervention(coord, [
                            ...LEFT,
                            ...RIGHT
                        ], board)
                    };

                case Profession.Uai1: // General, 将, varxle
                    return {
                        finite: applyDeltas(coord, [
                            [-1, -1], [-1, 0], [-1, 1],
                            [0, -1], [0, 1],
                            [1, -1], [1, 1]
                        ]), infinite: []
                    };

                default:
                    let _should_not_reach_here: never = sq.prof;
                    return _should_not_reach_here;
            }
        }
    }
}
