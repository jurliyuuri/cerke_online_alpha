"use strict";
/**
 * @param total_duration total duration in millisecond
 * @param rotate angle to rotate, in degrees
 */
async function animateNode(node, total_duration, to, from, zIndex = "100", rotate) {
    node.style.transition = `transform ${total_duration / 1000}s ease`;
    node.style.zIndex = zIndex; // so that it doesn't go under another piece
    node.style.transform = `translateY(${to.top - from.top}px)`;
    node.style.transform += `translateX(${to.left - from.left}px)`;
    if (rotate != null) {
        node.style.transform += `rotate(${rotate}deg)`;
    }
    await new Promise(resolve => setTimeout(resolve, total_duration));
}
function get_one_valid_opponent_move() {
    // There is always at least one piece, namely Tam2
    const get_one_opponent_piece = () => {
        while (true) {
            let rand_i = (Math.random() * 9 | 0);
            let rand_j = (Math.random() * 9 | 0);
            let coord = [rand_i, rand_j];
            const piece = GAME_STATE.f.currentBoard[rand_i][rand_j];
            if (piece === null) {
                continue;
            }
            else if (piece === "Tam2") {
                return { rotated_piece: piece, rotated_coord: rotateCoord(coord) };
            }
            else if (piece.side === Side.Downward) {
                const rot_piece = { prof: piece.prof, color: piece.color, side: Side.Upward };
                return { rotated_piece: rot_piece, rotated_coord: rotateCoord(coord) };
            }
            else {
                continue;
            }
        }
    };
    if (Math.random() < 0.2) {
        const len = GAME_STATE.f.hop1zuo1OfDownward.length;
        if (len === 0) {
            return get_one_valid_opponent_move();
        } // retry
        const piece = GAME_STATE.f.hop1zuo1OfDownward[Math.random() * len | 0];
        const empty_square = (() => {
            while (true) {
                let rand_i = (Math.random() * 9 | 0);
                let rand_j = (Math.random() * 9 | 0);
                let coord = [rand_i, rand_j];
                if (GAME_STATE.f.currentBoard[rand_i][rand_j] == null) {
                    return coord;
                }
            }
        })();
        return {
            type: "NonTamMove",
            data: {
                type: "FromHand",
                color: piece.color,
                prof: piece.prof,
                dest: toAbsoluteCoord(empty_square)
            }
        };
    }
    const { rotated_piece, rotated_coord } = get_one_opponent_piece();
    const { finite: guideListYellow, infinite: guideListGreen } = calculateMovablePositions(rotated_coord, rotated_piece, rotateBoard(GAME_STATE.f.currentBoard), GAME_STATE.tam_itself_is_tam_hue);
    const candidates = [...guideListYellow.map(rotateCoord), ...guideListGreen.map(rotateCoord)];
    if (candidates.length === 0) {
        return get_one_valid_opponent_move();
    } // retry
    /* FIXME: for now, no stepping */
    for (let i = 0; i < 1000; i++) {
        const dest = candidates[Math.random() * candidates.length | 0];
        const destPiece = GAME_STATE.f.currentBoard[dest[0]][dest[1]];
        if (rotated_piece === "Tam2") {
            if (destPiece === null) { /* empty square; first move */
                const fstdst = dest;
                const empty_neighbors = eightNeighborhood(fstdst).filter(([i, j]) => GAME_STATE.f.currentBoard[i][j] == null);
                if (empty_neighbors.length === 0) {
                    return get_one_valid_opponent_move();
                } // retry
                const snddst = empty_neighbors[Math.random() * empty_neighbors.length | 0];
                return {
                    type: "TamMove",
                    stepStyle: "NoStep",
                    secondDest: toAbsoluteCoord(snddst),
                    firstDest: toAbsoluteCoord(fstdst),
                    src: toAbsoluteCoord(rotateCoord(rotated_coord))
                };
            }
        }
        else if (destPiece === null || (destPiece !== "Tam2" && destPiece.side === Side.Upward)) {
            return {
                type: 'NonTamMove',
                data: {
                    type: 'SrcDst',
                    src: toAbsoluteCoord(rotateCoord(rotated_coord)),
                    dest: toAbsoluteCoord(dest)
                }
            };
        }
    }
    // if no candidate found, try again
    return get_one_valid_opponent_move();
}
async function displayOpponentSrcStepDstFinite(src, step, dest) {
    const [src_i, src_j] = src;
    const [step_i, step_j] = step;
    const [dest_i, dest_j] = dest;
    let piece = GAME_STATE.f.currentBoard[src_i][src_j];
    if (piece === null) {
        throw new Error("src is unoccupied");
    }
    let stepPiece = GAME_STATE.f.currentBoard[step_i][step_j];
    if (stepPiece === null) {
        throw new Error("step is unoccupied");
    }
    let destPiece = GAME_STATE.f.currentBoard[dest_i][dest_j];
    /* it IS possible that you are returning to the original position, in which case you don't do anything */
    if (destPiece !== null) {
        if (destPiece === "Tam2") {
            throw new Error("dest is occupied by Tam2");
        }
        else if (destPiece.side === Side.Downward) {
            throw new Error("dest is occupied by an ally");
        }
        else if (destPiece.side === Side.Upward) {
            const flipped = {
                color: destPiece.color,
                prof: destPiece.prof,
                side: Side.Downward
            };
            GAME_STATE.f.hop1zuo1OfDownward.push(flipped);
            let srcNode = document.getElementById(`field_piece_${src_i}_${src_j}`);
            let destNode = document.getElementById(`field_piece_${dest_i}_${dest_j}`);
            await animateNode(srcNode, 750 * 0.8093, coordToPieceXY_Shifted(step), coordToPieceXY(src));
            await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));
            await animateNode(srcNode, 750 * 0.8093, coordToPieceXY(dest), coordToPieceXY(src) /* must be src, since the node is not renewed */);
            await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));
            await animateNode(destNode, 750 * 0.8093, indToHo1Zuo1OfDownward(GAME_STATE.f.hop1zuo1OfDownward.length - 1), coordToPieceXY([dest_i, dest_j]), "50", 180);
            if (!coordEq(src, dest)) {
                GAME_STATE.f.currentBoard[src_i][src_j] = null;
                GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
            }
            drawField(GAME_STATE.f);
        }
        else {
            let _should_not_reach_here = destPiece.side;
            throw new Error("should not reach here");
        }
    }
    else {
        let imgNode = document.getElementById(`field_piece_${src_i}_${src_j}`);
        await animateNode(imgNode, 750 * 0.8093, coordToPieceXY_Shifted(step), coordToPieceXY(src));
        await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));
        await animateNode(imgNode, 750 * 0.8093, coordToPieceXY(dest), coordToPieceXY(src) /* must be src, since the node is not renewed */);
        if (!coordEq(src, dest)) {
            GAME_STATE.f.currentBoard[src_i][src_j] = null;
            GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        }
        drawField(GAME_STATE.f);
    }
}
async function displayOpponentSrcDst(src, dst) {
    const [src_i, src_j] = src;
    const [dest_i, dest_j] = dst;
    let piece = GAME_STATE.f.currentBoard[src_i][src_j];
    if (piece === null) {
        throw new Error("src is unoccupied");
    }
    let destPiece = GAME_STATE.f.currentBoard[dest_i][dest_j];
    /* it's NOT possible that you are returning to the original position, in which case you don't do anything */
    if (destPiece !== null) {
        if (destPiece === "Tam2") {
            throw new Error("dest is occupied by Tam2");
        }
        else if (destPiece.side === Side.Downward) {
            throw new Error("dest is occupied by an ally");
        }
        else if (destPiece.side === Side.Upward) {
            const flipped = {
                color: destPiece.color,
                prof: destPiece.prof,
                side: Side.Downward
            };
            GAME_STATE.f.hop1zuo1OfDownward.push(flipped);
            let srcNode = document.getElementById(`field_piece_${src_i}_${src_j}`);
            let destNode = document.getElementById(`field_piece_${dest_i}_${dest_j}`);
            const total_duration = 750 * 0.8093;
            await animateNode(srcNode, total_duration, coordToPieceXY([dest_i, dest_j]), coordToPieceXY([src_i, src_j]));
            await animateNode(destNode, total_duration, indToHo1Zuo1OfDownward(GAME_STATE.f.hop1zuo1OfDownward.length - 1), coordToPieceXY([dest_i, dest_j]), "50", 180);
            GAME_STATE.f.currentBoard[src_i][src_j] = null;
            GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
            drawField(GAME_STATE.f);
        }
        else {
            let _should_not_reach_here = destPiece.side;
            throw new Error("should not reach here");
        }
    }
    else {
        let imgNode = document.getElementById(`field_piece_${src_i}_${src_j}`);
        await animateNode(imgNode, 1500 * 0.8093, coordToPieceXY([dest_i, dest_j]), coordToPieceXY([src_i, src_j]));
        GAME_STATE.f.currentBoard[src_i][src_j] = null;
        GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        drawField(GAME_STATE.f);
    }
}
async function displayOpponentFromHand(piece, dest) {
    // remove the corresponding one from hand
    const ind = GAME_STATE.f.hop1zuo1OfDownward.findIndex(p => p.color === piece.color && p.prof === piece.prof);
    if (ind === -1) {
        throw new Error("What should exist in the hand does not exist");
    }
    const [removed] = GAME_STATE.f.hop1zuo1OfDownward.splice(ind, 1);
    // add the removed piece to the destination
    const [dest_i, dest_j] = dest;
    if (GAME_STATE.f.currentBoard[dest_i][dest_j] !== null) {
        throw new Error("Trying to parachute the piece onto an occupied space");
    }
    let imgNode = document.getElementById(`hop1zuo1OfDownward_${ind}`);
    await animateNode(imgNode, 1500 * 0.8093, coordToPieceXY([dest_i, dest_j]), /* hop1zuo1 and board does not agree on the absolute coordinates, but agrees on the displacement */ indToHo1Zuo1OfDownward(ind));
    GAME_STATE.f.currentBoard[dest_i][dest_j] = removed;
    drawField(GAME_STATE.f);
}
async function displayOpponentTamNoStep(src, fstdst, snddst) {
    const piece = GAME_STATE.f.currentBoard[src[0]][src[1]];
    if (piece === null) {
        throw new Error("src is unoccupied");
    }
    let imgNode = document.getElementById(`field_piece_${src[0]}_${src[1]}`);
    await animateNode(imgNode, 1500 * 0.8093, coordToPieceXY(fstdst), coordToPieceXY(src));
    GAME_STATE.f.currentBoard[src[0]][src[1]] = null;
    GAME_STATE.f.currentBoard[fstdst[0]][fstdst[1]] = piece;
    drawField(GAME_STATE.f);
    let imgNode2 = document.getElementById(`field_piece_${fstdst[0]}_${fstdst[1]}`);
    /* somehow does not work without this line */
    await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));
    await animateNode(imgNode2, 1500 * 0.8093, coordToPieceXY(snddst), coordToPieceXY(fstdst));
    GAME_STATE.f.currentBoard[fstdst[0]][fstdst[1]] = null;
    GAME_STATE.f.currentBoard[snddst[0]][snddst[1]] = piece;
    drawField(GAME_STATE.f);
}
