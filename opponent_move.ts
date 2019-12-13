type OpponentMove = {
    type: 'NonTamMove',
    data:  {
        type: 'SrcDst',
        src: AbsoluteCoord,
        dest: AbsoluteCoord
    } | {
        type: 'FromHand';
        color: Color;
        prof: Profession;
        dest: AbsoluteCoord;
    } | {
        type: 'SrcStepDstFinite';
        src: AbsoluteCoord;
        step: AbsoluteCoord;
        dest: AbsoluteCoord;
    } | {
        type: 'InfAfterStep',
        src: AbsoluteCoord,
        step: AbsoluteCoord,
        plannedDirection: AbsoluteCoord,
        finalDest: Promise<AbsoluteCoord>
    }
} | {
    type: 'TamMove'
    stepStyle: 'NoStep';
    src: AbsoluteCoord;
    firstDest: AbsoluteCoord;
    secondDest: AbsoluteCoord;
};

/**
 * @param total_duration total duration in millisecond
 * @param rotate angle to rotate, in degrees
 */
async function animateNode(node: HTMLElement, 
    total_duration: number, 
    to: {top: number, left: number}, 
    from: {top: number, left: number}, 
    zIndex: string = "100",
    rotate?: number) {
    node.style.transition = `transform ${total_duration / 1000}s ease`;
    node.style.zIndex = zIndex; // so that it doesn't go under another piece
    node.style.transform = `translateY(${to.top - from.top}px)`;
    node.style.transform += `translateX(${to.left - from.left}px)`;
    if (rotate != null) {
        node.style.transform += `rotate(${rotate}deg)`;
    }
    await new Promise(resolve => setTimeout(resolve, total_duration));
}

function get_one_valid_opponent_move(): OpponentMove {

    // There is always at least one piece, namely Tam2
    const get_one_opponent_piece: () => {rotated_piece: "Tam2" | NonTam2PieceUpward, rotated_coord: Coord} = () => {
        while (true) {
            let rand_i = (Math.random() * 9 | 0) as BoardIndex; 
            let rand_j = (Math.random() * 9 | 0) as BoardIndex; 
            let coord : Coord = [rand_i, rand_j];
            const piece: Piece | null =  GAME_STATE.f.currentBoard[rand_i][rand_j];
            
            if (piece === null) { 
                continue; 
            } else if (piece === "Tam2") {
                return {rotated_piece: piece, rotated_coord: rotateCoord(coord)};
            } else if (piece.side === Side.Downward) {
                const rot_piece: NonTam2PieceUpward = {prof: piece.prof, color: piece.color, side: Side.Upward};
                return {rotated_piece: rot_piece, rotated_coord: rotateCoord(coord)}
            } else {
                continue;
            }
        }
    };

    if (Math.random() < 0.2) {
        const len = GAME_STATE.f.hop1zuo1OfDownward.length;
        if (len === 0) { return get_one_valid_opponent_move(); } // retry

        const piece = GAME_STATE.f.hop1zuo1OfDownward[Math.random() * len | 0];

        const empty_square = (() => {while (true) {
            let rand_i = (Math.random() * 9 | 0) as BoardIndex; 
            let rand_j = (Math.random() * 9 | 0) as BoardIndex; 
            let coord : Coord = [rand_i, rand_j];
            if (GAME_STATE.f.currentBoard[rand_i][rand_j] == null) { return coord; }
        }})();

        return { 
            type: "NonTamMove",
            data: {
                type: "FromHand",
                color: piece.color,
                prof: piece.prof,
                dest: toAbsoluteCoord(empty_square)
            }
        }
    } 

    const {rotated_piece, rotated_coord} = get_one_opponent_piece();
    const { finite: guideListYellow, infinite: guideListGreen } = calculateMovablePositions(
        rotated_coord,
        rotated_piece,
        rotateBoard(GAME_STATE.f.currentBoard),
        GAME_STATE.tam_itself_is_tam_hue
    );

    const candidates : Coord[] = [...guideListYellow.map(rotateCoord), ...guideListGreen.map(rotateCoord)];

    if (candidates.length === 0) { return get_one_valid_opponent_move(); } // retry

    for (let i = 0; i < 1000; i++) {
        const dest = candidates[Math.random() * candidates.length | 0];
        const destPiece = GAME_STATE.f.currentBoard[dest[0]][dest[1]];
        if (rotated_piece === "Tam2") {
            /* FIXME: for now, no stepping */

            if (destPiece === null) { /* empty square; first move */
                const fstdst: Coord = dest;
                const empty_neighbors = eightNeighborhood(fstdst).filter(([i,j]) => GAME_STATE.f.currentBoard[i][j] == null);
                if (empty_neighbors.length === 0) { return get_one_valid_opponent_move(); } // retry
                const snddst: Coord = empty_neighbors[Math.random() * empty_neighbors.length | 0];
                return {
                    type: "TamMove",
                    stepStyle: "NoStep",
                    secondDest: toAbsoluteCoord(snddst),
                    firstDest: toAbsoluteCoord(fstdst),
                    src: toAbsoluteCoord(rotateCoord(rotated_coord))
                }
            }
        } else if (destPiece === null) {
            // cannot step
            return {
                type: 'NonTamMove',
                data:  {
                    type: 'SrcDst',
                    src: toAbsoluteCoord(rotateCoord(rotated_coord)),
                    dest: toAbsoluteCoord(dest)
                }
            }
        } else if (destPiece === "Tam2") {
            // for now, avoid stepping on Tam2;
            return get_one_valid_opponent_move(); // retry
        } else if (destPiece.side === Side.Upward && Math.random() < 0.7) {
            // opponent's piece; stepping and taking both attainable
            // take, with probability 0.7
            
            return {
                type: 'NonTamMove',
                data:  {
                    type: 'SrcDst',
                    src: toAbsoluteCoord(rotateCoord(rotated_coord)),
                    dest: toAbsoluteCoord(dest)
                }
            }
        } else { // opponent (prob 30%); ally (prob 100%) --> step
            const step = dest; // less confusing

            /* FIXME: For now, no infinite */
            const { finite: guideListYellow, infinite: guideListGreen } = calculateMovablePositions(
                rotateCoord(step),
                rotated_piece,
                rotateBoard(GAME_STATE.f.currentBoard),
                GAME_STATE.tam_itself_is_tam_hue
            );

            const candidates_finite : Coord[] = guideListYellow.map(rotateCoord);
            const candidates_infinite : Coord[] = guideListGreen.map(rotateCoord);
            if (candidates_finite.length === 0 && candidates_infinite.length === 0) { return get_one_valid_opponent_move(); } // retry
            for (let i = 0; i < 1000; i++) {

                // conditional probability, to choose all candidates equally likely
                if (Math.random() < candidates_finite.length / (candidates_finite.length + candidates_infinite.length)) {
                    const finalDest = candidates_finite[Math.random() * candidates_finite.length | 0];
                    if (canGetOccupiedBy(Side.Downward, finalDest, {
                        color: rotated_piece.color, 
                        prof: rotated_piece.prof, 
                        side: Side.Downward
                    }, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue)) {
                        return {
                            type: "NonTamMove",
                            data: {
                                type: "SrcStepDstFinite",
                                src: toAbsoluteCoord(rotateCoord(rotated_coord)),
                                step: toAbsoluteCoord(step),
                                dest: toAbsoluteCoord(finalDest)
                            }
                        }
                    }
                } else {
                    const finalDest = candidates_infinite[Math.random() * candidates_infinite.length | 0];
                    if (canGetOccupiedBy(Side.Downward, finalDest, {
                        color: rotated_piece.color, 
                        prof: rotated_piece.prof, 
                        side: Side.Downward
                    }, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue)) {
                        return {
                            type: "NonTamMove",
                            data: {
                                type: "InfAfterStep",
                                src: toAbsoluteCoord(rotateCoord(rotated_coord)),
                                step: toAbsoluteCoord(step),
                                plannedDirection: toAbsoluteCoord(finalDest),
                                finalDest: new Promise((resolve, reject) => {
                                    /* fixme */
                                })
                            }
                        }
                    }
                }
                
            }
            // if no candidate found, try again
            return get_one_valid_opponent_move();
        }
    }

    // if no candidate found, try again
    return get_one_valid_opponent_move();
}


async function displayOpponentSrcStepDstFinite(src: Coord, step: Coord, dest: Coord) {
    const [src_i, src_j] = src;
    const [step_i, step_j] = step;
    const [dest_i, dest_j] = dest;

    let piece: Piece | null = GAME_STATE.f.currentBoard[src_i][src_j]
    if (piece === null) {
        throw new Error("src is unoccupied");
    }

    let stepPiece: Piece | null = GAME_STATE.f.currentBoard[step_i][step_j];

    if (stepPiece === null) {
        throw new Error("step is unoccupied");
    }

    let destPiece: Piece | null = GAME_STATE.f.currentBoard[dest_i][dest_j];

    /* it IS possible that you are returning to the original position, in which case you don't do anything */
    if (destPiece !== null) {
        const flipped: NonTam2PieceDownward = downwardTakingUpward(destPiece) ;
        GAME_STATE.f.hop1zuo1OfDownward.push(flipped);

        let srcNode : HTMLElement = document.getElementById(`field_piece_${src_i}_${src_j}`)!;
        let destNode : HTMLElement = document.getElementById(`field_piece_${dest_i}_${dest_j}`)!;

        await animateNode(srcNode, 750 * 0.8093, 
            coordToPieceXY_Shifted(step), 
            coordToPieceXY(src)
        );

        await new Promise(resolve => setTimeout(resolve, 300 * 0.8093)); 

        await animateNode(srcNode, 750 * 0.8093, 
            coordToPieceXY(dest),
            coordToPieceXY(src) /* must be src, since the node is not renewed */
        );

        await new Promise(resolve => setTimeout(resolve, 300 * 0.8093)); 
        
        await animateNode(destNode, 750 * 0.8093, 
            indToHo1Zuo1OfDownward(GAME_STATE.f.hop1zuo1OfDownward.length - 1),
            coordToPieceXY([dest_i, dest_j]),
            "50", 180
        );

        if (!coordEq(src, dest)) {
            GAME_STATE.f.currentBoard[src_i][src_j] = null;
            GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        }
        drawField(GAME_STATE.f);
    } else {
        let imgNode : HTMLElement = document.getElementById(`field_piece_${src_i}_${src_j}`)!;
        await animateNode(imgNode, 750 * 0.8093, 
            coordToPieceXY_Shifted(step), 
            coordToPieceXY(src)
        );

        await new Promise(resolve => setTimeout(resolve, 300 * 0.8093)); 

        await animateNode(imgNode, 750 * 0.8093, 
            coordToPieceXY(dest),
            coordToPieceXY(src) /* must be src, since the node is not renewed */
        );
        if (!coordEq(src, dest)) {
            GAME_STATE.f.currentBoard[src_i][src_j] = null;
            GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        }
        drawField(GAME_STATE.f);
    }
}

/**
 * Unsafe function. Takes an upward piece and turns it into a downward one. Panics if already downward or Tam2.
 * @param {Piece} upward  
 */
function downwardTakingUpward(upward: Piece): NonTam2PieceDownward {
    if (upward === "Tam2") {
        throw new Error("tried to convert Tam2 into downward");
    } else if (upward.side === Side.Downward) {
        throw new Error("tried to convert an already downward piece to downward");
    } else if (upward.side === Side.Upward) {
        const flipped: NonTam2PieceDownward = {
            color: upward.color,
            prof: upward.prof,
            side: Side.Downward
        }
        return flipped;
    } else {
        let _should_not_reach_here: never = upward.side;
        throw new Error("should not reach here");
    }
}

async function displayOpponentSrcDst(src: Coord, dst: Coord) {
    const [src_i, src_j] = src;
    const [dest_i, dest_j] = dst;
    
    let piece: Piece | null = GAME_STATE.f.currentBoard[src_i][src_j]
    if (piece === null) {
        throw new Error("src is unoccupied");
    }

    let destPiece: Piece | null = GAME_STATE.f.currentBoard[dest_i][dest_j];

    /* it's NOT possible that you are returning to the original position, in which case you don't do anything */
    if (destPiece !== null) {
        const flipped: NonTam2PieceDownward = downwardTakingUpward(destPiece);
        GAME_STATE.f.hop1zuo1OfDownward.push(flipped);

        let srcNode : HTMLElement = document.getElementById(`field_piece_${src_i}_${src_j}`)!;
        let destNode : HTMLElement = document.getElementById(`field_piece_${dest_i}_${dest_j}`)!;

        const total_duration = 750 * 0.8093;
        await animateNode(srcNode, total_duration, 
            coordToPieceXY([dest_i, dest_j]), 
            coordToPieceXY([src_i, src_j])
        );
        
        await animateNode(destNode, total_duration, 
            indToHo1Zuo1OfDownward(GAME_STATE.f.hop1zuo1OfDownward.length - 1),
            coordToPieceXY([dest_i, dest_j]),
            "50", 180
        );

        GAME_STATE.f.currentBoard[src_i][src_j] = null;
        GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        drawField(GAME_STATE.f);
    } else {
        let imgNode : HTMLElement = document.getElementById(`field_piece_${src_i}_${src_j}`)!;
        await animateNode(imgNode, 1500 * 0.8093, 
            coordToPieceXY([dest_i, dest_j]), 
            coordToPieceXY([src_i, src_j])
        );
        GAME_STATE.f.currentBoard[src_i][src_j] = null;
        GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        drawField(GAME_STATE.f);
    }
}

async function displayOpponentFromHand(piece: NonTam2PieceDownward, dest: Coord) {
    // remove the corresponding one from hand
    const ind = GAME_STATE.f.hop1zuo1OfDownward.findIndex(
        p => p.color === piece.color && p.prof === piece.prof
    );
    if (ind === -1) {
        throw new Error("What should exist in the hand does not exist");
    }
    const [removed] = GAME_STATE.f.hop1zuo1OfDownward.splice(ind, 1);

    // add the removed piece to the destination
    const [dest_i, dest_j] = dest;
    if (GAME_STATE.f.currentBoard[dest_i][dest_j] !== null) {
        throw new Error("Trying to parachute the piece onto an occupied space");
    }

    let imgNode : HTMLElement = document.getElementById(`hop1zuo1OfDownward_${ind}`)!;
    await animateNode(imgNode, 1500 * 0.8093, 
        coordToPieceXY([dest_i, dest_j]), /* hop1zuo1 and board does not agree on the absolute coordinates, but agrees on the displacement */
        indToHo1Zuo1OfDownward(ind)
    )

    GAME_STATE.f.currentBoard[dest_i][dest_j] = removed;
    drawField(GAME_STATE.f);
}

async function displayOpponentTamNoStep(src: Coord, fstdst: Coord, snddst: Coord) {
    const piece: Piece | null = GAME_STATE.f.currentBoard[src[0]][src[1]]
    if (piece === null) {
        throw new Error("src is unoccupied");
    }

    let imgNode : HTMLElement = document.getElementById(`field_piece_${src[0]}_${src[1]}`)!;
    await animateNode(imgNode, 1500 * 0.8093, 
        coordToPieceXY(fstdst), 
        coordToPieceXY(src)
    );
    GAME_STATE.f.currentBoard[src[0]][src[1]] = null;
    GAME_STATE.f.currentBoard[fstdst[0]][fstdst[1]] = piece;
    drawField(GAME_STATE.f);
    
    let imgNode2 : HTMLElement = document.getElementById(`field_piece_${fstdst[0]}_${fstdst[1]}`)!;

    /* somehow does not work without this line */
    await new Promise(resolve => setTimeout(resolve, 300 * 0.8093)); 

    await animateNode(imgNode2, 1500 * 0.8093, 
        coordToPieceXY(snddst), 
        coordToPieceXY(fstdst)
    );
    GAME_STATE.f.currentBoard[fstdst[0]][fstdst[1]] = null;
    GAME_STATE.f.currentBoard[snddst[0]][snddst[1]] = piece;
    drawField(GAME_STATE.f);
}
