import {
  AbsoluteCoord,
  Profession,
  Color,
  SrcStepDstFinite,
  SrcDst,
  Ciurl,
  Ret_WhetherTyMokPoll,
} from "cerke_online_api";
import {
  Coord,
  Piece,
  NonTam2PieceDownward,
  Side,
  coordEq,
} from "cerke_online_utility/lib";
import { fromAbsoluteCoord, GAME_STATE } from "./game_state";
import {
  coordToPieceXY,
  coordToPieceXY_Shifted,
  indToHo1Zuo1OfDownward,
} from "./html_top_left";
import { createArrowPiece } from "./create_html_element";
import {
  animatePunishStepTamAndCheckPerzej,
  calculateHandsAndScore,
  sendStuffTo,
  endSeason,
  increaseRateAndAnimate,
  removeChildren,
} from "./main";
import {
  animateNode,
  animateStepTamLogo,
  animateWaterEntryLogo,
  drawCiurl, 
  drawField,
  eraseArrow
} from "./draw_erase_animate";
import { DICTIONARY } from "./dictionary";
import { drawScoreDisplay } from "./score_display";
import { KIAR_ARK } from "./kiar_ark";
import { toDigitsLinzklar } from "./to_digits";
import { Hand } from "cerke_hands_and_score";

interface OpponentMoveWithPotentialWaterEntry {
  type: "NonTamMove";
  data: SrcDst | SrcStepDstFinite;
}

type OpponentMove =
  | OpponentMoveWithPotentialWaterEntry
  | {
    type: "NonTamMove";
    data: {
      type: "FromHand";
      color: Color;
      prof: Profession;
      dest: AbsoluteCoord;
    };
  }
  | {
    type: "TamMove";
    stepStyle: "NoStep";
    src: AbsoluteCoord;
    firstDest: AbsoluteCoord;
    secondDest: AbsoluteCoord;
  }
  | {
    type: "TamMove";
    stepStyle: "StepsDuringFormer" | "StepsDuringLatter";
    src: AbsoluteCoord;
    step: AbsoluteCoord;
    firstDest: AbsoluteCoord;
    secondDest: AbsoluteCoord;
  }
  | {
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

export async function animateOpponentSrcStepDstFinite(p: SrcStepDstFinite): Promise<CaptureInfo> {
  return await animateOpponentSrcStepDstFinite_(
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
  await new Promise(resolve => setTimeout(resolve, 2000 * 0.8093));
  drawCiurl(stepping_ciurl, Side.Downward);
  await new Promise(resolve => setTimeout(resolve, 600 * 0.8093));
  eraseArrow();
}

export async function animateOpponentInfAfterStep(p: {
  src: Coord;
  step: Coord;
  plannedDirection: Coord;
  stepping_ciurl: Ciurl;
  finalResult: Promise<{
    dest: AbsoluteCoord;
    water_entry_ciurl?: Ciurl;
    thwarted_by_failing_water_entry_ciurl: Ciurl | null;
  }>;
}): Promise<[{
  dest: AbsoluteCoord;
  water_entry_ciurl?: Ciurl;
  thwarted_by_failing_water_entry_ciurl: Ciurl | null;
}, CaptureInfo]> {
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

  if (stepPiece === "Tam2") {
    await animateStepTamLogo();
    await animatePunishStepTamAndCheckPerzej(Side.Downward);
  }

  const srcNode: HTMLElement = document.getElementById(
    `field_piece_${src_i}_${src_j}`,
  )!;
  await animateNode(
    srcNode,
    750 * 0.8093,
    coordToPieceXY_Shifted(p.step),
    coordToPieceXY(p.src),
  );

  await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));

  await animateOpponentSteppingOverCiurl(
    p.step,
    p.plannedDirection,
    p.stepping_ciurl,
  );

  const result = await p.finalResult;
  const dest: Coord = fromAbsoluteCoord(result.dest);
  const [dest_i, dest_j] = dest;
  const destPiece: Piece | null = GAME_STATE.f.currentBoard[dest_i][dest_j];

  /* The whole scheme works even if the move was cancelled, since cancellation is exactly the same thing as choosing the original position as the final destination */

  /* it IS possible that you are returning to the original position, in which case you don't do anything */
  if (destPiece !== null && !coordEq(p.src, dest)) {
    // this is when the capture happens
    const destNode: HTMLElement = document.getElementById(
      `field_piece_${dest_i}_${dest_j}`,
    )!;
    await animateNode(
      srcNode,
      750 * 0.8093,
      coordToPieceXY(dest),
      coordToPieceXY(p.src) /* must be src, since the node is not renewed */,
    );

    await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));

    await animateNode(
      destNode,
      750 * 0.8093,
      indToHo1Zuo1OfDownward(GAME_STATE.f.hop1zuo1OfDownward.length),
      coordToPieceXY([dest_i, dest_j]),
      "50",
      180,
    );

    if (result.water_entry_ciurl) {
      await animateWaterEntryLogo();
      drawCiurl(result.water_entry_ciurl, Side.Downward);
      await new Promise(resolve => setTimeout(resolve, 500 * 0.8093));
      if (result.water_entry_ciurl.filter(a => a).length < 3) {
        alert(DICTIONARY.ja.failedWaterEntry);

        console.log("drawField opponent #", 12);
        GAME_STATE.last_move_focus = [src_i, src_j];
        drawField({ focus: [src_i, src_j] });

        // no piece capture is possible if water entry has failed
        return [result, null];
      }
    }

    if (!coordEq(p.src, dest)) {
      /* if same, the piece should not take itself */
      takeTheUpwardPieceAndCheckHand(destPiece);
      GAME_STATE.f.currentBoard[src_i][src_j] = null;
      GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
    }

    console.log("drawField opponent #", 13);
    GAME_STATE.last_move_focus = [dest_i, dest_j];
    drawField({ focus: [dest_i, dest_j] });
    return [result, toColorProf(destPiece)];
  } else {
    // no piece capture; in this branch, either self-occlusion is happening or else destPiece is null.
    await animateNode(
      srcNode,
      750 * 0.8093,
      coordToPieceXY(dest),
      coordToPieceXY(p.src) /* must be src, since the node is not renewed */,
    );

    if (result.water_entry_ciurl) {
      await animateWaterEntryLogo();
      drawCiurl(result.water_entry_ciurl, Side.Downward);
      await new Promise(resolve => setTimeout(resolve, 500 * 0.8093));
      if (result.water_entry_ciurl.filter(a => a).length < 3) {
        alert(DICTIONARY.ja.failedWaterEntry);
        console.log("drawField opponent #", 14);
        GAME_STATE.last_move_focus = [src_i, src_j];
        drawField({ focus: [src_i, src_j] });
        return [result, null]; // no piece capture; in this branch, either self-occlusion is happening or else destPiece is null.
      }
    } else if (result.thwarted_by_failing_water_entry_ciurl) {
      await animateWaterEntryLogo();
      drawCiurl(result.thwarted_by_failing_water_entry_ciurl, Side.Downward);
      await new Promise(resolve => setTimeout(resolve, 500 * 0.8093));
      alert(DICTIONARY.ja.failedWaterEntry);
      console.log("drawField opponent #", 14);
      GAME_STATE.last_move_focus = [src_i, src_j];
      drawField({ focus: [src_i, src_j] });
      return [result, null]; // no piece capture; in this branch, either self-occlusion is happening or else destPiece is null.
    }

    if (!coordEq(p.src, dest)) {
      GAME_STATE.f.currentBoard[src_i][src_j] = null;
      GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
    }
    console.log("drawField opponent #", 15);
    GAME_STATE.last_move_focus = [dest_i, dest_j];
    drawField({ focus: [dest_i, dest_j] });
    return [result, null]; // no piece capture; in this branch, either self-occlusion is happening or else destPiece is null.
  }
}

/**
 * Unsafe function.
 * @param destPiece Assumed to be upward; if not, an error is thrown
 */
function takeTheUpwardPieceAndCheckHand(destPiece: Piece) {
  const flipped: NonTam2PieceDownward = (() => {
    if (destPiece === "Tam2") {
      throw new Error("tried to convert Tam2 into downward");
    } else if (destPiece.side === Side.Downward) {
      throw new Error("tried to convert an already downward piece to downward");
    } else if (destPiece.side === Side.Upward) {
      const flipped: NonTam2PieceDownward = {
        color: destPiece.color,
        prof: destPiece.prof,
        side: Side.Downward,
      };
      return flipped;
    } else {
      const _should_not_reach_here: never = destPiece.side;
      throw new Error("should not reach here");
    }
  })();

  const old_state = calculateHandsAndScore(GAME_STATE.f.hop1zuo1OfDownward);
  GAME_STATE.f.hop1zuo1OfDownward.push(flipped);
  const new_state = calculateHandsAndScore(GAME_STATE.f.hop1zuo1OfDownward);

  if (new_state.score === old_state.score) {
    return;
  }

  // this will quite quickly be gone due to the setter of is_my_turn
  document
    .getElementById("protective_cover_over_field_while_waiting_for_opponent")!
    .classList.remove("nocover");

  // hence add another transparent film
  document
    .getElementById("protective_cover_over_field_while_asyncawait")!
    .classList.remove("nocover");

  window.setTimeout(async () => {
    await sendTyMok1OrTaXot1Poll(new_state);
  }, 0);

  window.setTimeout(() => {
    drawScoreDisplay(new_state.hands);
  }, 1000 * 0.8093);
}

async function sendTyMok1OrTaXot1Poll(o: { hands: Hand[], score: number }) {
  const base_score: number = o.score;
  console.log("poll whether ty mok1 or ta xot1");

  const res: Ret_WhetherTyMokPoll = await sendStuffTo<
    {},
    | {
      legal: true;
      content:
      | "ty mok1"
      | { is_first_move_my_move: boolean | null }
      | "not yet";
    }
    | { legal: false; whyIllegal: string }
  >(
    "whethertymokpoll",
    "`polling for whether the declaration is ty mok1 or ta xot1`",
    {},
    response => {
      console.log("Success; the server returned:", JSON.stringify(response));
      return response;
    },
  );

  if (!res.legal) {
    alert(
      `sending TyMok1OrTaXot1Poll somehow resulted in an error: ${res.whyIllegal}`,
    );
    throw new Error(
      `sending TyMok1OrTaXot1Poll somehow resulted in an error: ${res.whyIllegal}`,
    );
  }

  if (res.content !== "not yet") {
    console.log("ding!");

    const score_display = document.getElementById("score_display")!;

    await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));

    // so that the ty mok1 / ta xot1 image is written after the score is written
    // this is necessary because the scorewriting deletes scoredisplay.innerHTML
    while (!score_display.hasChildNodes()) {
      await new Promise(resolve => setTimeout(resolve, 100 * 0.8093));
    }

    if (res.content === "ty mok1") {
      score_display.innerHTML += `<img src="image/dat2/再行.png" style="position: absolute; left: 660px; top: 125px; " height="200">`;
      console.log("score_display:", score_display.innerHTML);
      await new Promise(resolve => setTimeout(resolve, 5000 * 0.8093));
      console.log("go on with ty mok1");
      increaseRateAndAnimate(false);
      KIAR_ARK.body = [...KIAR_ARK.body, { type: "tymoktaxot", dat: `或為${o.hands.join("加")}\n再行` }]
    } else {
      score_display.innerHTML += `<img src="image/dat2/終季.png" style="position: absolute; left: 660px; top: 125px; " height="200">`;
      console.log("score_display:", score_display.innerHTML);
      await new Promise(resolve => setTimeout(resolve, 5000 * 0.8093));
      console.log("go on with ta xot1");
      const season_that_has_just_ended = ["春", "夏", "秋", "冬"][GAME_STATE.season]; // GAME_STATE.season gets updated on the following call of `endSeason`, so we must store the previous value
      endSeason(-base_score, res.content.is_first_move_my_move); // since opponent, negative score
      KIAR_ARK.body = [...KIAR_ARK.body, { type: "tymoktaxot", dat: `或為${o.hands.join("加")}而手${toDigitsLinzklar(base_score * Math.pow(2, GAME_STATE.log2_rate)).join("")}\n終季\t${season_that_has_just_ended}終` }]
    }
  } else {
    document
      .getElementById("protective_cover_over_field_while_waiting_for_opponent")!
      .classList.remove("nocover");
    await new Promise(resolve => setTimeout(resolve, 500 * 0.8093));
    await sendTyMok1OrTaXot1Poll(o);
  }
}

async function animateOpponentSrcStepDstFinite_(
  src: Coord,
  step: Coord,
  dest: Coord,
  water_entry_ciurl?: Ciurl,
): Promise<CaptureInfo> {
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

  if (stepPiece === "Tam2") {
    await animateStepTamLogo();
    await animatePunishStepTamAndCheckPerzej(Side.Downward);
  }

  const destPiece: Piece | null = GAME_STATE.f.currentBoard[dest_i][dest_j];

  /* it IS possible that you are returning to the original position, in which case you don't do anything */
  if (destPiece !== null && !coordEq(src, dest)) {
    const srcNode: HTMLElement = document.getElementById(
      `field_piece_${src_i}_${src_j}`,
    )!;
    const destNode: HTMLElement = document.getElementById(
      `field_piece_${dest_i}_${dest_j}`,
    )!;

    await animateNode(
      srcNode,
      750 * 0.8093,
      coordToPieceXY_Shifted(step),
      coordToPieceXY(src),
    );

    await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));

    await animateNode(
      srcNode,
      750 * 0.8093,
      coordToPieceXY(dest),
      coordToPieceXY(src) /* must be src, since the node is not renewed */,
    );

    await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));

    await animateNode(
      destNode,
      750 * 0.8093,
      indToHo1Zuo1OfDownward(GAME_STATE.f.hop1zuo1OfDownward.length),
      coordToPieceXY([dest_i, dest_j]),
      "50",
      180,
    );

    if (water_entry_ciurl) {
      await animateWaterEntryLogo();
      drawCiurl(water_entry_ciurl, Side.Downward);
      await new Promise(resolve => setTimeout(resolve, 500 * 0.8093));
      if (water_entry_ciurl.filter(a => a).length < 3) {
        alert(DICTIONARY.ja.failedWaterEntry);
        console.log("drawField opponent #", 16);
        GAME_STATE.last_move_focus = [src_i, src_j];
        drawField({ focus: [src_i, src_j] });

        // no piece capture is possible if water entry failed
        return null;
      }
    }

    if (!coordEq(src, dest)) {
      /* if same, the piece should not take itself */
      takeTheUpwardPieceAndCheckHand(destPiece);
      GAME_STATE.f.currentBoard[src_i][src_j] = null;
      GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
    }
    console.log("drawField opponent #", 17);
    GAME_STATE.last_move_focus = [dest_i, dest_j];
    drawField({ focus: [dest_i, dest_j] });
  } else {
    const imgNode: HTMLElement = document.getElementById(
      `field_piece_${src_i}_${src_j}`,
    )!;
    await animateNode(
      imgNode,
      750 * 0.8093,
      coordToPieceXY_Shifted(step),
      coordToPieceXY(src),
    );

    await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));

    await animateNode(
      imgNode,
      750 * 0.8093,
      coordToPieceXY(dest),
      coordToPieceXY(src) /* must be src, since the node is not renewed */,
    );

    if (water_entry_ciurl) {
      await animateWaterEntryLogo();
      drawCiurl(water_entry_ciurl, Side.Downward);
      await new Promise(resolve => setTimeout(resolve, 500 * 0.8093));
      if (water_entry_ciurl.filter(a => a).length < 3) {
        alert(DICTIONARY.ja.failedWaterEntry);

        console.log("drawField opponent #", 18);
        GAME_STATE.last_move_focus = [src_i, src_j];
        drawField({ focus: [src_i, src_j] });
        // no piece capture is possible if water entry failed
        return null;
      }
    }

    if (!coordEq(src, dest)) {
      GAME_STATE.f.currentBoard[src_i][src_j] = null;
      GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
    }

    console.log("drawField opponent #", 19);
    GAME_STATE.last_move_focus = [dest_i, dest_j];
    drawField({ focus: [dest_i, dest_j] });
  }
  return toColorProf(destPiece);
}

export type CaptureInfo = [Color, Profession] | null;

export async function animateOpponentSrcDst(p: SrcDst): Promise<CaptureInfo> {
  const src: Coord = fromAbsoluteCoord(p.src);
  const dst: Coord = fromAbsoluteCoord(p.dest);
  if (p.water_entry_ciurl) {
    return await animateOpponentSrcDst_(src, dst, { water_entry_ciurl: p.water_entry_ciurl });
  } else {
    return await animateOpponentSrcDst_(src, dst, {});
  }
}

export function toColorProf(p: Piece | null): CaptureInfo {
  if (p === "Tam2") { throw new Error("Tam2 was passed") }
  if (p === null) { return null; }
  return [p.color, p.prof]
}

/**
 * Animates opponent's move that simply consists of a src and a destination.
 * @returns the color and the profession of the captured piece to help with KIAR_ARK.
 */
async function animateOpponentSrcDst_(
  src: Coord,
  dst: Coord,
  o: { water_entry_ciurl?: Ciurl, disable_focus?: boolean }
): Promise<CaptureInfo> {
  const [src_i, src_j] = src;
  const [dest_i, dest_j] = dst;

  const piece: Piece | null = GAME_STATE.f.currentBoard[src_i][src_j];
  if (piece === null) {
    throw new Error("src is unoccupied");
  }

  const destPiece: Piece | null = GAME_STATE.f.currentBoard[dest_i][dest_j];

  /* it's NOT possible that you are returning to the original position, in which case you would have not do anything */
  if (destPiece !== null) {
    const srcNode: HTMLElement = document.getElementById(
      `field_piece_${src_i}_${src_j}`,
    )!;
    const destNode: HTMLElement = document.getElementById(
      `field_piece_${dest_i}_${dest_j}`,
    )!;

    const total_duration = 750 * 0.8093;
    await animateNode(
      srcNode,
      total_duration,
      coordToPieceXY([dest_i, dest_j]),
      coordToPieceXY([src_i, src_j]),
    );

    await animateNode(
      destNode,
      total_duration,
      indToHo1Zuo1OfDownward(
        GAME_STATE.f.hop1zuo1OfDownward.length,
      ) /* not yet pushed into GAME_STATE.f.hop1zuo1OfDownward */,
      coordToPieceXY([dest_i, dest_j]),
      "50",
      180,
    );

    if (o.water_entry_ciurl) {
      await animateWaterEntryLogo();
      drawCiurl(o.water_entry_ciurl, Side.Downward);
      await new Promise(resolve => setTimeout(resolve, 500 * 0.8093));
      if (o.water_entry_ciurl.filter(a => a).length < 3) {
        alert(DICTIONARY.ja.failedWaterEntry);

        console.log("drawField opponent #", 20);
        GAME_STATE.last_move_focus = [src_i, src_j];
        drawField({ focus: [src_i, src_j] });
        // it FAILED, so no piece was captured
        return null;
      }
    }

    takeTheUpwardPieceAndCheckHand(destPiece);
    GAME_STATE.f.currentBoard[src_i][src_j] = null;
    GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;

    console.log("drawField opponent #", 21);
    GAME_STATE.last_move_focus = [dest_i, dest_j];
    drawField({ focus: [dest_i, dest_j] });
  } else {
    const imgNode: HTMLElement = document.getElementById(
      `field_piece_${src_i}_${src_j}`,
    )!;
    await animateNode(
      imgNode,
      1500 * 0.8093,
      coordToPieceXY([dest_i, dest_j]),
      coordToPieceXY([src_i, src_j]),
    );

    if (o.water_entry_ciurl) {
      await animateWaterEntryLogo();
      drawCiurl(o.water_entry_ciurl, Side.Downward);
      await new Promise(resolve => setTimeout(resolve, 500 * 0.8093));
      if (o.water_entry_ciurl.filter(a => a).length < 3) {
        alert(DICTIONARY.ja.failedWaterEntry);

        console.log("drawField opponent #", 22);
        GAME_STATE.last_move_focus = [src_i, src_j];
        drawField({ focus: [src_i, src_j] });
        // it FAILED, so no piece was captured
        return null;
      }
    }

    GAME_STATE.f.currentBoard[src_i][src_j] = null;
    GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;

    if (!o.disable_focus) {
      console.log("drawField opponent #", 23);
      GAME_STATE.last_move_focus = [dest_i, dest_j];
      drawField({ focus: [dest_i, dest_j] });
    } else {
      /* This branch should be taken, for example, 
         while depicting the former half of the animation of Tam2's movement */
      drawField({ focus: null });
    }

  }
  return toColorProf(destPiece);
}

export async function animateOpponentFromHand(
  piece: NonTam2PieceDownward,
  dest: Coord,
) {
  // remove the corresponding one from hand
  const ind = GAME_STATE.f.hop1zuo1OfDownward.findIndex(
    p => p.color === piece.color && p.prof === piece.prof,
  );
  if (ind === -1) {
    throw new Error("What should exist in the hand does not exist");
  }
  const [removed_from_hop1zuo1] = GAME_STATE.f.hop1zuo1OfDownward.splice(ind, 1);

  // add the removed piece to the destination
  const [dest_i, dest_j] = dest;
  if (GAME_STATE.f.currentBoard[dest_i][dest_j] !== null) {
    throw new Error("Trying to parachute the piece onto an occupied space");
  }

  const imgNode: HTMLElement = document.getElementById(
    `hop1zuo1OfDownward_${ind}`,
  )!;
  await animateNode(
    imgNode,
    1500 * 0.8093,
    coordToPieceXY([
      dest_i,
      dest_j,
    ]) /* hop1zuo1 and board does not agree on the absolute coordinates, but agrees on the displacement */,
    indToHo1Zuo1OfDownward(ind),
  );

  GAME_STATE.f.currentBoard[dest_i][dest_j] = removed_from_hop1zuo1;

  console.log("drawField opponent #", 24);
  GAME_STATE.last_move_focus = [dest_i, dest_j];
  drawField({ focus: [dest_i, dest_j] });
}

export async function animateOpponentTamNoStep(
  src: Coord,
  fstdst: Coord,
  snddst: Coord,
) {
  const piece: Piece | null = GAME_STATE.f.currentBoard[src[0]][src[1]];
  if (piece === null) {
    throw new Error("src is unoccupied");
  }

  const imgNode: HTMLElement = document.getElementById(
    `field_piece_${src[0]}_${src[1]}`,
  )!;
  await animateNode(
    imgNode,
    1500 * 0.8093,
    coordToPieceXY(fstdst),
    coordToPieceXY(src),
  );
  GAME_STATE.f.currentBoard[src[0]][src[1]] = null;
  GAME_STATE.f.currentBoard[fstdst[0]][fstdst[1]] = piece;

  console.log("drawField opponent #", 25);
  drawField({ focus: null }); /* Temporary animation. Hence no focus. */

  const imgNode2: HTMLElement = document.getElementById(
    `field_piece_${fstdst[0]}_${fstdst[1]}`,
  )!;

  /* somehow does not work without this line */
  await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));

  await animateNode(
    imgNode2,
    1500 * 0.8093,
    coordToPieceXY(snddst),
    coordToPieceXY(fstdst),
  );
  GAME_STATE.f.currentBoard[fstdst[0]][fstdst[1]] = null;
  GAME_STATE.f.currentBoard[snddst[0]][snddst[1]] = piece;

  console.log("drawField opponent #", 26);
  GAME_STATE.last_move_focus = [snddst[0], snddst[1]];
  drawField({ focus: [snddst[0], snddst[1]] });
}

export async function animateOpponentTamSteppingDuringFormer(p: {
  src: Coord;
  firstDest: Coord;
  secondDest: Coord;
  step: Coord;
}) {
  await animateOpponentSrcStepDstFinite_(p.src, p.step, p.firstDest);
  await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));
  await animateOpponentSrcDst_(p.firstDest, p.secondDest, {});
}

export async function animateOpponentTamSteppingDuringLatter(p: {
  src: Coord;
  firstDest: Coord;
  secondDest: Coord;
  step: Coord;
}) {
  /* This is the former half; hence no need to show the focus */
  await animateOpponentSrcDst_(p.src, p.firstDest, { disable_focus: true });
  await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));
  await animateOpponentSrcStepDstFinite_(p.firstDest, p.step, p.secondDest);
}

function drawArrow(from: Coord, to: Coord) {
  if (from[1] === to[1] && from[0] > to[0]) {
    // up arrow
    document
      .getElementById("arrows")!
      .appendChild(createArrowPiece("arrow/arrow_up_head", to));
    for (let i = to[0]; i <= from[0] - 1; i++) {
      document
        .getElementById("arrows")!
        .appendChild(createArrowPiece("arrow/arrow_up_mid", [i, from[1]]));
    }
    document
      .getElementById("arrows")!
      .appendChild(
        createArrowPiece("arrow/arrow_up_tail", [from[0] - 1, from[1]]),
      );
  } else if (from[1] === to[1] && from[0] < to[0]) {
    // up arrow
    document
      .getElementById("arrows")!
      .appendChild(createArrowPiece("arrow/arrow_down_tail", from));
    for (let i = from[0]; i <= to[0] - 1; i++) {
      document
        .getElementById("arrows")!
        .appendChild(createArrowPiece("arrow/arrow_down_mid", [i, from[1]]));
    }
    document
      .getElementById("arrows")!
      .appendChild(
        createArrowPiece("arrow/arrow_down_head", [to[0] - 1, to[1]]),
      );
  } else if (from[0] === to[0] && from[1] > to[1]) {
    // left arrow
    document
      .getElementById("arrows")!
      .appendChild(createArrowPiece("arrow/arrow_left_head", to));
    for (let i = to[1]; i <= from[1] - 1; i++) {
      document
        .getElementById("arrows")!
        .appendChild(createArrowPiece("arrow/arrow_left_mid", [from[0], i]));
    }
    document
      .getElementById("arrows")!
      .appendChild(
        createArrowPiece("arrow/arrow_left_tail", [from[0], from[1] - 1]),
      );
  } else if (from[0] === to[0] && from[1] < to[1]) {
    // right arrow
    document
      .getElementById("arrows")!
      .appendChild(createArrowPiece("arrow/arrow_right_tail", from));
    for (let i = from[1]; i <= to[1] - 1; i++) {
      document
        .getElementById("arrows")!
        .appendChild(createArrowPiece("arrow/arrow_right_mid", [from[0], i]));
    }
    document
      .getElementById("arrows")!
      .appendChild(
        createArrowPiece("arrow/arrow_right_head", [to[0], to[1] - 1]),
      );
  } else if (
    from[0] > to[0] &&
    from[1] < to[1] &&
    from[0] - to[0] === to[1] - from[1]
  ) {
    // up right arrow
    document
      .getElementById("arrows")!
      .appendChild(
        createArrowPiece("arrow/arrow_upright_head", [to[0], to[1] - 1]),
      );
    for (let i = to[0]; i <= from[0] - 1; i++) {
      document
        .getElementById("arrows")!
        .appendChild(
          createArrowPiece("arrow/arrow_upright_mid", [
            i,
            to[1] + to[0] - 1 - i,
          ]),
        );
    }
    document
      .getElementById("arrows")!
      .appendChild(
        createArrowPiece("arrow/arrow_upright_tail", [from[0] - 1, from[1]]),
      );
  } else if (
    from[0] < to[0] &&
    from[1] > to[1] &&
    from[0] - to[0] === to[1] - from[1]
  ) {
    // down left arrow
    document
      .getElementById("arrows")!
      .appendChild(
        createArrowPiece("arrow/arrow_downleft_tail", [from[0], from[1] - 1]),
      );
    for (let i = from[0]; i <= to[0] - 1; i++) {
      document
        .getElementById("arrows")!
        .appendChild(
          createArrowPiece("arrow/arrow_downleft_mid", [
            i,
            from[1] + from[0] - 1 - i,
          ]),
        );
    }
    document
      .getElementById("arrows")!
      .appendChild(
        createArrowPiece("arrow/arrow_downleft_head", [to[0] - 1, to[1]]),
      );
  } else if (
    from[0] > to[0] &&
    from[1] > to[1] &&
    from[0] - to[0] === from[1] - to[1]
  ) {
    // up left arrow
    document
      .getElementById("arrows")!
      .appendChild(createArrowPiece("arrow/arrow_upleft_head", to));
    for (let i = to[0]; i <= from[0] - 1; i++) {
      document
        .getElementById("arrows")!
        .appendChild(
          createArrowPiece("arrow/arrow_upleft_mid", [i, to[1] - to[0] + i]),
        );
    }
    document
      .getElementById("arrows")!
      .appendChild(
        createArrowPiece("arrow/arrow_upleft_tail", [from[0] - 1, from[1] - 1]),
      );
  } else if (
    from[0] < to[0] &&
    from[1] < to[1] &&
    from[0] - to[0] === from[1] - to[1]
  ) {
    // down right arrow
    document
      .getElementById("arrows")!
      .appendChild(createArrowPiece("arrow/arrow_downright_tail", from));
    for (let i = from[0]; i <= to[0] - 1; i++) {
      document
        .getElementById("arrows")!
        .appendChild(
          createArrowPiece("arrow/arrow_downright_mid", [
            i,
            from[1] - from[0] + i,
          ]),
        );
    }
    document
      .getElementById("arrows")!
      .appendChild(
        createArrowPiece("arrow/arrow_downright_head", [to[0] - 1, to[1] - 1]),
      );
  } else {
    throw new Error("unsupported direction for the arrow");
  }
}

