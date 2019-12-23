interface SrcDst {
    type: "SrcDst";
    src: AbsoluteCoord;
    dest: AbsoluteCoord;
    water_entry_ciurl?: Ciurl;
}

interface SrcStepDstFinite {
    type: "SrcStepDstFinite";
    src: AbsoluteCoord;
    step: AbsoluteCoord;
    dest: AbsoluteCoord;
    water_entry_ciurl?: Ciurl;
}

interface OpponentMoveWithPotentialWaterEntry {
    type: "NonTamMove";
    data: SrcDst | SrcStepDstFinite;
}

type OpponentMove = OpponentMoveWithPotentialWaterEntry | {
    type: "NonTamMove",
    data: {
        type: "FromHand";
        color: Color;
        prof: Profession;
        dest: AbsoluteCoord;
    },
} | {
    type: "TamMove"
    stepStyle: "NoStep";
    src: AbsoluteCoord;
    firstDest: AbsoluteCoord;
    secondDest: AbsoluteCoord;
} | {
    type: "TamMove"
    stepStyle: "StepsDuringFormer" | "StepsDuringLatter";
    src: AbsoluteCoord;
    step: AbsoluteCoord;
    firstDest: AbsoluteCoord;
    secondDest: AbsoluteCoord;
} | {
    type: "InfAfterStep";
    src: AbsoluteCoord;
    step: AbsoluteCoord;
    plannedDirection: AbsoluteCoord;
    stepping_ciurl: Ciurl;
    finalResult: Promise<{
        dest: AbsoluteCoord;
        water_entry_ciurl?: Ciurl;
    }>;
};

function isWaterAbs([row, col]: AbsoluteCoord): boolean {
    return (row === 4 && col === 2)
        || (row === 4 && col === 3)
        || (row === 4 && col === 4)
        || (row === 4 && col === 5)
        || (row === 4 && col === 6)
        || (row === 2 && col === 4)
        || (row === 3 && col === 4)
        || (row === 5 && col === 4)
        || (row === 6 && col === 4)
    ;
}

function isWater([row, col]: Coord): boolean {
    return (row === 4 && col === 2)
        || (row === 4 && col === 3)
        || (row === 4 && col === 4)
        || (row === 4 && col === 5)
        || (row === 4 && col === 6)
        || (row === 2 && col === 4)
        || (row === 3 && col === 4)
        || (row === 5 && col === 4)
        || (row === 6 && col === 4)
    ;
}

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
    await new Promise((resolve) => setTimeout(resolve, total_duration));
}

function add_ciurl_if_required(obj: OpponentMoveWithPotentialWaterEntry, dest: Coord, moving_piece_prof: Profession, src: Coord) {
    if (isWater(dest) && !isWater(src) && moving_piece_prof !== Profession.Nuak1) {
        obj.data.water_entry_ciurl =  [
            Math.random() < 0.5,
            Math.random() < 0.5,
            Math.random() < 0.5,
            Math.random() < 0.5,
            Math.random() < 0.5,
          ] as Ciurl;
    }
}

const getOneEmptyNeighborOf: (c: Coord) => Coord | null = (c: Coord) => {
    const empty_neighbors_of_c: Coord[] = eightNeighborhood(c).filter(([i, j]) => GAME_STATE.f.currentBoard[i][j] == null);
    if (empty_neighbors_of_c.length === 0) { return null; } // retry
    const empty_neighbor: Coord = empty_neighbors_of_c[empty_neighbors_of_c.length * Math.random() | 0];
    return empty_neighbor;
};

function get_one_valid_opponent_move(): OpponentMove {

    // There is always at least one piece, namely Tam2
    const get_one_opponent_piece: () => {rotated_piece: "Tam2" | NonTam2PieceUpward, rotated_coord: Coord} = () => {
        while (true) {
            const rand_i = (Math.random() * 9 | 0) as BoardIndex;
            const rand_j = (Math.random() * 9 | 0) as BoardIndex;
            const coord: Coord = [rand_i, rand_j];
            const piece: Piece | null =  GAME_STATE.f.currentBoard[rand_i][rand_j];

            if (piece === null) {
                continue;
            } else if (piece === "Tam2") {
                return {rotated_piece: piece, rotated_coord: rotateCoord(coord)};
            } else if (piece.side === Side.Downward) {
                const rot_piece: NonTam2PieceUpward = {prof: piece.prof, color: piece.color, side: Side.Upward};
                return {rotated_piece: rot_piece, rotated_coord: rotateCoord(coord)};
            } else {
                continue;
            }
        }
    };

    if (Math.random() < 0.03) {
        const len = GAME_STATE.f.hop1zuo1OfDownward.length;
        if (len === 0) { return get_one_valid_opponent_move(); } // retry

        const piece = GAME_STATE.f.hop1zuo1OfDownward[Math.random() * len | 0];

        const empty_square = (() => {while (true) {
            const rand_i = (Math.random() * 9 | 0) as BoardIndex;
            const rand_j = (Math.random() * 9 | 0) as BoardIndex;
            const coord: Coord = [rand_i, rand_j];
            if (GAME_STATE.f.currentBoard[rand_i][rand_j] == null) { return coord; }
        }})();

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

    const {rotated_piece, rotated_coord} = get_one_opponent_piece();
    const { finite: guideListYellow, infinite: guideListGreen } = calculateMovablePositions(
        rotated_coord,
        rotated_piece,
        rotateBoard(GAME_STATE.f.currentBoard),
        GAME_STATE.tam_itself_is_tam_hue,
    );

    const candidates: Coord[] = [...guideListYellow.map(rotateCoord), ...guideListGreen.map(rotateCoord)];

    if (candidates.length === 0) { return get_one_valid_opponent_move(); } // retry

    const src: Coord = rotateCoord(rotated_coord);

    for (let i = 0; i < 1000; i++) {
        const dest = candidates[Math.random() * candidates.length | 0];
        const destPiece = GAME_STATE.f.currentBoard[dest[0]][dest[1]];
        if (rotated_piece === "Tam2") {
            if (destPiece === null) { /* empty square; first move is completed without stepping */
                const fstdst: Coord = dest;

                const cands = eightNeighborhood(fstdst);
                const neighbor = cands[cands.length * Math.random() | 0];

                /* if the neighbor is empty, that is the second destination */
                if (GAME_STATE.f.currentBoard[neighbor[0]][neighbor[1]] == null /* the neighbor is utterly occupied */
                || coordEq(neighbor, src) /* the neighbor is occupied by yourself, which means it is actually empty */
                ) {
                    const snddst: Coord = neighbor;
                    return {
                        type: "TamMove",
                        stepStyle: "NoStep",
                        secondDest: toAbsoluteCoord(snddst),
                        firstDest: toAbsoluteCoord(fstdst),
                        src: toAbsoluteCoord(src),
                    };
                } else { /* if not, step from there */
                    const step: Coord = neighbor;
                    const snddst = getOneEmptyNeighborOf(step);
                    if (snddst == null) { return get_one_valid_opponent_move(); } // retry
                    return {
                        type: "TamMove",
                        stepStyle: "StepsDuringLatter",
                        firstDest: toAbsoluteCoord(fstdst),
                        secondDest: toAbsoluteCoord(snddst),
                        src: toAbsoluteCoord(src),
                        step: toAbsoluteCoord(step),
                    };
                }
            } else { /* not an empty square: must complete the first move */
                const step = dest;
                const fstdst = getOneEmptyNeighborOf(step);
                if (fstdst == null) { return get_one_valid_opponent_move(); } // retry

                const snddst = getOneEmptyNeighborOf(fstdst);
                if (snddst == null) { return get_one_valid_opponent_move(); } // retry
                return {
                    type: "TamMove",
                    stepStyle: "StepsDuringFormer",
                    firstDest: toAbsoluteCoord(fstdst),
                    secondDest: toAbsoluteCoord(snddst),
                    src: toAbsoluteCoord(src),
                    step: toAbsoluteCoord(step),
                };
            }
        } else if (destPiece === null) {
            // cannot step
            const obj: OpponentMoveWithPotentialWaterEntry = {
                type: "NonTamMove",
                data:  {
                    type: "SrcDst",
                    src: toAbsoluteCoord(src),
                    dest: toAbsoluteCoord(dest),
                },
            };
            add_ciurl_if_required(obj, dest, rotated_piece.prof, src);
            return obj;
        } else if (destPiece === "Tam2") {
            // for now, avoid stepping on Tam2;
            return get_one_valid_opponent_move(); // retry
        } else if (destPiece.side === Side.Upward && Math.random() < 0.1 /*0.7*/) {
            // opponent's piece; stepping and taking both attainable
            // take, with probability 0.7
            const obj: OpponentMoveWithPotentialWaterEntry = {
                type: "NonTamMove",
                data:  {
                    type: "SrcDst",
                    src: toAbsoluteCoord(src),
                    dest: toAbsoluteCoord(dest),
                },
            };
            add_ciurl_if_required(obj, dest, rotated_piece.prof, src);
            return obj;
        } else { // opponent (prob 30%); ally (prob 100%) --> step
            const step = dest; // less confusing

            const { finite: guideListYellow, infinite: guideListGreen } = calculateMovablePositions(
                rotateCoord(step),
                rotated_piece,
                rotateBoard(GAME_STATE.f.currentBoard),
                GAME_STATE.tam_itself_is_tam_hue,
            );

            const candidates: Coord[] = guideListYellow.map(rotateCoord);
            const candidates_inf: Coord[] = guideListGreen.map(rotateCoord);
            if (candidates.length === 0 && candidates_inf.length === 0) {
                return get_one_valid_opponent_move();
            } // retry

            for (let i = 0; i < 1000; i++) {
                if (Math.random() < candidates.length / (candidates.length + candidates_inf.length)) {
                    /* choosing from finite */
                    const finalDest = candidates[Math.random() * candidates.length | 0];
                    if (canGetOccupiedBy(Side.Downward, finalDest, {
                        color: rotated_piece.color,
                        prof: rotated_piece.prof,
                        side: Side.Downward,
                    }, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue)) {
                        const obj: OpponentMoveWithPotentialWaterEntry = {
                            type: "NonTamMove",
                            data: {
                                type: "SrcStepDstFinite",
                                src: toAbsoluteCoord(src),
                                step: toAbsoluteCoord(step),
                                dest: toAbsoluteCoord(finalDest),
                            },
                        };
                        add_ciurl_if_required(obj, finalDest, rotated_piece.prof, src);
                        return obj;
                    }
                } else {
                    const planned_dest = candidates_inf[Math.random() * candidates_inf.length | 0];
                    if (!canGetOccupiedBy(Side.Downward, planned_dest, {
                        color: rotated_piece.color,
                        prof: rotated_piece.prof,
                        side: Side.Downward,
                    }, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue)) {
                        return get_one_valid_opponent_move();
                        // retry
                    }

                    const stepping_ciurl: Ciurl = [
                        Math.random() < 0.5,
                        Math.random() < 0.5,
                        Math.random() < 0.5,
                        Math.random() < 0.5,
                        Math.random() < 0.5,
                      ] as Ciurl;
                    const obj: OpponentMove = {
                        type: "InfAfterStep",
                        src: toAbsoluteCoord(src),
                        step: toAbsoluteCoord(step),
                        plannedDirection: toAbsoluteCoord(planned_dest),
                        stepping_ciurl,
                        finalResult: new Promise((resolve, reject) => {
                            const filteredList = filterInOneDirectionTillCiurlLimit(
                                candidates_inf,
                                step,
                                planned_dest,
                                stepping_ciurl,
                            ).filter((dest) =>
                                canGetOccupiedBy(Side.Downward, dest, {
                                    color: rotated_piece.color,
                                    prof: rotated_piece.prof,
                                    side: Side.Downward,
                                }, GAME_STATE.f.currentBoard, GAME_STATE.tam_itself_is_tam_hue),
                            );

                            // can always cancel
                            const final_candidates = [...filteredList, ...filteredList, src];
                            console.log(final_candidates);
                            const final_destination = final_candidates[Math.random() * final_candidates.length | 0];
                            console.log(final_destination);

                            const obj: {dest: AbsoluteCoord, water_entry_ciurl?: Ciurl} = {
                                dest: toAbsoluteCoord(final_destination),
                            };

                            if (isWater(final_destination)
                            && !isWater(src)
                            && rotated_piece.prof !== Profession.Nuak1) {
                                obj.water_entry_ciurl = [
                                    Math.random() < 0.5,
                                    Math.random() < 0.5,
                                    Math.random() < 0.5,
                                    Math.random() < 0.5,
                                    Math.random() < 0.5,
                                  ] as Ciurl;
                            }

                            const sendInfPoll = async () => {
                                console.log("inf poll");
                                if (Math.random() < 0.2) {
                                    console.log("ding!");
                                    resolve(obj);
                                } else {
                                    await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
                                    await sendInfPoll();
                                }
                            };

                            (async () => {
                                await sendInfPoll();
                            })();
                        }),
                    };
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

async function animateOpponentSrcStepDstFinite(p: SrcStepDstFinite) {
    await animateOpponentSrcStepDstFinite_(
        fromAbsoluteCoord(p.src),
        fromAbsoluteCoord(p.step),
        fromAbsoluteCoord(p.dest),
        p.water_entry_ciurl,
    );
}

async function animateOpponentSteppingOverCiurl(
    step: Coord,
    plannedDirection: Coord,
    stepping_ciurl: Ciurl,
) {
    drawArrow(step, plannedDirection);
    await new Promise((resolve) => setTimeout(resolve, 2000 * 0.8093));
    displayCiurl(stepping_ciurl, Side.Downward);
    await new Promise((resolve) => setTimeout(resolve, 600 * 0.8093));
    eraseArrow();
}

async function animateOpponentInfAfterStep(p: {
    src: Coord,
    step: Coord,
    plannedDirection: Coord,
    stepping_ciurl: Ciurl,
    finalResult: Promise<{
        dest: AbsoluteCoord;
        water_entry_ciurl?: Ciurl;
    }>,
}) {
    const [src_i, src_j] = p.src;
    const [step_i, step_j] = p.step;

    const piece: Piece | null = GAME_STATE.f.currentBoard[src_i][src_j];
    if (piece === null) {
        throw new Error("src is unoccupied");
    }

    const stepPiece: Piece | null = GAME_STATE.f.currentBoard[step_i][step_j];

    if (stepPiece === null) {
        throw new Error("step is unoccupied");
    }

    const srcNode: HTMLElement = document.getElementById(`field_piece_${src_i}_${src_j}`)!;
    await animateNode(srcNode, 750 * 0.8093,
        coordToPieceXY_Shifted(p.step),
        coordToPieceXY(p.src),
    );

    await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));

    await animateOpponentSteppingOverCiurl(p.step, p.plannedDirection, p.stepping_ciurl);

    const result = await p.finalResult;
    const dest: Coord = fromAbsoluteCoord(result.dest);
    const [dest_i, dest_j] = dest;
    const destPiece: Piece | null = GAME_STATE.f.currentBoard[dest_i][dest_j];

    /* The whole scheme works even if the move was cancelled, since cancellation is exactly the same thing as choosing the original position as the final destination */

    /* it IS possible that you are returning to the original position, in which case you don't do anything */
    if (destPiece !== null && !coordEq(p.src, dest)) {
        const destNode: HTMLElement = document.getElementById(`field_piece_${dest_i}_${dest_j}`)!;
        await animateNode(srcNode, 750 * 0.8093,
            coordToPieceXY(dest),
            coordToPieceXY(p.src), /* must be src, since the node is not renewed */
        );

        await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));

        await animateNode(destNode, 750 * 0.8093,
            indToHo1Zuo1OfDownward(GAME_STATE.f.hop1zuo1OfDownward.length),
            coordToPieceXY([dest_i, dest_j]),
            "50", 180,
        );

        if (result.water_entry_ciurl) {
            await animateWaterEntryLogo();
            displayCiurl(result.water_entry_ciurl, Side.Downward);
            await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
            if (result.water_entry_ciurl.filter((a) => a).length < 3) {
                alert(DICTIONARY.ja.failedWaterEntry);
                drawField(GAME_STATE.f);
                return;
            }
        }

        if (!coordEq(p.src, dest)) { /* if same, the piece should not take itself */
            const flipped: NonTam2PieceDownward = downwardTakingUpward(destPiece);
            GAME_STATE.f.hop1zuo1OfDownward.push(flipped);
            GAME_STATE.f.currentBoard[src_i][src_j] = null;
            GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        }
        drawField(GAME_STATE.f);
    } else {
        await animateNode(srcNode, 750 * 0.8093,
            coordToPieceXY(dest),
            coordToPieceXY(p.src), /* must be src, since the node is not renewed */
        );

        if (result.water_entry_ciurl) {
            await animateWaterEntryLogo();
            displayCiurl(result.water_entry_ciurl, Side.Downward);
            await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
            if (result.water_entry_ciurl.filter((a) => a).length < 3) {
                alert(DICTIONARY.ja.failedWaterEntry);
                drawField(GAME_STATE.f);
                return;
            }
        }

        if (!coordEq(p.src, dest)) {
            GAME_STATE.f.currentBoard[src_i][src_j] = null;
            GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        }
        drawField(GAME_STATE.f);
    }
}

async function animateOpponentSrcStepDstFinite_(src: Coord, step: Coord, dest: Coord, water_entry_ciurl?: Ciurl) {
    const [src_i, src_j] = src;
    const [step_i, step_j] = step;
    const [dest_i, dest_j] = dest;

    const piece: Piece | null = GAME_STATE.f.currentBoard[src_i][src_j];
    if (piece === null) {
        throw new Error("src is unoccupied");
    }

    const stepPiece: Piece | null = GAME_STATE.f.currentBoard[step_i][step_j];

    if (stepPiece === null) {
        throw new Error("step is unoccupied");
    }

    const destPiece: Piece | null = GAME_STATE.f.currentBoard[dest_i][dest_j];

    /* it IS possible that you are returning to the original position, in which case you don't do anything */
    if (destPiece !== null && !coordEq(src, dest)) {
        const srcNode: HTMLElement = document.getElementById(`field_piece_${src_i}_${src_j}`)!;
        const destNode: HTMLElement = document.getElementById(`field_piece_${dest_i}_${dest_j}`)!;

        await animateNode(srcNode, 750 * 0.8093,
            coordToPieceXY_Shifted(step),
            coordToPieceXY(src),
        );

        await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));

        await animateNode(srcNode, 750 * 0.8093,
            coordToPieceXY(dest),
            coordToPieceXY(src), /* must be src, since the node is not renewed */
        );

        await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));

        await animateNode(destNode, 750 * 0.8093,
            indToHo1Zuo1OfDownward(GAME_STATE.f.hop1zuo1OfDownward.length),
            coordToPieceXY([dest_i, dest_j]),
            "50", 180,
        );

        if (water_entry_ciurl) {
            await animateWaterEntryLogo();
            displayCiurl(water_entry_ciurl, Side.Downward);
            await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
            if (water_entry_ciurl.filter((a) => a).length < 3) {
                alert(DICTIONARY.ja.failedWaterEntry);
                drawField(GAME_STATE.f);
                return;
            }
        }

        if (!coordEq(src, dest)) { /* if same, the piece should not take itself */
            const flipped: NonTam2PieceDownward = downwardTakingUpward(destPiece);
            GAME_STATE.f.hop1zuo1OfDownward.push(flipped);
            GAME_STATE.f.currentBoard[src_i][src_j] = null;
            GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        }
        drawField(GAME_STATE.f);
    } else {
        const imgNode: HTMLElement = document.getElementById(`field_piece_${src_i}_${src_j}`)!;
        await animateNode(imgNode, 750 * 0.8093,
            coordToPieceXY_Shifted(step),
            coordToPieceXY(src),
        );

        await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));

        await animateNode(imgNode, 750 * 0.8093,
            coordToPieceXY(dest),
            coordToPieceXY(src), /* must be src, since the node is not renewed */
        );

        if (water_entry_ciurl) {
            await animateWaterEntryLogo();
            displayCiurl(water_entry_ciurl, Side.Downward);
            await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
            if (water_entry_ciurl.filter((a) => a).length < 3) {
                alert(DICTIONARY.ja.failedWaterEntry);
                drawField(GAME_STATE.f);
                return;
            }
        }

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
            side: Side.Downward,
        };
        return flipped;
    } else {
        const _should_not_reach_here: never = upward.side;
        throw new Error("should not reach here");
    }
}

async function animateOpponentSrcDst(p: SrcDst) {
    const src: Coord = fromAbsoluteCoord(p.src);
    const dst: Coord = fromAbsoluteCoord(p.dest);
    if (p.water_entry_ciurl) {
        await animateOpponentSrcDst_(src, dst, p.water_entry_ciurl);
    } else {
        await animateOpponentSrcDst_(src, dst);
    }
}

async function animateOpponentSrcDst_(src: Coord, dst: Coord, water_entry_ciurl?: Ciurl) {
    const [src_i, src_j] = src;
    const [dest_i, dest_j] = dst;

    const piece: Piece | null = GAME_STATE.f.currentBoard[src_i][src_j];
    if (piece === null) {
        throw new Error("src is unoccupied");
    }

    const destPiece: Piece | null = GAME_STATE.f.currentBoard[dest_i][dest_j];

    /* it's NOT possible that you are returning to the original position, in which case you don't do anything */
    if (destPiece !== null) {
        const srcNode: HTMLElement = document.getElementById(`field_piece_${src_i}_${src_j}`)!;
        const destNode: HTMLElement = document.getElementById(`field_piece_${dest_i}_${dest_j}`)!;

        const total_duration = 750 * 0.8093;
        await animateNode(srcNode, total_duration,
            coordToPieceXY([dest_i, dest_j]),
            coordToPieceXY([src_i, src_j]),
        );

        await animateNode(destNode, total_duration,
            indToHo1Zuo1OfDownward(GAME_STATE.f.hop1zuo1OfDownward.length), /* not yet pushed into GAME_STATE.f.hop1zuo1OfDownward */
            coordToPieceXY([dest_i, dest_j]),
            "50", 180,
        );

        if (water_entry_ciurl) {
            await animateWaterEntryLogo();
            displayCiurl(water_entry_ciurl, Side.Downward);
            await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
            if (water_entry_ciurl.filter((a) => a).length < 3) {
                alert(DICTIONARY.ja.failedWaterEntry);
                drawField(GAME_STATE.f);
                return;
            }
        }

        const flipped: NonTam2PieceDownward = downwardTakingUpward(destPiece);
        GAME_STATE.f.hop1zuo1OfDownward.push(flipped);

        GAME_STATE.f.currentBoard[src_i][src_j] = null;
        GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        drawField(GAME_STATE.f);
    } else {
        const imgNode: HTMLElement = document.getElementById(`field_piece_${src_i}_${src_j}`)!;
        await animateNode(imgNode, 1500 * 0.8093,
            coordToPieceXY([dest_i, dest_j]),
            coordToPieceXY([src_i, src_j]),
        );

        if (water_entry_ciurl) {
            await animateWaterEntryLogo();
            displayCiurl(water_entry_ciurl, Side.Downward);
            await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
            if (water_entry_ciurl.filter((a) => a).length < 3) {
                alert(DICTIONARY.ja.failedWaterEntry);
                drawField(GAME_STATE.f);
                return;
            }
        }

        GAME_STATE.f.currentBoard[src_i][src_j] = null;
        GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
        drawField(GAME_STATE.f);
    }
}

async function animateOpponentFromHand(piece: NonTam2PieceDownward, dest: Coord) {
    // remove the corresponding one from hand
    const ind = GAME_STATE.f.hop1zuo1OfDownward.findIndex(
        (p) => p.color === piece.color && p.prof === piece.prof,
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

    const imgNode: HTMLElement = document.getElementById(`hop1zuo1OfDownward_${ind}`)!;
    await animateNode(imgNode, 1500 * 0.8093,
        coordToPieceXY([dest_i, dest_j]), /* hop1zuo1 and board does not agree on the absolute coordinates, but agrees on the displacement */
        indToHo1Zuo1OfDownward(ind),
    );

    GAME_STATE.f.currentBoard[dest_i][dest_j] = removed;
    drawField(GAME_STATE.f);
}

async function animateOpponentTamNoStep(src: Coord, fstdst: Coord, snddst: Coord) {
    const piece: Piece | null = GAME_STATE.f.currentBoard[src[0]][src[1]];
    if (piece === null) {
        throw new Error("src is unoccupied");
    }

    const imgNode: HTMLElement = document.getElementById(`field_piece_${src[0]}_${src[1]}`)!;
    await animateNode(imgNode, 1500 * 0.8093,
        coordToPieceXY(fstdst),
        coordToPieceXY(src),
    );
    GAME_STATE.f.currentBoard[src[0]][src[1]] = null;
    GAME_STATE.f.currentBoard[fstdst[0]][fstdst[1]] = piece;
    drawField(GAME_STATE.f);

    const imgNode2: HTMLElement = document.getElementById(`field_piece_${fstdst[0]}_${fstdst[1]}`)!;

    /* somehow does not work without this line */
    await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));

    await animateNode(imgNode2, 1500 * 0.8093,
        coordToPieceXY(snddst),
        coordToPieceXY(fstdst),
    );
    GAME_STATE.f.currentBoard[fstdst[0]][fstdst[1]] = null;
    GAME_STATE.f.currentBoard[snddst[0]][snddst[1]] = piece;
    drawField(GAME_STATE.f);
}

async function animateOpponentTamSteppingDuringFormer(p: {src: Coord, firstDest: Coord, secondDest: Coord, step: Coord}) {
    await animateOpponentSrcStepDstFinite_(p.src, p.step, p.firstDest);
    await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
    await animateOpponentSrcDst_(p.firstDest, p.secondDest);
}

async function animateOpponentTamSteppingDuringLatter(p: {src: Coord, firstDest: Coord, secondDest: Coord, step: Coord}) {
    await animateOpponentSrcDst_(p.src, p.firstDest);
    await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
    await animateOpponentSrcStepDstFinite_(p.firstDest, p.step, p.secondDest);
}

function eraseArrow() {
    removeChildren(document.getElementById("arrows")!);
}

function drawArrow(from: Coord, to: Coord) {
    if (from[1] === to[1] && from[0] > to[0]) { // up arrow
        document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_up_head", to));
        for (let i = to[0]; i <= from[0] - 1; i++) {
            document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_up_mid", [i, from[1]]));
        }
        document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_up_tail", [from[0] - 1, from[1]]));
    } else if (from[1] === to[1] && from[0] < to[0]) { // up arrow
        document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_down_tail", from));
        for (let i = from[0]; i <= to[0] - 1; i++) {
            document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_down_mid", [i, from[1]]));
        }
        document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_down_head", [to[0] - 1, to[1]]));
    } else if (from[0] === to[0] && from[1] > to[1]) { // left arrow
        document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_left_head", to));
        for (let i = to[1]; i <= from[1] - 1; i++) {
            document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_left_mid", [from[0], i]));
        }
        document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_left_tail", [from[0], from[1] - 1]));
    } else if (from[0] === to[0] && from[1] < to[1]) { // right arrow
        document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_right_tail", from));
        for (let i = from[1]; i <= to[1] - 1; i++) {
            document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_right_mid", [from[0], i]));
        }
        document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_right_head", [to[0], to[1] - 1]));
    } else if (from[0] > to[0] && from[1] < to[1] && (from[0] - to[0]) === (to[1] - from[1]) ) { // up right arrow
        document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_upright_head", [to[0], to[1] - 1]));
        for (let i = to[0]; i <= from[0] - 1; i++) {
            document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_upright_mid", [i, to[1] + to[0] - 1 - i]));
        }
        document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_upright_tail", [from[0] - 1, from[1]]));
    } else if (from[0] < to[0] && from[1] > to[1] && (from[0] - to[0]) === (to[1] - from[1]) ) { // down left arrow
        document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_downleft_tail", [from[0], from[1] - 1]));
        for (let i = from[0]; i <= to[0] - 1; i++) {
            document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_downleft_mid", [i, from[1] + from[0] - 1 - i]));
        }
        document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_downleft_head", [to[0] - 1, to[1]]));
    } else if (from[0] > to[0] && from[1] > to[1] && (from[0] - to[0]) === (from[1] - to[1]) ) { // up left arrow
        document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_upleft_head", to));
        for (let i = to[0]; i <= from[0] - 1; i++) {
            document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_upleft_mid", [i, to[1] - to[0] + i]));
        }
        document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_upleft_tail", [from[0] - 1, from[1] - 1]));
    } else if (from[0] < to[0] && from[1] < to[1] && (from[0] - to[0]) === (from[1] - to[1]) ) { // down right arrow
        document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_downright_tail", from));
        for (let i = from[0]; i <= to[0] - 1; i++) {
            document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_downright_mid", [i, from[1] - from[0] + i]));
        }
        document.getElementById("arrows")!.appendChild(createArrowPiece("arrow_downright_head", [to[0] - 1, to[1] - 1]));
    } else {
        throw new Error("unsupported direction for the arrow");
    }
}
