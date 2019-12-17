"use strict";
function isWaterAbs([row, col]) {
    return (row === 4 && col === 2)
        || (row === 4 && col === 3)
        || (row === 4 && col === 4)
        || (row === 4 && col === 5)
        || (row === 4 && col === 6)
        || (row === 2 && col === 4)
        || (row === 3 && col === 4)
        || (row === 5 && col === 4)
        || (row === 6 && col === 4);
}
function isWater([row, col]) {
    return (row === 4 && col === 2)
        || (row === 4 && col === 3)
        || (row === 4 && col === 4)
        || (row === 4 && col === 5)
        || (row === 4 && col === 6)
        || (row === 2 && col === 4)
        || (row === 3 && col === 4)
        || (row === 5 && col === 4)
        || (row === 6 && col === 4);
}
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
    await new Promise((resolve) => setTimeout(resolve, total_duration));
}
function add_ciurl_if_required(obj, dest, moving_piece_prof) {
    if (isWater(dest) && moving_piece_prof !== Profession.Nuak1) {
        obj.data.water_entry_ciurl = [
            Math.random() < 0.5,
            Math.random() < 0.5,
            Math.random() < 0.5,
            Math.random() < 0.5,
            Math.random() < 0.5,
        ];
    }
}
function get_one_valid_opponent_move() {
    // There is always at least one piece, namely Tam2
    const get_one_opponent_piece = () => {
        while (true) {
            const rand_i = (Math.random() * 9 | 0);
            const rand_j = (Math.random() * 9 | 0);
            const coord = [rand_i, rand_j];
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
                const rand_i = (Math.random() * 9 | 0);
                const rand_j = (Math.random() * 9 | 0);
                const coord = [rand_i, rand_j];
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
                dest: toAbsoluteCoord(empty_square),
            },
        };
    }
    const { rotated_piece, rotated_coord } = get_one_opponent_piece();
    const { finite: guideListYellow, infinite: guideListGreen } = calculateMovablePositions(rotated_coord, rotated_piece, rotateBoard(GAME_STATE.f.currentBoard), GAME_STATE.tam_itself_is_tam_hue);
    const candidates = [...guideListYellow.map(rotateCoord), ...guideListGreen.map(rotateCoord)];
    if (candidates.length === 0) {
        return get_one_valid_opponent_move();
    } // retry
    for (let i = 0; i < 1000; i++) {
        const dest = candidates[Math.random() * candidates.length | 0];
        const destPiece = GAME_STATE.f.currentBoard[dest[0]][dest[1]];
        if (rotated_piece === "Tam2") {
            if (destPiece === null) { /* empty square; first move is completed without stepping */
                const fstdst = dest;
                const cands = eightNeighborhood(fstdst);
                const neighbor = cands[cands.length * Math.random() | 0];
                /* if the neighbor is empty, that is the second destination */
                if (GAME_STATE.f.currentBoard[neighbor[0]][neighbor[1]] == null /* the neighbor is utterly occupied */
                    || coordEq(neighbor, rotateCoord(rotated_coord)) /* the neighbor is occupied by yourself, which means it is actually empty */) {
                    const snddst = neighbor;
                    return {
                        type: "TamMove",
                        stepStyle: "NoStep",
                        secondDest: toAbsoluteCoord(snddst),
                        firstDest: toAbsoluteCoord(fstdst),
                        src: toAbsoluteCoord(rotateCoord(rotated_coord)),
                    };
                }
                else { /* if not, step from there */
                    const step = neighbor;
                    const empty_neighbors_of_step = eightNeighborhood(step).filter(([i, j]) => GAME_STATE.f.currentBoard[i][j] == null);
                    if (empty_neighbors_of_step.length === 0) {
                        return get_one_valid_opponent_move();
                    } // retry
                    const snddst = empty_neighbors_of_step[empty_neighbors_of_step.length * Math.random() | 0];
                    return {
                        type: "TamMove",
                        stepStyle: "StepsDuringLatter",
                        firstDest: toAbsoluteCoord(fstdst),
                        secondDest: toAbsoluteCoord(snddst),
                        src: toAbsoluteCoord(rotateCoord(rotated_coord)),
                        step: toAbsoluteCoord(step),
                    };
                }
            }
            else { /* not an empty square: must complete the first move */
                const step = dest;
                const empty_neighbors_of_step = eightNeighborhood(step).filter(([i, j]) => GAME_STATE.f.currentBoard[i][j] == null);
                if (empty_neighbors_of_step.length === 0) {
                    return get_one_valid_opponent_move();
                } // retry
                const fstdst = empty_neighbors_of_step[empty_neighbors_of_step.length * Math.random() | 0];
                const empty_neighbors_of_fstdst = eightNeighborhood(fstdst).filter(([i, j]) => GAME_STATE.f.currentBoard[i][j] == null);
                if (empty_neighbors_of_fstdst.length === 0) {
                    return get_one_valid_opponent_move();
                } // retry
                const snddst = empty_neighbors_of_fstdst[empty_neighbors_of_fstdst.length * Math.random() | 0];
                return {
                    type: "TamMove",
                    stepStyle: "StepsDuringFormer",
                    firstDest: toAbsoluteCoord(fstdst),
                    secondDest: toAbsoluteCoord(snddst),
                    src: toAbsoluteCoord(rotateCoord(rotated_coord)),
                    step: toAbsoluteCoord(step),
                };
            }
        }
        else if (destPiece === null) {
            // cannot step
            const obj = {
                type: "NonTamMove",
                data: {
                    type: "SrcDst",
                    src: toAbsoluteCoord(rotateCoord(rotated_coord)),
                    dest: toAbsoluteCoord(dest),
                },
            };
            add_ciurl_if_required(obj, dest, rotated_piece.prof);
            return obj;
        }
        else if (destPiece === "Tam2") {
            // for now, avoid stepping on Tam2;
            return get_one_valid_opponent_move(); // retry
        }
        else if (destPiece.side === Side.Upward && Math.random() < 0.7) {
            // opponent's piece; stepping and taking both attainable
            // take, with probability 0.7
            const obj = {
                type: "NonTamMove",
                data: {
                    type: "SrcDst",
                    src: toAbsoluteCoord(rotateCoord(rotated_coord)),
                    dest: toAbsoluteCoord(dest),
                },
            };
            add_ciurl_if_required(obj, dest, rotated_piece.prof);
            return obj;
        }
        else { // opponent (prob 30%); ally (prob 100%) --> step
            const step = dest; // less confusing
            /* FIXME: For now, no infinite */
            const { finite: guideListYellow } = calculateMovablePositions(rotateCoord(step), rotated_piece, rotateBoard(GAME_STATE.f.currentBoard), GAME_STATE.tam_itself_is_tam_hue);
            const candidates = guideListYellow.map(rotateCoord);
            if (candidates.length === 0) {
                return get_one_valid_opponent_move();
            } // retry
            for (let i = 0; i < 1000; i++) {
                const finalDest = candidates[Math.random() * candidates.length | 0];
                if (canGetOccupiedBy(Side.Downward, finalDest, {
                    color: rotated_piece.color,
                    prof: rotated_piece.prof,
                    side: Side.Downward,
                }, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue)) {
                    const obj = {
                        type: "NonTamMove",
                        data: {
                            type: "SrcStepDstFinite",
                            src: toAbsoluteCoord(rotateCoord(rotated_coord)),
                            step: toAbsoluteCoord(step),
                            dest: toAbsoluteCoord(finalDest),
                        },
                    };
                    add_ciurl_if_required(obj, finalDest, rotated_piece.prof);
                    return obj;
                }
            }
            // if no candidate found, try again
            return get_one_valid_opponent_move();
        }
    }
    // if no candidate found, try again
    return get_one_valid_opponent_move();
}
async function animateOpponentSrcStepDstFinite(p) {
    await animateOpponentSrcStepDstFinite_(fromAbsoluteCoord(p.src), fromAbsoluteCoord(p.step), fromAbsoluteCoord(p.dest), p.water_entry_ciurl);
}
async function animateOpponentSrcStepDstFinite_(src, step, dest, water_entry_ciurl) {
    const [src_i, src_j] = src;
    const [step_i, step_j] = step;
    const [dest_i, dest_j] = dest;
    const piece = GAME_STATE.f.currentBoard[src_i][src_j];
    if (piece === null) {
        throw new Error("src is unoccupied");
    }
    const stepPiece = GAME_STATE.f.currentBoard[step_i][step_j];
    if (stepPiece === null) {
        throw new Error("step is unoccupied");
    }
    const destPiece = GAME_STATE.f.currentBoard[dest_i][dest_j];
    if (water_entry_ciurl) {
        await animateWaterEntryLogo();
        displayCiurl(water_entry_ciurl, Side.Downward);
        await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
        if (water_entry_ciurl.filter((a) => a).length < 3) {
            alert(DICTIONARY.ja.failedWaterEntry);
            return;
        }
    }
    /* it IS possible that you are returning to the original position, in which case you don't do anything */
    if (destPiece !== null) {
        const flipped = downwardTakingUpward(destPiece);
        GAME_STATE.f.hop1zuo1OfDownward.push(flipped);
        const srcNode = document.getElementById(`field_piece_${src_i}_${src_j}`);
        const destNode = document.getElementById(`field_piece_${dest_i}_${dest_j}`);
        await animateNode(srcNode, 750 * 0.8093, coordToPieceXY_Shifted(step), coordToPieceXY(src));
        await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
        await animateNode(srcNode, 750 * 0.8093, coordToPieceXY(dest), coordToPieceXY(src));
        await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
        await animateNode(destNode, 750 * 0.8093, indToHo1Zuo1OfDownward(GAME_STATE.f.hop1zuo1OfDownward.length - 1), coordToPieceXY([dest_i, dest_j]), "50", 180);
        if (!coordEq(src, dest)) {
            GAME_STATE.f.currentBoard[src_i][src_j] = null;
            GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        }
        drawField(GAME_STATE.f);
    }
    else {
        const imgNode = document.getElementById(`field_piece_${src_i}_${src_j}`);
        await animateNode(imgNode, 750 * 0.8093, coordToPieceXY_Shifted(step), coordToPieceXY(src));
        await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
        await animateNode(imgNode, 750 * 0.8093, coordToPieceXY(dest), coordToPieceXY(src));
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
function downwardTakingUpward(upward) {
    if (upward === "Tam2") {
        throw new Error("tried to convert Tam2 into downward");
    }
    else if (upward.side === Side.Downward) {
        throw new Error("tried to convert an already downward piece to downward");
    }
    else if (upward.side === Side.Upward) {
        const flipped = {
            color: upward.color,
            prof: upward.prof,
            side: Side.Downward,
        };
        return flipped;
    }
    else {
        const _should_not_reach_here = upward.side;
        throw new Error("should not reach here");
    }
}
async function animateOpponentSrcDst(p) {
    const src = fromAbsoluteCoord(p.src);
    const dst = fromAbsoluteCoord(p.dest);
    if (p.water_entry_ciurl) {
        await animateOpponentSrcDst_(src, dst, p.water_entry_ciurl);
    }
    else {
        await animateOpponentSrcDst_(src, dst);
    }
}
async function animateOpponentSrcDst_(src, dst, water_entry_ciurl) {
    const [src_i, src_j] = src;
    const [dest_i, dest_j] = dst;
    const piece = GAME_STATE.f.currentBoard[src_i][src_j];
    if (piece === null) {
        throw new Error("src is unoccupied");
    }
    const destPiece = GAME_STATE.f.currentBoard[dest_i][dest_j];
    if (water_entry_ciurl) {
        await animateWaterEntryLogo();
        displayCiurl(water_entry_ciurl, Side.Downward);
        await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
        if (water_entry_ciurl.filter((a) => a).length < 3) {
            alert(DICTIONARY.ja.failedWaterEntry);
            return;
        }
    }
    /* it's NOT possible that you are returning to the original position, in which case you don't do anything */
    if (destPiece !== null) {
        const flipped = downwardTakingUpward(destPiece);
        GAME_STATE.f.hop1zuo1OfDownward.push(flipped);
        const srcNode = document.getElementById(`field_piece_${src_i}_${src_j}`);
        const destNode = document.getElementById(`field_piece_${dest_i}_${dest_j}`);
        const total_duration = 750 * 0.8093;
        await animateNode(srcNode, total_duration, coordToPieceXY([dest_i, dest_j]), coordToPieceXY([src_i, src_j]));
        await animateNode(destNode, total_duration, indToHo1Zuo1OfDownward(GAME_STATE.f.hop1zuo1OfDownward.length - 1), coordToPieceXY([dest_i, dest_j]), "50", 180);
        GAME_STATE.f.currentBoard[src_i][src_j] = null;
        GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        drawField(GAME_STATE.f);
    }
    else {
        const imgNode = document.getElementById(`field_piece_${src_i}_${src_j}`);
        await animateNode(imgNode, 1500 * 0.8093, coordToPieceXY([dest_i, dest_j]), coordToPieceXY([src_i, src_j]));
        GAME_STATE.f.currentBoard[src_i][src_j] = null;
        GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        drawField(GAME_STATE.f);
    }
}
async function animateOpponentFromHand(piece, dest) {
    // remove the corresponding one from hand
    const ind = GAME_STATE.f.hop1zuo1OfDownward.findIndex((p) => p.color === piece.color && p.prof === piece.prof);
    if (ind === -1) {
        throw new Error("What should exist in the hand does not exist");
    }
    const [removed] = GAME_STATE.f.hop1zuo1OfDownward.splice(ind, 1);
    // add the removed piece to the destination
    const [dest_i, dest_j] = dest;
    if (GAME_STATE.f.currentBoard[dest_i][dest_j] !== null) {
        throw new Error("Trying to parachute the piece onto an occupied space");
    }
    const imgNode = document.getElementById(`hop1zuo1OfDownward_${ind}`);
    await animateNode(imgNode, 1500 * 0.8093, coordToPieceXY([dest_i, dest_j]), /* hop1zuo1 and board does not agree on the absolute coordinates, but agrees on the displacement */ indToHo1Zuo1OfDownward(ind));
    GAME_STATE.f.currentBoard[dest_i][dest_j] = removed;
    drawField(GAME_STATE.f);
}
async function animateOpponentTamNoStep(src, fstdst, snddst) {
    const piece = GAME_STATE.f.currentBoard[src[0]][src[1]];
    if (piece === null) {
        throw new Error("src is unoccupied");
    }
    const imgNode = document.getElementById(`field_piece_${src[0]}_${src[1]}`);
    await animateNode(imgNode, 1500 * 0.8093, coordToPieceXY(fstdst), coordToPieceXY(src));
    GAME_STATE.f.currentBoard[src[0]][src[1]] = null;
    GAME_STATE.f.currentBoard[fstdst[0]][fstdst[1]] = piece;
    drawField(GAME_STATE.f);
    const imgNode2 = document.getElementById(`field_piece_${fstdst[0]}_${fstdst[1]}`);
    /* somehow does not work without this line */
    await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
    await animateNode(imgNode2, 1500 * 0.8093, coordToPieceXY(snddst), coordToPieceXY(fstdst));
    GAME_STATE.f.currentBoard[fstdst[0]][fstdst[1]] = null;
    GAME_STATE.f.currentBoard[snddst[0]][snddst[1]] = piece;
    drawField(GAME_STATE.f);
}
async function animateOpponentTamSteppingDuringFormer(p) {
    await animateOpponentSrcStepDstFinite_(p.src, p.step, p.firstDest);
    await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
    await animateOpponentSrcDst_(p.firstDest, p.secondDest);
}
async function animateOpponentTamSteppingDuringLatter(p) {
    await animateOpponentSrcDst_(p.src, p.firstDest);
    await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
    await animateOpponentSrcStepDstFinite_(p.firstDest, p.step, p.secondDest);
}
