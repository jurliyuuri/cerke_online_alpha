import {
  AbsoluteCoord,
  SrcStepDstFinite,
  SrcDst,
  Ciurl,
  RetWhetherTyMokPoll,
  RetInfPoll,
  RetMainPoll,
  TacticsKey,
  MoveToBePolled,
} from "cerke_online_api";
import {
  Coord,
  Piece,
  NonTam2PieceDownward,
  Side,
  coordEq,
} from "cerke_online_utility";
import { fromAbsoluteCoord, GAME_STATE } from "./game_state";
import {
  BOX_SIZE,
  coordToPieceXY,
  coordToPieceXY_Shifted,
  hop1_zuo1_left_position,
  MAX_PIECE_SIZE,
  PIECE_SIZE,
} from "./html_top_left";
import {
  animatePunishStepTamAndCheckPerzej,
  calculateHandsAndScore,
  sendStuffTo,
  endSeason,
  increaseRateAndAnimate,
  drawField,
} from "./both_sides";
import {
  animateNode,
  animateStepTamLogo,
  animateWaterEntryLogo,
  drawArrow,
  eraseArrow,
} from "./draw_erase_animate";
import { DICTIONARY, TACTICS_LINZKLAR } from "./dictionary";
import { drawScoreDisplay } from "./score_display";
import * as KiarArk from "./kiar_ark";
import { toDigitsLinzklar } from "./to_digits";
import { Hand } from "cerke_hands_and_score";
import { KRUT_CRUOP } from "./main_entry";
import {
  normalMessageToKiarArk,
  serializeAbsoluteCoord,
  serializeCiurl,
  serializeProf,
} from "./serialize";
import {
  MovementInfo,
  toColorProf,
  toPieceCaptureComment,
} from "./capture_info";
import { drawCiurlWithAudio } from "./main";

/*
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
*/

const { forbidMainPolling, isMainPollingAllowed, allowMainPolling } = (() => {
  let MAIN_POLLING_ALLOWED = true;

  // to be called when a new hand is completed and is waiting for the ty mok1 / ta xot1 decision.
  const forbidMainPolling = () => {
    MAIN_POLLING_ALLOWED = false;
  };

  const allowMainPolling = () => {
    MAIN_POLLING_ALLOWED = true;
  };

  const isMainPollingAllowed = () => {
    return MAIN_POLLING_ALLOWED;
  };
  return {
    forbidMainPolling,
    isMainPollingAllowed,
    allowMainPolling,
  };
})();
// I repentfully use a global

//////////////////////////////////////////////////////////
/// ONLY THESE THREE ARE TO BE EXPORTED FROM THIS FILE ///
//////////////////////////////////////////////////////////
export { forbidMainPolling, allowMainPolling };
export async function sendMainPollAndDoEverythingThatFollows() {
  console.log("poll");
  if (!isMainPollingAllowed()) {
    return;
  }

  const res: RetMainPoll_Legal = await sendMainPoll();
  if (res.type === "NotYetDetermined") {
    await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
    await sendMainPollAndDoEverythingThatFollows();
    return;
  }

  console.log("ding!");
  document.getElementById("opponent_message")!.textContent =
    res.message != null ? DICTIONARY.ja.tactics[res.message] : "";
  document.getElementById("opponent_message_linzklar")!.textContent =
    res.message != null ? TACTICS_LINZKLAR[res.message] : "";
  if (KRUT_CRUOP) {
    const thud_sound = new Audio("sound/thud.ogg");
    thud_sound.play();
  }

  const opponent_move = res.content;
  console.log(opponent_move);
  if (opponent_move.type === "NonTamMove") {
    GAME_STATE.opponent_has_just_moved_tam = false;
    if (opponent_move.data.type === "SrcDst") {
      const movement_info = await animateOpponentSrcDst(opponent_move.data);
      const piece_moved = movement_info.piece_moved; // USE ME
      GAME_STATE.is_my_turn = true;
      if (opponent_move.data.water_entry_ciurl) {
        KiarArk.push_body_elem_and_display({
          type: "movement",
          dat: normalMessageToKiarArk(opponent_move, {
            piece_moved,
            water_ciurl_count: opponent_move.data.water_entry_ciurl.filter(
              (a) => a,
            ).length,
          }),
          piece_capture_comment: toPieceCaptureComment(
            movement_info.maybe_capture,
          ),
        });
      } else {
        KiarArk.push_body_elem_and_display({
          type: "movement",
          dat: normalMessageToKiarArk(opponent_move, { piece_moved }),
          piece_capture_comment: toPieceCaptureComment(
            movement_info.maybe_capture,
          ),
        });
      }
    } else if (opponent_move.data.type === "FromHand") {
      const piece: NonTam2PieceDownward = {
        prof: opponent_move.data.prof,
        color: opponent_move.data.color,
        side: Side.Downward,
      };
      await animateOpponentFromHand(
        piece,
        fromAbsoluteCoord(opponent_move.data.dest),
      );
      GAME_STATE.is_my_turn = true;
      // piece_capture_comment is impossible
      KiarArk.push_body_elem_and_display({
        type: "movement",
        dat: normalMessageToKiarArk(opponent_move, { piece_moved: piece }),
      });
    } else if (opponent_move.data.type === "SrcStepDstFinite") {
      const movement_info = await animateOpponentSrcStepDstFinite(
        opponent_move.data,
      );
      const piece_moved = movement_info.piece_moved; // USE ME
      GAME_STATE.is_my_turn = true;
      if (opponent_move.data.water_entry_ciurl) {
        KiarArk.push_body_elem_and_display({
          type: "movement",
          dat: normalMessageToKiarArk(opponent_move, {
            piece_moved,
            water_ciurl_count: opponent_move.data.water_entry_ciurl.filter(
              (a) => a,
            ).length,
          }),
          piece_capture_comment: toPieceCaptureComment(
            movement_info.maybe_capture,
          ),
        });
      } else {
        KiarArk.push_body_elem_and_display({
          type: "movement",
          dat: normalMessageToKiarArk(opponent_move, { piece_moved }),
          piece_capture_comment: toPieceCaptureComment(
            movement_info.maybe_capture,
          ),
        });
      }
    } else {
      const a: never = opponent_move.data;
      throw new Error("does not happen");
    }
  } else if (opponent_move.type === "TamMove") {
    GAME_STATE.opponent_has_just_moved_tam = true;
    if (opponent_move.stepStyle === "NoStep") {
      await animateOpponentTamNoStep(
        fromAbsoluteCoord(opponent_move.src),
        fromAbsoluteCoord(opponent_move.firstDest),
        fromAbsoluteCoord(opponent_move.secondDest),
      );
      GAME_STATE.is_my_turn = true;
      KiarArk.push_body_elem_and_display({
        type: "movement",
        dat: normalMessageToKiarArk(opponent_move, { piece_moved: "Tam2" }),
      });
    } else if (opponent_move.stepStyle === "StepsDuringFormer") {
      await animateOpponentTamSteppingDuringFormer(opponent_move);
      GAME_STATE.is_my_turn = true;
      KiarArk.push_body_elem_and_display({
        type: "movement",
        dat: normalMessageToKiarArk(opponent_move, { piece_moved: "Tam2" }),
      });
    } else if (opponent_move.stepStyle === "StepsDuringLatter") {
      await animateOpponentTamSteppingDuringLatter(opponent_move);
      GAME_STATE.is_my_turn = true;
      KiarArk.push_body_elem_and_display({
        type: "movement",
        dat: normalMessageToKiarArk(opponent_move, { piece_moved: "Tam2" }),
      });
    } else {
      const _a: never = opponent_move.stepStyle;
      throw new Error("does not happen");
    }
  } else if (opponent_move.type === "InfAfterStep") {
    GAME_STATE.opponent_has_just_moved_tam = false;
    const finalResult = (async () => {
      if (opponent_move.finalResult == null) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const res: RetInfPoll = await sendStuffTo<{}, RetInfPoll>(
            "infpoll",
            "`polling for the opponent's afterhalfacceptance`",
            {},
            (response) => {
              console.log(
                "Success; the server returned:",
                JSON.stringify(response),
              );
              return response;
            },
          );
          if (res.type === "Err") {
            throw new Error("not good!!!");
          } else if (res.type !== "NotYetDetermined") {
            if (res.content.type !== "InfAfterStep") {
              throw new Error("nooooooo");
            }
            return res.content.finalResult!;
          }
        }
      } else {
        return opponent_move.finalResult;
      }
    })();
    const [finalResult_resolved, movement_info]: [
      {
        dest: AbsoluteCoord;
        water_entry_ciurl?: Ciurl;
        thwarted_by_failing_water_entry_ciurl: Ciurl | null;
      },
      MovementInfo,
    ] = await animateOpponentInfAfterStep({
      src: fromAbsoluteCoord(opponent_move.src),
      step: fromAbsoluteCoord(opponent_move.step),
      plannedDirection: fromAbsoluteCoord(opponent_move.plannedDirection),
      stepping_ciurl: opponent_move.stepping_ciurl,
      finalResult,
    });

    const zuo1: string = (() => {
      if (movement_info.piece_moved === "Tam2") {
        throw new Error("Tam2 was passed to `piece_moved`");
      }
      return serializeProf(movement_info.piece_moved.prof);
    })();
    GAME_STATE.is_my_turn = true;

    if (finalResult_resolved.water_entry_ciurl) {
      if (finalResult_resolved.water_entry_ciurl.filter((a) => a).length < 3) {
        // water entry has failed; no piece was captured
        KiarArk.push_body_elem_and_display({
          type: "movement",
          dat: `${serializeAbsoluteCoord(
            opponent_move.src,
          )}${zuo1}${serializeAbsoluteCoord(
            opponent_move.step,
          )}${serializeAbsoluteCoord(
            finalResult_resolved.dest,
          )}橋${serializeCiurl(opponent_move.stepping_ciurl)}水${serializeCiurl(
            finalResult_resolved.water_entry_ciurl,
          )}此無`,
        });
      } else {
        KiarArk.push_body_elem_and_display({
          type: "movement",
          dat: `${serializeAbsoluteCoord(
            opponent_move.src,
          )}${zuo1}${serializeAbsoluteCoord(
            opponent_move.step,
          )}${serializeAbsoluteCoord(
            finalResult_resolved.dest,
          )}橋${serializeCiurl(opponent_move.stepping_ciurl)}水${serializeCiurl(
            finalResult_resolved.water_entry_ciurl,
          )}`,
          piece_capture_comment: toPieceCaptureComment(
            movement_info.maybe_capture,
          ),
        });
      }
    } else if (finalResult_resolved.thwarted_by_failing_water_entry_ciurl) {
      KiarArk.push_body_elem_and_display({
        type: "movement",
        dat: `${serializeAbsoluteCoord(
          opponent_move.src,
        )}${zuo1}${serializeAbsoluteCoord(
          opponent_move.step,
        )}${serializeAbsoluteCoord(
          finalResult_resolved.dest,
        )}橋${serializeCiurl(opponent_move.stepping_ciurl)}水${serializeCiurl(
          finalResult_resolved.thwarted_by_failing_water_entry_ciurl,
        )}此無`,
        piece_capture_comment: toPieceCaptureComment(
          movement_info.maybe_capture,
        ),
      });
    } else {
      const absoluteCoordEq = (a: AbsoluteCoord, b: AbsoluteCoord) => {
        return a[0] === b[0] && a[1] === b[1];
      };

      if (
        absoluteCoordEq(
          opponent_move.plannedDirection,
          finalResult_resolved.dest,
        ) /* it went as planned, so no need to add 此無 */ ||
        !absoluteCoordEq(
          finalResult_resolved.dest,
          opponent_move.src,
        ) /* the end is different from the source, so it cannot be 此無 */
      ) {
        KiarArk.push_body_elem_and_display({
          type: "movement",
          dat: `${serializeAbsoluteCoord(
            opponent_move.src,
          )}${zuo1}${serializeAbsoluteCoord(
            opponent_move.step,
          )}${serializeAbsoluteCoord(
            finalResult_resolved.dest,
          )}橋${serializeCiurl(opponent_move.stepping_ciurl)}`,
          piece_capture_comment: toPieceCaptureComment(
            movement_info.maybe_capture,
          ),
        });
      } else {
        KiarArk.push_body_elem_and_display({
          type: "movement",
          dat: `${serializeAbsoluteCoord(
            opponent_move.src,
          )}${zuo1}${serializeAbsoluteCoord(
            opponent_move.step,
          )}${serializeAbsoluteCoord(
            opponent_move.plannedDirection,
          )}橋${serializeCiurl(opponent_move.stepping_ciurl)}此無`,
          piece_capture_comment: toPieceCaptureComment(
            movement_info.maybe_capture,
          ),
        });
      }
    }
  } else {
    const a: never = opponent_move;
    throw new Error("does not happen");
  }
}

type RetMainPoll_Legal = {
  type: "MoveMade";
  message?: TacticsKey;
  content: MoveToBePolled;
} | {
  type: "NotYetDetermined";
};

async function sendMainPoll(): Promise<RetMainPoll_Legal> {
  const res: RetMainPoll = await sendStuffTo<{}, RetMainPoll>(
    "mainpoll",
    "`polling for the opponent's move`",
    {},
    (response) => {
      console.log("Success; the server returned:", JSON.stringify(response));
      return response;
    },
  );

  if (res.type === "Err") {
    alert(`sending MainPoll somehow resulted in an error: ${res.why_illegal}`);
    throw new Error(
      `sending MainPoll somehow resulted in an error: ${res.why_illegal}`,
    );
  }
  return res;
}

async function animateOpponentSrcStepDstFinite(
  p: SrcStepDstFinite,
): Promise<MovementInfo> {
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
  await new Promise((resolve) => setTimeout(resolve, 2000 * 0.8093));
  drawCiurlWithAudio(stepping_ciurl, Side.Downward);
  await new Promise((resolve) => setTimeout(resolve, 600 * 0.8093));
  eraseArrow();
}

function position_for_temporarily_appending_hop1zuo1_of_downward() {
  if (GAME_STATE.f.hop1zuo1OfDownward.length <= 8) {
    // There are only 8 or fewer pieces in hop1zuo1.
    // Therefore, the piecess so far fill the positions from `0` to `hop1zuo1OfDownward.length - 1` without scooching over.
    // This means that, if we place the image at the position `hop1zuo1OfDownward.length`, then
    // that will be the correct position.
    // 手駒が8枚以下しかない。
    // したがって、今までの手駒は 0 から hop1zuo1OfDownward.length - 1 までの位置を埋めていて、手駒間の距離を詰めていない。
    // ということは、hop1zuo1OfDownward.length の位置へと画像を配置すれば、
    // 新手駒の目標座標として正しい位置になる。
    return {
      top: -135,
      left:
        1 +
        GAME_STATE.f.hop1zuo1OfDownward.length * BOX_SIZE +
        (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
    };
  } else {
    // There are already more than 9 pieces in the hop1zuo1 with some scooching
    // Since these pieces are packed to fill positions 0 to 8, there is no problem if we place the newly acquired piece in position 9.
    // Note that, when `drawField` is called, the pieces in hop1zuo1 will abruptly move horizontally at once,
    // but I consider this to be acceptable.
    // 手駒が既に9枚以上あり、詰めて配置されている。
    // 詰めて配置されたこれらの駒は位置 0 から 8 を埋めているので、新しく手に入れた駒は 9 においてやればとりあえず問題はない。
    // なお、drawField が呼ばれた際に一気に手駒の部分がガクッと横に動くことになるが、
    // まあ許容範囲としていいだろう。
    return {
      top: -135,
      left: 1 + 9 * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
    };
  }
}

async function animateOpponentInfAfterStep(p: {
  src: Coord;
  step: Coord;
  plannedDirection: Coord;
  stepping_ciurl: Ciurl;
  finalResult: Promise<{
    dest: AbsoluteCoord;
    water_entry_ciurl?: Ciurl;
    thwarted_by_failing_water_entry_ciurl: Ciurl | null;
  }>;
}): Promise<
  [
    {
      dest: AbsoluteCoord;
      water_entry_ciurl?: Ciurl;
      thwarted_by_failing_water_entry_ciurl: Ciurl | null;
    },
    MovementInfo,
  ]
> {
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
  await animateNode(srcNode, 750 * 0.8093, {
    to: coordToPieceXY_Shifted(p.step),
    from: coordToPieceXY(p.src),
  });

  await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));

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
    await animateNode(srcNode, 750 * 0.8093, {
      to: coordToPieceXY(dest),
      from: coordToPieceXY(
        p.src,
      ) /* must be src, since the node is not renewed */,
    });

    await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));

    await animateNode(
      destNode,
      750 * 0.8093,
      {
        to: position_for_temporarily_appending_hop1zuo1_of_downward(),
        from: coordToPieceXY([dest_i, dest_j]),
      },
      "50",
      180,
    );

    if (result.water_entry_ciurl) {
      await animateWaterEntryLogo();
      drawCiurlWithAudio(result.water_entry_ciurl, Side.Downward);
      await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
      if (result.water_entry_ciurl.filter((a) => a).length < 3) {
        alert(DICTIONARY.ja.failedWaterEntry);

        console.log("drawField opponent #", 12);
        GAME_STATE.last_move_focus = [src_i, src_j];
        drawField({ focus: [src_i, src_j] });

        // no piece capture is possible if water entry has failed
        return [result, { piece_moved: piece, maybe_capture: null }];
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
    return [
      result,
      { piece_moved: piece, maybe_capture: toColorProf(destPiece) },
    ];
  } else {
    // no piece capture; in this branch, either self-occlusion is happening or else destPiece is null.
    await animateNode(srcNode, 750 * 0.8093, {
      to: coordToPieceXY(dest),
      from: coordToPieceXY(
        p.src,
      ) /* must be src, since the node is not renewed */,
    });

    if (result.water_entry_ciurl) {
      await animateWaterEntryLogo();
      drawCiurlWithAudio(result.water_entry_ciurl, Side.Downward);
      await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
      if (result.water_entry_ciurl.filter((a) => a).length < 3) {
        alert(DICTIONARY.ja.failedWaterEntry);
        console.log("drawField opponent #", 14);
        GAME_STATE.last_move_focus = [src_i, src_j];
        drawField({ focus: [src_i, src_j] });
        return [result, { piece_moved: piece, maybe_capture: null }]; // no piece capture; in this branch, either self-occlusion is happening or else destPiece is null.
      }
    } else if (result.thwarted_by_failing_water_entry_ciurl) {
      await animateWaterEntryLogo();
      drawCiurlWithAudio(result.thwarted_by_failing_water_entry_ciurl, Side.Downward);
      await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
      alert(DICTIONARY.ja.failedWaterEntry);
      console.log("drawField opponent #", 14);
      GAME_STATE.last_move_focus = [src_i, src_j];
      drawField({ focus: [src_i, src_j] });
      return [result, { piece_moved: piece, maybe_capture: null }]; // no piece capture; in this branch, either self-occlusion is happening or else destPiece is null.
    }

    if (!coordEq(p.src, dest)) {
      GAME_STATE.f.currentBoard[src_i][src_j] = null;
      GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
    }
    console.log("drawField opponent #", 15);
    GAME_STATE.last_move_focus = [dest_i, dest_j];
    drawField({ focus: [dest_i, dest_j] });
    return [result, { piece_moved: piece, maybe_capture: null }]; // no piece capture; in this branch, either self-occlusion is happening or else destPiece is null.
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

async function sendTyMok1OrTaXot1Poll(o: { hands: Hand[]; score: number }) {
  const base_score: number = o.score;
  console.log("poll whether ty mok1 or ta xot1");

  const res: RetWhetherTyMokPoll = await sendStuffTo<
    {},
    RetWhetherTyMokPoll
  >(
    "whethertymokpoll",
    "`polling for whether the declaration is ty mok1 or ta xot1`",
    {},
    (response) => {
      console.log("Success; the server returned:", JSON.stringify(response));
      return response;
    },
  );

  if (res.type === "Err") {
    alert(
      `sending TyMok1OrTaXot1Poll somehow resulted in an error: ${res.why_illegal}`,
    );
    throw new Error(
      `sending TyMok1OrTaXot1Poll somehow resulted in an error: ${res.why_illegal}`,
    );
  }

  if (res.type !== "NotYetDetermined") {
    console.log("ding!");

    const score_display = document.getElementById("score_display")!;

    await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));

    // so that the ty mok1 / ta xot1 image is written after the score is written
    // this is necessary because the scorewriting deletes scoredisplay.innerHTML
    while (!score_display.hasChildNodes()) {
      await new Promise((resolve) => setTimeout(resolve, 100 * 0.8093));
    }

    if (res.type === "TyMok") {
      score_display.innerHTML += `<img src="image/再行.png" style="position: absolute; left: 660px; top: 125px; " height="200">`;
      await new Promise((resolve) => setTimeout(resolve, 5000 * 0.8093));
      console.log("go on with ty mok1");
      increaseRateAndAnimate(false);
      KiarArk.push_body_elem_and_display({
        type: "tymoktaxot",
        dat: `或為${o.hands.join("加")}\n再行`,
      });
    } else {
      score_display.innerHTML += `<img src="image/終季.png" style="position: absolute; left: 660px; top: 125px; " height="200">`;
      await new Promise((resolve) => setTimeout(resolve, 5000 * 0.8093));
      console.log("go on with ta xot1");
      const season_that_has_just_ended = ["春", "夏", "秋", "冬"][
        GAME_STATE.season
      ]; // GAME_STATE.season gets updated on the following call of `endSeason`, so we must store the previous value

      endSeason(-base_score, res.is_first_move_my_move); // since opponent, negative score
      KiarArk.push_body_elem_and_display({
        type: "tymoktaxot",
        dat: `或為${o.hands.join("加")}而手${toDigitsLinzklar(
          base_score * Math.pow(2, GAME_STATE.log2_rate),
        ).join("")}\n終季\t${season_that_has_just_ended}終`,
      });
    }
  } else {
    document
      .getElementById("protective_cover_over_field_while_waiting_for_opponent")!
      .classList.remove("nocover");
    await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
    await sendTyMok1OrTaXot1Poll(o);
  }
}

async function animateOpponentSrcStepDstFinite_(
  src: Coord,
  step: Coord,
  dest: Coord,
  water_entry_ciurl?: Ciurl,
): Promise<MovementInfo> {
  const [src_i, src_j] = src;
  const [step_i, step_j] = step;
  const [dest_i, dest_j] = dest;

  const piece_moved: Piece | null = GAME_STATE.f.currentBoard[src_i][src_j];
  if (piece_moved === null) {
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

    await animateNode(srcNode, 750 * 0.8093, {
      to: coordToPieceXY_Shifted(step),
      from: coordToPieceXY(src),
    });

    await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));

    await animateNode(srcNode, 750 * 0.8093, {
      to: coordToPieceXY(dest),
      from: coordToPieceXY(
        src,
      ) /* must be src, since the node is not renewed */,
    });

    await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));

    await animateNode(
      destNode,
      750 * 0.8093,
      {
        to: position_for_temporarily_appending_hop1zuo1_of_downward(),
        from: coordToPieceXY([dest_i, dest_j]),
      },
      "50",
      180,
    );

    if (water_entry_ciurl) {
      await animateWaterEntryLogo();
      drawCiurlWithAudio(water_entry_ciurl, Side.Downward);
      await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
      if (water_entry_ciurl.filter((a) => a).length < 3) {
        alert(DICTIONARY.ja.failedWaterEntry);
        console.log("drawField opponent #", 16);
        GAME_STATE.last_move_focus = [src_i, src_j];
        drawField({ focus: [src_i, src_j] });

        // no piece capture is possible if water entry failed
        return { piece_moved, maybe_capture: null };
      }
    }

    if (!coordEq(src, dest)) {
      /* if same, the piece should not take itself */
      takeTheUpwardPieceAndCheckHand(destPiece);
      GAME_STATE.f.currentBoard[src_i][src_j] = null;
      GAME_STATE.f.currentBoard[dest_i][dest_j] = piece_moved;
    }
    console.log("drawField opponent #", 17);
    GAME_STATE.last_move_focus = [dest_i, dest_j];
    drawField({ focus: [dest_i, dest_j] });
    return {
      piece_moved,
      maybe_capture: coordEq(src, dest) ? null : toColorProf(destPiece),
    };
  } else {
    const imgNode: HTMLElement = document.getElementById(
      `field_piece_${src_i}_${src_j}`,
    )!;
    await animateNode(imgNode, 750 * 0.8093, {
      to: coordToPieceXY_Shifted(step),
      from: coordToPieceXY(src),
    });

    await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));

    await animateNode(imgNode, 750 * 0.8093, {
      to: coordToPieceXY(dest),
      from: coordToPieceXY(
        src,
      ) /* must be src, since the node is not renewed */,
    });

    if (water_entry_ciurl) {
      await animateWaterEntryLogo();
      drawCiurlWithAudio(water_entry_ciurl, Side.Downward);
      await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
      if (water_entry_ciurl.filter((a) => a).length < 3) {
        alert(DICTIONARY.ja.failedWaterEntry);

        console.log("drawField opponent #", 18);
        GAME_STATE.last_move_focus = [src_i, src_j];
        drawField({ focus: [src_i, src_j] });
        // no piece capture is possible if water entry failed
        return { piece_moved, maybe_capture: null };
      }
    }

    if (!coordEq(src, dest)) {
      GAME_STATE.f.currentBoard[src_i][src_j] = null;
      GAME_STATE.f.currentBoard[dest_i][dest_j] = piece_moved;
    }

    console.log("drawField opponent #", 19);
    GAME_STATE.last_move_focus = [dest_i, dest_j];
    drawField({ focus: [dest_i, dest_j] });

    return {
      piece_moved,
      maybe_capture: coordEq(src, dest) ? null : toColorProf(destPiece),
    };
  }
}

async function animateOpponentSrcDst(p: SrcDst): Promise<MovementInfo> {
  const src: Coord = fromAbsoluteCoord(p.src);
  const dst: Coord = fromAbsoluteCoord(p.dest);
  if (p.water_entry_ciurl) {
    return await animateOpponentSrcDst_(src, dst, {
      water_entry_ciurl: p.water_entry_ciurl,
    });
  } else {
    return await animateOpponentSrcDst_(src, dst, {});
  }
}

/**
 * Animates opponent's move that simply consists of a src and a destination.
 * @returns the color and the profession of the captured piece to help with KIAR_ARK.
 */
async function animateOpponentSrcDst_(
  src: Coord,
  dst: Coord,
  o: { water_entry_ciurl?: Ciurl; disable_focus?: boolean },
): Promise<MovementInfo> {
  const [src_i, src_j] = src;
  const [dest_i, dest_j] = dst;

  const piece_moved: Piece | null = GAME_STATE.f.currentBoard[src_i][src_j];
  if (piece_moved === null) {
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
    await animateNode(srcNode, total_duration, {
      to: coordToPieceXY([dest_i, dest_j]),
      from: coordToPieceXY([src_i, src_j]),
    });

    await animateNode(
      destNode,
      total_duration,
      {
        to: position_for_temporarily_appending_hop1zuo1_of_downward(),
        from: coordToPieceXY([dest_i, dest_j]),
      },
      "50",
      180,
    );

    if (o.water_entry_ciurl) {
      await animateWaterEntryLogo();
      drawCiurlWithAudio(o.water_entry_ciurl, Side.Downward);
      await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
      if (o.water_entry_ciurl.filter((a) => a).length < 3) {
        alert(DICTIONARY.ja.failedWaterEntry);

        console.log("drawField opponent #", 20);
        GAME_STATE.last_move_focus = [src_i, src_j];
        drawField({ focus: [src_i, src_j] });
        // it FAILED, so no piece was captured
        return { piece_moved, maybe_capture: null };
      }
    }

    takeTheUpwardPieceAndCheckHand(destPiece);
    GAME_STATE.f.currentBoard[src_i][src_j] = null;
    GAME_STATE.f.currentBoard[dest_i][dest_j] = piece_moved;

    console.log("drawField opponent #", 21);
    GAME_STATE.last_move_focus = [dest_i, dest_j];
    drawField({ focus: [dest_i, dest_j] });
  } else {
    const imgNode: HTMLElement = document.getElementById(
      `field_piece_${src_i}_${src_j}`,
    )!;
    await animateNode(imgNode, 1500 * 0.8093, {
      to: coordToPieceXY([dest_i, dest_j]),
      from: coordToPieceXY([src_i, src_j]),
    });

    if (o.water_entry_ciurl) {
      await animateWaterEntryLogo();
      drawCiurlWithAudio(o.water_entry_ciurl, Side.Downward);
      await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
      if (o.water_entry_ciurl.filter((a) => a).length < 3) {
        alert(DICTIONARY.ja.failedWaterEntry);

        console.log("drawField opponent #", 22);
        GAME_STATE.last_move_focus = [src_i, src_j];
        drawField({ focus: [src_i, src_j] });
        // it FAILED, so no piece was captured
        return { piece_moved, maybe_capture: null };
      }
    }

    GAME_STATE.f.currentBoard[src_i][src_j] = null;
    GAME_STATE.f.currentBoard[dest_i][dest_j] = piece_moved;

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
  return { piece_moved, maybe_capture: toColorProf(destPiece) };
}

async function animateOpponentFromHand(
  piece: NonTam2PieceDownward,
  dest: Coord,
) {
  // remove the corresponding one from hand
  const ind = GAME_STATE.f.hop1zuo1OfDownward.findIndex(
    (p) => p.color === piece.color && p.prof === piece.prof,
  );
  if (ind === -1) {
    throw new Error("What should exist in the hand does not exist");
  }
  const [removed_from_hop1zuo1] = GAME_STATE.f.hop1zuo1OfDownward.splice(
    ind,
    1,
  );

  // add the removed piece to the destination
  const [dest_i, dest_j] = dest;
  if (GAME_STATE.f.currentBoard[dest_i][dest_j] !== null) {
    throw new Error("Trying to parachute the piece onto an occupied space");
  }

  const imgNode: HTMLElement = document.getElementById(
    `hop1zuo1OfDownward_${ind}`,
  )!;
  await animateNode(imgNode, 1500 * 0.8093, {
    to: coordToPieceXY([dest_i, dest_j]),

    // Here, `drawField` has already been called, and the pieces have been placed in a packed configuration, so `from` becomes:
    // この段階では既に drawField が呼ばれており、詰められた配置で手駒が配置されているため、from はこうなる。
    from: {
      top: -135,
      left: hop1_zuo1_left_position({
        ind,
        list_length: GAME_STATE.f.hop1zuo1OfDownward.length,
      }),
    },
  });

  GAME_STATE.f.currentBoard[dest_i][dest_j] = removed_from_hop1zuo1;

  console.log("drawField opponent #", 24);
  GAME_STATE.last_move_focus = [dest_i, dest_j];
  drawField({ focus: [dest_i, dest_j] });
}

async function animateOpponentTamNoStep(
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
  await animateNode(imgNode, 1500 * 0.8093, {
    to: coordToPieceXY(fstdst),
    from: coordToPieceXY(src),
  });
  GAME_STATE.f.currentBoard[src[0]][src[1]] = null;
  GAME_STATE.f.currentBoard[fstdst[0]][fstdst[1]] = piece;

  console.log("drawField opponent #", 25);
  drawField({ focus: null }); /* Temporary animation. Hence no focus. */

  const imgNode2: HTMLElement = document.getElementById(
    `field_piece_${fstdst[0]}_${fstdst[1]}`,
  )!;

  /* somehow does not work without this line */
  await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));

  await animateNode(imgNode2, 1500 * 0.8093, {
    to: coordToPieceXY(snddst),
    from: coordToPieceXY(fstdst),
  });
  GAME_STATE.f.currentBoard[fstdst[0]][fstdst[1]] = null;
  GAME_STATE.f.currentBoard[snddst[0]][snddst[1]] = piece;

  console.log("drawField opponent #", 26);
  GAME_STATE.last_move_focus = [snddst[0], snddst[1]];
  drawField({ focus: [snddst[0], snddst[1]] });
}

async function animateOpponentTamSteppingDuringFormer(opponent_move: {
  src: AbsoluteCoord;
  firstDest: AbsoluteCoord;
  secondDest: AbsoluteCoord;
  step: AbsoluteCoord;
}) {
  const p = {
    src: fromAbsoluteCoord(opponent_move.src),
    firstDest: fromAbsoluteCoord(opponent_move.firstDest),
    secondDest: fromAbsoluteCoord(opponent_move.secondDest),
    step: fromAbsoluteCoord(opponent_move.step),
  };
  await animateOpponentSrcStepDstFinite_(p.src, p.step, p.firstDest);
  await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
  await animateOpponentSrcDst_(p.firstDest, p.secondDest, {});
}

async function animateOpponentTamSteppingDuringLatter(opponent_move: {
  src: AbsoluteCoord;
  firstDest: AbsoluteCoord;
  secondDest: AbsoluteCoord;
  step: AbsoluteCoord;
}) {
  const p = {
    src: fromAbsoluteCoord(opponent_move.src),
    firstDest: fromAbsoluteCoord(opponent_move.firstDest),
    secondDest: fromAbsoluteCoord(opponent_move.secondDest),
    step: fromAbsoluteCoord(opponent_move.step),
  };

  /* This is the former half; hence no need to show the focus */
  await animateOpponentSrcDst_(p.src, p.firstDest, { disable_focus: true });

  await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));

  /* And this part is the latter half, in which stepping occurs */
  await animateOpponentSrcStepDstFinite_(p.firstDest, p.step, p.secondDest);
}
