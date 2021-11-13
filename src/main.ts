import {
  createPieceSizeImageOnBoardByPath,
  createGuideImageAt,
  createPieceSizeImageOnBoardByPath_Shifted,
  createPieceSizeSelectionButtonOnBoard_Shifted,
  createImageButton,
  createPieceSizeImageOnBoardByPathAndXY,
} from "./create_html_element";
import {
  GAME_STATE,
  fromAbsoluteCoord,
  toAbsoluteCoord,
  initial_board_with_IA_down,
} from "./game_state";
import {
  toColorProf,
  CaptureInfo,
  toPieceCaptureComment,
  allowPolling,
  resumePolling,
  stopPolling,
} from "./opponent_move";
import {
  Coord,
  Piece,
  coordEq,
  NonTam2PieceUpward,
  Side,
  NonTam2Piece,
  BoardIndex,
  rotateBoard,
} from "cerke_online_utility/lib";
import { toPath_ } from "./piece_to_path";
import {
  AbsoluteCoord,
  Profession,
  Color,
  Ciurl,
  Ret_AfterHalfAcceptance,
  NormalNonTamMove,
  NormalMove,
  AfterHalfAcceptance,
  Ret_NormalMove,
  Ret_InfAfterStep,
  InfAfterStep,
  Season,
  Log2_Rate,
} from "cerke_online_api";
import {
  calculateMovablePositions,
  canGetOccupiedByNonTam,
  canGetOccupiedBy,
} from "cerke_online_utility/lib";
import {
  MAX_PIECE_SIZE,
  hop1_zuo1_left_position,
  PIECE_SIZE,
  getDenoteRateNodeTopLeft, getDenoteScoreNodeTopLeft, getDenoteSeasonNodeTopLeft
} from "./html_top_left";
import { DICTIONARY, GAME_END_LINZKLAR } from "./dictionary";
import { API_ORIGIN } from "./env";
import {
  drawFinalScoreDisplay,
  drawScoreDisplay,
  ArrayUpTo4,
} from "./score_display";
import { toDigitsLinzklar } from "./to_digits";
import {
  ObtainablePieces,
  calculate_hands_and_score_from_pieces,
} from "cerke_hands_and_score";
import { KIAR_ARK } from "./kiar_ark"
import { KRUT_CRUOP } from "./main_entry";
import {
  animateNode,
  animateStepTamLogo,
  animateWaterEntryLogo,
  drawCancelButton, drawCiurl, drawField, drawHoverAt_,
  drawPhantomAt, drawMak2Io1,
  eraseGuide, erasePhantomAndOptionallyCancelButton,
} from "./draw_erase_animate";
import { normalMessageToKiarArk, serializeAbsoluteCoord, serializeCiurl } from "./serialize";

type SelectedCoord = null | Coord | ["Hop1zuo1", number];

let SELECTED_COORD_UI: SelectedCoord = null;

function cancelSteppingButUpdateTheFocus(new_focus: Coord) {
  cancelStepping();
  console.log("drawField #", 1.1);
  drawField({ focus: new_focus });
}

function cancelStepping() {
  eraseGuide();
  erasePhantomAndOptionallyCancelButton();
  document
    .getElementById("protective_cover_over_field")!
    .classList.add("nocover");

  // resurrect the original one
  const backup: [Coord, Piece] = GAME_STATE.backupDuringStepping!;
  const from: Coord = backup[0];
  GAME_STATE.f.currentBoard[from[0]][from[1]] = backup[1];
  GAME_STATE.backupDuringStepping = null;

  SELECTED_COORD_UI = null;

  console.log("drawField #", 1);
  drawField({ focus: GAME_STATE.last_move_focus });
}

function getThingsGoingAfterSecondTamMoveThatStepsInTheLatterHalf(
  theVerySrc: Coord,
  firstDest: Coord,
  stepsOn: Coord,
) {
  eraseGuide();
  document
    .getElementById("protective_cover_over_field")!
    .classList.remove("nocover");
  document
    .getElementById("protective_tam_cover_over_field")!
    .classList.remove("nocover");

  // delete the original one
  GAME_STATE.backupDuringStepping = [firstDest, "Tam2"];
  GAME_STATE.f.currentBoard[firstDest[0]][firstDest[1]] = null;

  document.getElementById("cancelButton")!.remove();

  console.log("drawField #", 2);
  drawField({ focus: null });
  drawPhantomAt(firstDest, "Tam2");
  drawCancelButton(() => {
    eraseGuide();
    erasePhantomAndOptionallyCancelButton();
    document
      .getElementById("protective_cover_over_field")!
      .classList.add("nocover");
    document
      .getElementById("protective_tam_cover_over_field")!
      .classList.add("nocover");

    // resurrect the original one
    GAME_STATE.f.currentBoard[theVerySrc[0]][theVerySrc[1]] = "Tam2";
    GAME_STATE.backupDuringStepping = null;

    SELECTED_COORD_UI = null;

    console.log("drawField #", 3.1);
    drawField({ focus: GAME_STATE.last_move_focus }); // This is within cancel; hence we must not overwrite the last_move_focus
  });
  drawHoverAt_<"Tam2">(stepsOn, "Tam2", (coord: Coord, piece: "Tam2") => {
    const contains_guides = document.getElementById("contains_guides")!;

    const centralNode = createPieceSizeSelectionButtonOnBoard_Shifted(coord);
    contains_guides.appendChild(centralNode);

    const {
      finite: guideListYellow,
      infinite: guideListGreen,
    } = calculateMovablePositions(
      coord,
      piece,
      GAME_STATE.f.currentBoard,
      GAME_STATE.tam_itself_is_tam_hue,
    );

    if (guideListGreen.length > 0) {
      throw new Error("should not happen");
    }

    for (let ind = 0; ind < guideListYellow.length; ind++) {
      const secondDest: Coord = guideListYellow[ind];
      const [i, j] = secondDest;
      const destPiece = GAME_STATE.f.currentBoard[i][j];

      // cannot step twice and cannot get a piece
      if (destPiece !== null) {
        continue;
      }

      const img = createGuideImageAt(secondDest, "yellow_diamond_for_tam");

      img.addEventListener("click", function () {
        const message: NormalMove = {
          type: "TamMove",
          stepStyle: "StepsDuringLatter",
          src: toAbsoluteCoord(theVerySrc),
          step: toAbsoluteCoord(stepsOn),
          firstDest: toAbsoluteCoord(firstDest),
          secondDest: toAbsoluteCoord(secondDest),
        };

        eraseGuide();
        erasePhantomAndOptionallyCancelButton();

        sendNormalMessage(message);
        document
          .getElementById("protective_cover_over_field")!
          .classList.add("nocover");
        document
          .getElementById("protective_tam_cover_over_field")!
          .classList.add("nocover");
        return;
      });

      img.style.zIndex = "200";
      contains_guides.appendChild(img);
    }

    return;
  });
  return;
}

/**
 * @param from where the first half started
 * @param to where the first half ended
 * @param step supplied when the first half of the move stepped a piece
 */
function afterFirstTamMove(from: Coord, to: Coord, step?: Coord) {
  eraseGuide();
  document
    .getElementById("protective_tam_cover_over_field")!
    .classList.remove("nocover");

  // stepping should now have been completed
  document
    .getElementById("protective_cover_over_field")!
    .classList.add("nocover");

  GAME_STATE.f.currentBoard[from[0]][from[1]] = null;
  GAME_STATE.f.currentBoard[to[0]][to[1]] = "Tam2";

  console.log("drawField #", 4.1);
  drawField({ focus: null }); // temporary display, hence no focus

  const drawTam2HoverNonshiftedAt = function (coord: Coord) {
    const contains_phantom = document.getElementById("contains_phantom")!;

    const img = createPieceSizeImageOnBoardByPath(
      coord,
      toPath_("Tam2"),
      "piece_image_on_board",
    );

    img.style.zIndex = "100";
    img.style.cursor = "pointer";

    const selectTam2Hover = function () {
      const contains_guides = document.getElementById("contains_guides")!;

      const centralNode = createPieceSizeImageOnBoardByPath(
        coord,
        "selection2",
        "selection",
      );

      centralNode.style.cursor = "pointer";

      centralNode.style.zIndex = "200";
      contains_guides.appendChild(centralNode);

      const {
        finite: guideListYellow,
        infinite: guideListGreen,
      } = calculateMovablePositions(
        coord,
        "Tam2",
        GAME_STATE.f.currentBoard,
        GAME_STATE.tam_itself_is_tam_hue,
      );

      if (guideListGreen.length > 0) {
        throw new Error("should not happen");
      }

      for (let ind = 0; ind < guideListYellow.length; ind++) {
        const [i, j] = guideListYellow[ind];
        const destPiece = GAME_STATE.f.currentBoard[i][j];

        // cannot step twice
        if (step !== undefined && destPiece !== null) {
          continue;
        }

        const img = createGuideImageAt(guideListYellow[ind], "yellow_diamond_for_tam");

        if (destPiece === null) {
          img.addEventListener("click", () => {
            const theVerySrc: Coord = from;
            const firstDest: Coord = coord;
            const to: Coord = guideListYellow[ind];
            console.assert(GAME_STATE.f.currentBoard[to[0]][to[1]] == null);
            const message: NormalMove = step
              ? {
                type: "TamMove",
                stepStyle: "StepsDuringFormer",
                src: toAbsoluteCoord(theVerySrc),
                step: toAbsoluteCoord(step),
                firstDest: toAbsoluteCoord(firstDest),
                secondDest: toAbsoluteCoord(to),
              }
              : {
                type: "TamMove",
                stepStyle: "NoStep",
                src: toAbsoluteCoord(theVerySrc),
                firstDest: toAbsoluteCoord(firstDest),
                secondDest: toAbsoluteCoord(to),
              };

            // the cancel button, which must be destroyed since the move can no longer be cancelled, is also destroyed here
            erasePhantomAndOptionallyCancelButton();
            eraseGuide(); // this removes the central guide, as well as the yellow and green ones
            sendNormalMessage(message);

            document
              .getElementById("protective_tam_cover_over_field")!
              .classList.add("nocover");
          });
        } else {
          img.addEventListener("click", function () {
            getThingsGoingAfterSecondTamMoveThatStepsInTheLatterHalf(
              from,
              coord,
              guideListYellow[ind],
            );
          });
        }

        img.style.zIndex = "200";
        contains_guides.appendChild(img);
      }
    };

    img.addEventListener("click", selectTam2Hover);
    contains_phantom.appendChild(img);

    // draw as already selected
    selectTam2Hover();
  };

  drawPhantomAt(from, "Tam2");
  drawCancelButton(() => {
    // cancel Tam2's first move
    eraseGuide();
    erasePhantomAndOptionallyCancelButton();
    document
      .getElementById("protective_tam_cover_over_field")!
      .classList.add("nocover");
    document
      .getElementById("protective_cover_over_field")!
      .classList.add("nocover");

    // resurrect the original one
    GAME_STATE.f.currentBoard[to[0]][to[1]] = null;
    GAME_STATE.f.currentBoard[from[0]][from[1]] = "Tam2";

    SELECTED_COORD_UI = null;

    console.log("drawField #", 5.1);
    drawField({ focus: GAME_STATE.last_move_focus });
    /* This is a canceling; hence we must not overwrite last_move_focus */
  });
  drawTam2HoverNonshiftedAt(to);
}

function stepping(from: Coord, piece: "Tam2" | NonTam2PieceUpward, to: Coord) {
  eraseGuide();
  document
    .getElementById("protective_cover_over_field")!
    .classList.remove("nocover");

  // delete the original one
  GAME_STATE.backupDuringStepping = [from, piece];
  GAME_STATE.f.currentBoard[from[0]][from[1]] = null;

  console.log("drawField #", 6.1);
  drawField({ focus: null }); /* Temporary, so no focus */
  drawPhantomAt(from, piece);
  drawCancelButton(cancelStepping);
  drawHoverAt_(to, piece, function (
    coord: Coord,
    piece: "Tam2" | NonTam2PieceUpward,
  ) {
    const contains_guides = document.getElementById("contains_guides")!;

    const centralNode = createPieceSizeSelectionButtonOnBoard_Shifted(coord);
    contains_guides.appendChild(centralNode);

    const {
      finite: guideListYellow,
      infinite: guideListGreen,
    } = calculateMovablePositions(
      coord,
      piece,
      GAME_STATE.f.currentBoard,
      GAME_STATE.tam_itself_is_tam_hue,
    );
    /* calculateMovablePositions does not filter out what is banned by tam2 hue a uai1; display_guides_after_stepping handles that. */

    display_guides_after_stepping(
      coord,
      { piece, path: "yellow_circle" },
      contains_guides,
      guideListYellow,
    );

    if (piece === "Tam2") {
      if (guideListGreen.length > 0) {
        throw new Error("should not happen");
      }
      return;
    }
    display_guides_after_stepping(
      coord,
      { piece, path: "green_circle" },
      contains_guides,
      guideListGreen,
    );
  });
}

async function sendAfterHalfAcceptance(
  message: AfterHalfAcceptance,
  o: {
    src: Coord,
    step: Coord,
    stepping_ciurl: Ciurl,
    planned_destination: AbsoluteCoord
  }
) {
  const res: Ret_AfterHalfAcceptance = await sendStuff<
    AfterHalfAcceptance,
    Ret_AfterHalfAcceptance
  >("`after half acceptance`", message, response => {
    console.log("Success; the server returned:", JSON.stringify(response));
    return response;
  });

  if (!res.legal) {
    alert(`Illegal API sent, the reason being ${res.whyIllegal}`);
    throw new Error(`Illegal API sent, the reason being ${res.whyIllegal}`);
  }

  if (!res.dat.waterEntryHappened) {
    eraseGuide();
    SELECTED_COORD_UI = null;
    const maybe_capture = updateFieldAfterHalfAcceptance(message, o.src, o.step);

    console.log("drawField #", 7);
    drawField({ focus: GAME_STATE.last_move_focus });
    GAME_STATE.is_my_turn = false;
    if (message.dest) {
      KIAR_ARK.body = [...KIAR_ARK.body, {
        type: "movement",
        dat: `${serializeAbsoluteCoord(toAbsoluteCoord(o.src))}片${serializeAbsoluteCoord(toAbsoluteCoord(o.step))}${serializeAbsoluteCoord(message.dest)}橋${serializeCiurl(o.stepping_ciurl)}`,
        piece_capture_comment: toPieceCaptureComment(maybe_capture)
      }];
    } else {
      KIAR_ARK.body = [...KIAR_ARK.body, {
        type: "movement",
        dat: `${serializeAbsoluteCoord(toAbsoluteCoord(o.src))}片${serializeAbsoluteCoord(toAbsoluteCoord(o.step))}${serializeAbsoluteCoord(o.planned_destination)}橋${serializeCiurl(o.stepping_ciurl)}此無`,
        piece_capture_comment: toPieceCaptureComment(maybe_capture)
      }];
    }
    return;
  }

  await animateWaterEntryLogo();
  drawCiurlWithAudio(res.dat.ciurl);
  await new Promise(resolve => setTimeout(resolve, 500 * 0.8093));

  if (res.dat.ciurl.filter(a => a).length < 3) {
    alert(DICTIONARY.ja.failedWaterEntry);
    eraseGuide();
    SELECTED_COORD_UI = null;

    // must redraw the board with the focus on `o.src` to denote that a failed operation happened.
    cancelSteppingButUpdateTheFocus(o.src);
    GAME_STATE.is_my_turn = false;

    const dest: AbsoluteCoord = message.dest ?? (() => { throw new Error("This should not happen; it should have been rejected before the water entry"); })();

    // Always 此無, because in the outer `if` it is already checked
    // No capture occurs
    KIAR_ARK.body = [...KIAR_ARK.body, { type: "movement", dat: `${serializeAbsoluteCoord(toAbsoluteCoord(o.src))}片${serializeAbsoluteCoord(toAbsoluteCoord(o.step))}${serializeAbsoluteCoord(dest)}橋${serializeCiurl(o.stepping_ciurl)}水${serializeCiurl(res.dat.ciurl)}此無` }]
  } else {
    eraseGuide();
    SELECTED_COORD_UI = null;
    const maybe_capture = updateFieldAfterHalfAcceptance(message, o.src, o.step);

    console.log("drawField #", 8);
    drawField({ focus: GAME_STATE.last_move_focus });
    GAME_STATE.is_my_turn = false;

    if (message.dest) {
      KIAR_ARK.body = [...KIAR_ARK.body, {
        type: "movement",
        dat: `${serializeAbsoluteCoord(toAbsoluteCoord(o.src))}片${serializeAbsoluteCoord(toAbsoluteCoord(o.step))}${serializeAbsoluteCoord(message.dest)}橋${serializeCiurl(o.stepping_ciurl)}水${serializeCiurl(res.dat.ciurl)}`,
        piece_capture_comment: toPieceCaptureComment(maybe_capture)
      }];
    } else {
      throw new Error("This should not happen; it should have been rejected before the water entry");
    }
  }
}

export async function sendStuffTo<T, U>(
  api_name: string,
  log: string,
  message: T,
  validateInput: (response: any) => U,
): Promise<U> {
  // cover up the UI
  const cover_while_asyncawait = document.getElementById(
    "protective_cover_over_field_while_asyncawait",
  )!;
  cover_while_asyncawait.classList.remove("nocover");

  console.log(`Sending ${log}:`, JSON.stringify(message));
  const url = `${API_ORIGIN}/${api_name}/`;
  const data = {
    message,
  };

  const res: void | U = await fetch(url, {
    method: "POST",
    body: JSON.stringify(data), // data can be `string` or {object}!
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.access_token}`,
    },
  })
    .then(res => {
      cover_while_asyncawait.classList.add("nocover");
      return res.json();
    })
    .then(validateInput)
    .catch(error => {
      cover_while_asyncawait.classList.add("nocover");
      console.error("Error:", error);
      return;
    });

  console.log(res);
  cover_while_asyncawait.classList.add("nocover");

  if (!res) {
    alert("network error!");
    cover_while_asyncawait.classList.add("nocover");
    throw new Error("network error!");
  }
  return res;
}

async function sendStuff<T, U>(
  log: string,
  message: T,
  validateInput: (response: any) => U,
): Promise<U> {
  return await sendStuffTo<T, U>("slow", log, message, validateInput);
}



async function sendNormalMessage(message: NormalMove) {
  const res: Ret_NormalMove = await sendStuff<NormalMove, Ret_NormalMove>(
    "normal move",
    message,
    response => {
      console.log("Success; the server returned:", JSON.stringify(response));
      return response;
    },
  );

  if (!res.legal) {
    alert(`Illegal API sent, the reason being ${res.whyIllegal}`);
    throw new Error(`Illegal API sent, the reason being ${res.whyIllegal}`);
  }

  if (!res.dat.waterEntryHappened) {
    eraseGuide();
    SELECTED_COORD_UI = null;
    const maybe_capture = updateField(message);

    console.log("drawField #", 9);
    drawField({ focus: GAME_STATE.last_move_focus });
    GAME_STATE.is_my_turn = false;
    KIAR_ARK.body = [...KIAR_ARK.body, {
      type: "movement",
      dat: normalMessageToKiarArk(message),
      piece_capture_comment: toPieceCaptureComment(maybe_capture)
    }];
    return;
  }

  await animateWaterEntryLogo();
  drawCiurlWithAudio(res.dat.ciurl);
  await new Promise(resolve => setTimeout(resolve, 500 * 0.8093));
  const water_ciurl_count = res.dat.ciurl.filter(a => a).length;
  if (water_ciurl_count < 3) {
    alert(DICTIONARY.ja.failedWaterEntry);
    eraseGuide();
    SELECTED_COORD_UI = null;

    if (
      message.type === "NonTamMove" &&
      message.data.type === "SrcStepDstFinite"
    ) {
      cancelSteppingButUpdateTheFocus(fromAbsoluteCoord(message.data.src));
    } else if (message.type === "NonTamMove" && message.data.type !== "FromHand") {
      // The focus must be updated
      console.log("drawField #", 10.1);
      drawField({ focus: fromAbsoluteCoord(message.data.src) });
    }

    GAME_STATE.is_my_turn = false;
    // no capture possible
    KIAR_ARK.body = [...KIAR_ARK.body, { type: "movement", dat: normalMessageToKiarArk(message, res.dat.ciurl.filter(a => a).length) }];
  } else {
    eraseGuide();
    SELECTED_COORD_UI = null;
    const maybe_capture = updateField(message);

    console.log("drawField #", 10);
    drawField({ focus: GAME_STATE.last_move_focus });
    GAME_STATE.is_my_turn = false;
    KIAR_ARK.body = [...KIAR_ARK.body, {
      type: "movement",
      dat: normalMessageToKiarArk(message, res.dat.ciurl.filter(a => a).length),
      piece_capture_comment: toPieceCaptureComment(maybe_capture)
    }];
  }
}

/// HOPEFULLY, This function sets `GAME_STATE.last_move_focus` appropriately.
function updateFieldAfterHalfAcceptance(
  message: AfterHalfAcceptance,
  src: Coord,
  step: Coord,
): CaptureInfo {
  console.log(src, step);
  if (message.dest === null) {
    cancelStepping();
    console.log("lone assignment to last_move_focus, #", 0);
    GAME_STATE.last_move_focus = src;
    return null; // cancelled; no capture was made
  }

  const [dest_i, dest_j] = fromAbsoluteCoord(message.dest);

  // GAME_STATE.f.currentBoard[src_i][src_j] has already become a phantom.
  const backup: [Coord, Piece] = GAME_STATE.backupDuringStepping!;
  const piece: Piece = backup[1];

  cancelStepping(); // this will now restore GAME_STATE.f.currentBoard[src_i][src_j]

  const [src_i, src_j] = src;
  const [step_i, step_j] = step;
  if (GAME_STATE.f.currentBoard[step_i][step_j] === null) {
    throw new Error("step is unoccupied");
  }

  const destPiece: Piece | null = GAME_STATE.f.currentBoard[dest_i][dest_j];

  /* it's possible that you are returning to the original position, in which case you don't do anything */
  if (coordEq([src_i, src_j], [dest_i, dest_j])) {
    console.log("lone assignment to last_move_focus, #", 1);
    GAME_STATE.last_move_focus = [src_i, src_j];
    return null; // no capture was made
  }

  if (destPiece !== null) {
    takeTheDownwardPieceAndCheckHand(destPiece);
  }

  GAME_STATE.f.currentBoard[src_i][src_j] = null;
  GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
  console.log("lone assignment to last_move_focus, #", 2);
  GAME_STATE.last_move_focus = [dest_i, dest_j];
  return toColorProf(destPiece)
}

/**
 * Unsafe function.
 * @param destPiece Assumed to be downward; if not, an error is thrown
 */
function takeTheDownwardPieceAndCheckHand(destPiece: Piece) {
  const flipped: NonTam2PieceUpward = (() => {
    if (destPiece === "Tam2") {
      throw new Error("dest is occupied by Tam2");
    } else if (destPiece.side === Side.Upward) {
      throw new Error("dest is occupied by an ally");
    } else if (destPiece.side === Side.Downward) {
      const flipped: NonTam2PieceUpward = {
        color: destPiece.color,
        prof: destPiece.prof,
        side: Side.Upward,
      };
      return flipped;
    } else {
      const _should_not_reach_here: never = destPiece.side;
      throw new Error("should not reach here");
    }
  })();

  const old_state = calculateHandsAndScore(GAME_STATE.f.hop1zuo1OfUpward);
  GAME_STATE.f.hop1zuo1OfUpward.push(flipped);
  const new_state = calculateHandsAndScore(GAME_STATE.f.hop1zuo1OfUpward);

  if (new_state.score === old_state.score) {
    return;
  }

  setTimeout(() => {
    drawScoreDisplay(new_state.hands);

    const base_score: number = new_state.score;
    const score_display = document.getElementById("score_display")!;

    const ty_mok1_button = createImageButton("再行", 0);
    ty_mok1_button.addEventListener("click", async () => {
      increaseRateAndAnimate(true);
      const res: { legal: boolean } = await sendStuffTo<
        boolean,
        { legal: boolean }
      >("whethertymok", "`send whether ty mok1`", true, response => {
        console.log("Success; the server returned:", JSON.stringify(response));
        return response;
      });
      if (res.legal !== true) {
        throw new Error("bad!!!!");
      }
      KIAR_ARK.body = [...KIAR_ARK.body, { type: "tymoktaxot", dat: `或為${new_state.hands.join("加")}\n再行` }]
    });
    score_display.appendChild(ty_mok1_button);

    const ta_xot1_button = createImageButton("終季", 250);
    ta_xot1_button.addEventListener("click", async () => {
      const res: {
        legal: boolean;
        is_first_move_my_move: boolean | null;
      } = await sendStuffTo<
        boolean,
        { legal: boolean; is_first_move_my_move: boolean | null }
      >("whethertymok", "`send whether ty mok1`", false, response => {
        console.log("Success; the server returned:", JSON.stringify(response));
        return response;
      });
      if (res.legal !== true) {
        throw new Error("bad!!!!");
      }
      const is_first_move_my_move_in_the_next_season: boolean | null =
        res.is_first_move_my_move;
      const season_that_has_just_ended = ["春", "夏", "秋", "冬"][GAME_STATE.season]; // GAME_STATE.season gets updated on the following call of `endSeason`, so we must store the previous value
      endSeason(base_score, is_first_move_my_move_in_the_next_season);
      KIAR_ARK.body = [...KIAR_ARK.body, { type: "tymoktaxot", dat: `或為${new_state.hands.join("加")}而手${toDigitsLinzklar(base_score * Math.pow(2, GAME_STATE.log2_rate)).join("")}\n終季\t${season_that_has_just_ended}終` }]
    });
    score_display.appendChild(ta_xot1_button);
  }, 1000 * 0.8093);
  stopPolling();
}

export function calculateHandsAndScore(pieces: NonTam2Piece[]) {
  const hop1zuo1: ObtainablePieces[] = pieces.map(p =>
    toObtainablePiece(p.color, p.prof),
  );
  const res = calculate_hands_and_score_from_pieces(hop1zuo1);
  if (res.error === true) {
    throw new Error(`should not happen: too many of ${res.too_many.join(",")}`);
  }

  return { hands: res.hands, score: res.score };
}

function toObtainablePiece(color: Color, prof: Profession): ObtainablePieces {
  const a: ObtainablePieces[][] = [
    [
      "赤船",
      "赤兵",
      "赤弓",
      "赤車",
      "赤虎",
      "赤馬",
      "赤筆",
      "赤巫",
      "赤将",
      "赤王",
    ],
    [
      "黒船",
      "黒兵",
      "黒弓",
      "黒車",
      "黒虎",
      "黒馬",
      "黒筆",
      "黒巫",
      "黒将",
      "黒王",
    ],
  ];
  return a[color][prof];
}

/// This function also sets `GAME_STATE.last_move_focus` appropriately.
function updateField(message: NormalMove): CaptureInfo {
  if (message.type === "NonTamMove") {
    if (message.data.type === "FromHand") {
      const k: {
        type: "FromHand";
        color: Color;
        prof: Profession;
        dest: AbsoluteCoord;
      } = message.data;

      // remove the corresponding one from hand
      const ind = GAME_STATE.f.hop1zuo1OfUpward.findIndex(
        piece => piece.color === k.color && piece.prof === k.prof,
      );
      if (ind === -1) {
        throw new Error("What should exist in the hand does not exist");
      }
      const [removed_from_hop1zuo1] = GAME_STATE.f.hop1zuo1OfUpward.splice(ind, 1);

      // add the removed piece to the destination
      const [i, j] = fromAbsoluteCoord(k.dest);
      if (GAME_STATE.f.currentBoard[i][j] !== null) {
        throw new Error("Trying to parachute the piece onto an occupied space");
      }

      GAME_STATE.f.currentBoard[i][j] = removed_from_hop1zuo1;
      console.log("lone assignment to last_move_focus, #", 3);
      GAME_STATE.last_move_focus = [i, j];
      return null; // no capture possible
    } else if (message.data.type === "SrcDst") {
      const k: {
        type: "SrcDst";
        src: AbsoluteCoord;
        dest: AbsoluteCoord;
      } = message.data;

      const [src_i, src_j] = fromAbsoluteCoord(k.src);
      const [dest_i, dest_j] = fromAbsoluteCoord(k.dest);

      const piece: Piece | null = GAME_STATE.f.currentBoard[src_i][src_j];
      if (piece === null) {
        throw new Error("src is unoccupied");
      }

      const destPiece: Piece | null = GAME_STATE.f.currentBoard[dest_i][dest_j];

      /* it's NOT possible that you are returning to the original position, in which case you don't do anything */

      if (destPiece !== null) {
        takeTheDownwardPieceAndCheckHand(destPiece);
      }

      GAME_STATE.f.currentBoard[src_i][src_j] = null;
      GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
      console.log("lone assignment to last_move_focus, #", 4);
      GAME_STATE.last_move_focus = [dest_i, dest_j];
      return toColorProf(destPiece);
    } else if (message.data.type === "SrcStepDstFinite") {
      const k: {
        type: "SrcStepDstFinite";
        src: AbsoluteCoord;
        step: AbsoluteCoord;
        dest: AbsoluteCoord;
      } = message.data;

      const [src_i, src_j] = fromAbsoluteCoord(k.src);
      const [dest_i, dest_j] = fromAbsoluteCoord(k.dest);

      // GAME_STATE.f.currentBoard[src_i][src_j] has already become a phantom.

      const backup: [Coord, Piece] = GAME_STATE.backupDuringStepping!;

      const piece: Piece = backup[1];

      cancelStepping();

      // this will now restore GAME_STATE.f.currentBoard[src_i][src_j]

      const [step_i, step_j] = fromAbsoluteCoord(k.step);
      if (GAME_STATE.f.currentBoard[step_i][step_j] === null) {
        throw new Error("step is unoccupied");
      }

      const destPiece: Piece | null = GAME_STATE.f.currentBoard[dest_i][dest_j];

      /* it's possible that you are returning to the original position, in which case you don't do anything */
      if (coordEq([src_i, src_j], [dest_i, dest_j])) {
        // BUT! you have to update the last_move_focus
        GAME_STATE.last_move_focus = [dest_i, dest_j];
        console.log("lone assignment to last_move_focus, #", 4.5);
        return null; // no capture
      }

      if (destPiece !== null) {
        takeTheDownwardPieceAndCheckHand(destPiece);
      }

      GAME_STATE.f.currentBoard[src_i][src_j] = null;
      GAME_STATE.f.currentBoard[dest_i][dest_j] = piece;
      GAME_STATE.last_move_focus = [dest_i, dest_j];
      console.log("lone assignment to last_move_focus, #", 5);
      return toColorProf(destPiece);
    } else {
      const _should_not_reach_here: never = message.data;
      throw new Error("should not reach here")
    }
  } else if (message.type === "TamMove") {
    const k = message;
    const [firstDest_i, firstDest_j] = fromAbsoluteCoord(k.firstDest);
    const [secondDest_i, secondDest_j] = fromAbsoluteCoord(k.secondDest);
    if (message.stepStyle === "StepsDuringLatter") {
      // We decided that Tam2 should not be present on the board if it is StepsDuringLatter
      GAME_STATE.f.currentBoard[secondDest_i][secondDest_j] = "Tam2";
      GAME_STATE.last_move_focus = [secondDest_i, secondDest_j];
      console.log("lone assignment to last_move_focus, #", 6);
      return null; // no capture possible
    }

    // If not StepsDuringLatter, we decided that the piece should actually be located in firstDest after the first move
    const piece: Piece | null =
      GAME_STATE.f.currentBoard[firstDest_i][firstDest_j];
    if (piece === null) {
      throw new Error("firstDest is unoccupied");
    }

    if (piece !== "Tam2") {
      throw new Error("TamMove but not Tam2");
    }

    /* it's possible that you are returning to the original position, in which case you don't do anything */
    if (coordEq([firstDest_i, firstDest_j], [secondDest_i, secondDest_j])) {
      GAME_STATE.last_move_focus = [secondDest_i, secondDest_j];
      console.log("lone assignment to last_move_focus, #", 7);
      return null; // no capture possible in TamMove
    }

    GAME_STATE.f.currentBoard[firstDest_i][firstDest_j] = null;
    GAME_STATE.f.currentBoard[secondDest_i][secondDest_j] = piece;
    GAME_STATE.last_move_focus = [secondDest_i, secondDest_j];
    console.log("lone assignment to last_move_focus, #", 8);
    return null; // no capture possible in TamMove
  } else {
    const _should_not_reach_here: never = message;
    throw new Error("should not reach here")
  }
}

function getThingsGoingAfterAGuideIsClicked(
  piece_to_move: "Tam2" | NonTam2PieceUpward,
  from: Coord,
  to: Coord,
  ask_whether_to_step: boolean,
) {
  const destPiece: "Tam2" | null | NonTam2Piece =
    GAME_STATE.f.currentBoard[to[0]][to[1]];

  if (destPiece == null) {
    // dest is empty square; try to simply move
    let message: NormalMove;

    if (piece_to_move !== "Tam2") {
      const abs_src: AbsoluteCoord = toAbsoluteCoord(from);
      const abs_dst: AbsoluteCoord = toAbsoluteCoord(to);
      message = {
        type: "NonTamMove",
        data: {
          type: "SrcDst",
          src: abs_src,
          dest: abs_dst,
        },
      };

      sendNormalMessage(message);
      return;
    } else {
      afterFirstTamMove(from, to);
      return;
    }
  }

  // dest is not an empty square; it is always possible to step

  if (
    !canGetOccupiedBy(
      Side.Upward,
      to,
      piece_to_move,
      GAME_STATE.f.currentBoard,
      GAME_STATE.tam_itself_is_tam_hue,
    )
  ) {
    // can step, but cannot take
    stepping(from, piece_to_move, to);
    return;
  }

  // short-circuit evaluation
  if (ask_whether_to_step && confirm(DICTIONARY.ja.whetherToTake)) {
    const abs_src: AbsoluteCoord = toAbsoluteCoord(from);
    const abs_dst: AbsoluteCoord = toAbsoluteCoord(to);
    const message: NormalNonTamMove = {
      type: "NonTamMove",
      data: {
        type: "SrcDst",
        src: abs_src,
        dest: abs_dst,
      },
    };

    sendNormalMessage(message);
    return;
  } else {
    stepping(from, piece_to_move, to);
    return;
  }
}

function isTamAt(step: Coord): boolean {
  const [i, j] = step;
  return GAME_STATE.f.currentBoard[i][j] === "Tam2";
}

function getThingsGoingAfterStepping_Finite(
  src: Coord,
  step: Coord,
  piece: Piece,
  dest: Coord,
) {
  if (piece === "Tam2") {
    afterFirstTamMove(src, dest, step);
    return;
  }

  const message: NormalNonTamMove = {
    type: "NonTamMove",
    data: {
      type: "SrcStepDstFinite",
      step: toAbsoluteCoord(step),
      dest: toAbsoluteCoord(dest),
      src: toAbsoluteCoord(src),
    },
  };

  if (!isTamAt(step)) {
    sendNormalMessage(message);
  } else {
    (async () => {
      await animateStepTamLogo();
      await animatePunishStepTamAndCheckPerzej(Side.Upward);
      await sendNormalMessage(message);
    })();
  }
  return;
}

function filterInOneDirectionTillCiurlLimit(
  guideListGreen: Coord[],
  step: Coord,
  plannedDirection: Coord,
  ciurl: Ciurl,
) {
  return guideListGreen.filter((c: Coord) => {
    const subtractStep = function ([x, y]: Coord): [number, number] {
      const [step_x, step_y] = step;
      return [x - step_x, y - step_y];
    };

    const limit: number = ciurl.filter(x => x).length;

    const [deltaC_x, deltaC_y] = subtractStep(c);
    const [deltaPlan_x, deltaPlan_y] = subtractStep(plannedDirection);

    return (
      // 1. (c - step) crossed with (plannedDirection - step) gives zero
      deltaC_x * deltaPlan_y - deltaPlan_x * deltaC_y === 0 &&
      // 2.  (c - step) dotted with (plannedDirection - step) gives positive
      deltaC_x * deltaPlan_x + deltaC_y * deltaPlan_y > 0 &&
      // 3. deltaC must not exceed the limit enforced by ciurl
      Math.max(Math.abs(deltaC_x), Math.abs(deltaC_y)) <= limit
    );
  });
}

async function sendInfAfterStep(message: InfAfterStep, o: { color: Color, prof: Profession }) {
  const res = await sendStuff<InfAfterStep, Ret_InfAfterStep>(
    "inf after step",
    message,
    response => {
      console.log("Success; the server returned:", JSON.stringify(response));
      return response;
    },
  );

  if (!res.legal) {
    alert(`Illegal API sent, the reason being ${res.whyIllegal}`);
    throw new Error(`Illegal API sent, the reason being ${res.whyIllegal}`);
  }

  if (isTamAt(fromAbsoluteCoord(message.step))) {
    await animateStepTamLogo();
    await animatePunishStepTamAndCheckPerzej(Side.Upward);
  }

  drawCiurlWithAudio(res.ciurl);

  document.getElementById("cancelButton")!.remove(); // destroy the cancel button, since it can no longer be cancelled

  eraseGuide(); // this removes the central guide, as well as the yellow and green ones

  const step: Coord = fromAbsoluteCoord(message.step);
  const plannedDirection: Coord = fromAbsoluteCoord(message.plannedDirection);
  // recreate the selection node, but this time it is not clickable and hence not deletable
  const centralNode = createPieceSizeImageOnBoardByPath_Shifted(
    step,
    "selection2",
    "selection",
  );
  centralNode.style.zIndex = "200";

  const contains_guides = document.getElementById("contains_guides")!;
  contains_guides.appendChild(centralNode);

  const piece: NonTam2PieceUpward = {
    color: o.color,
    prof: o.prof,
    side: Side.Upward,
  };

  // now re-add the green candidates in only one direction.

  // first, get all the green candidates;
  const { infinite: guideListGreen } = calculateMovablePositions(
    step,
    piece,
    GAME_STATE.f.currentBoard,
    GAME_STATE.tam_itself_is_tam_hue,
  );

  // then filter the result
  const filteredList = filterInOneDirectionTillCiurlLimit(
    guideListGreen,
    step,
    plannedDirection,
    res.ciurl,
  );

  const src: Coord = fromAbsoluteCoord(message.src);

  const passer = createGuideImageAt(src, "yellow_circle");
  passer.addEventListener("click", function (ev) {
    eraseGuide();
    sendAfterHalfAcceptance(
      {
        type: "AfterHalfAcceptance",
        dest: null,
      },
      {
        src,
        step,
        stepping_ciurl: res.ciurl,
        planned_destination: message.plannedDirection
      }
    );
  });
  passer.style.zIndex = "200";
  contains_guides.appendChild(passer);

  for (let ind = 0; ind < filteredList.length; ind++) {
    const dest: Coord = filteredList[ind];
    if (coordEq(src, dest)) {
      continue; // yellow takes precedence over green
    }

    // cannot step twice
    if (
      !canGetOccupiedByNonTam(
        Side.Upward,
        dest,
        GAME_STATE.f.currentBoard,
        GAME_STATE.tam_itself_is_tam_hue,
      )
    ) {
      continue;
    }

    const img = createGuideImageAt(filteredList[ind], "green_circle");

    img.addEventListener("click", function (ev) {
      sendAfterHalfAcceptance(
        {
          type: "AfterHalfAcceptance",
          dest: toAbsoluteCoord(dest),
        },
        {
          src,
          step,
          stepping_ciurl: res.ciurl,
          planned_destination: message.plannedDirection
        }
      );
    });

    img.style.zIndex = "200";
    contains_guides.appendChild(img);
  }
}

export function drawCiurlWithAudio(ciurl: Ciurl, side?: Side) {
  drawCiurl(ciurl, side);
  if (KRUT_CRUOP) {
    const ciurl_sound = new Audio("sound/ciurl4.ogg");
    ciurl_sound.play();
  }
}

function display_guides_after_stepping(
  coord: Coord,
  q: { piece: Piece; path: "yellow_circle" } | { piece: NonTam2Piece; path: "green_circle" },
  parent: HTMLElement,
  list: Coord[],
): void {
  const src = SELECTED_COORD_UI;

  if (src == null) {
    throw new Error("though stepping, null startpoint!!!!!");
  } else if (src[0] === "Hop1zuo1") {
    throw new Error("though stepping, hop1zuo1 startpoint!!!!!");
  }

  for (let ind = 0; ind < list.length; ind++) {
    // Since you cannot step twice, the destination must be occupiable, that is, either empty or opponent's unprotected piece.
    if (
      !canGetOccupiedBy(
        Side.Upward,
        list[ind],
        q.piece,
        GAME_STATE.f.currentBoard,
        GAME_STATE.tam_itself_is_tam_hue,
      )
    ) {
      const [i, j] = list[ind];
      const destPiece = GAME_STATE.f.currentBoard[i][j];
      
      // If it is protected, display the fact that it is protected
      // Why should a piece belonging to an opponent (Side.Downward) give false for `canGetOccupiedBy`?
      // Why can't I take an opponent's piece? 
      // it is either:
      // 1. because of tam2 hue a uai1
      // 2. because I am moving a Tam2, a piece that cannot capture a piece
      if (q.piece !== "Tam2" && destPiece !== "Tam2" && destPiece !== null && destPiece.side === Side.Downward) {
        // show that it is protected
        const protected_by_tam2_hue_a_uai1 = createGuideImageAt(list[ind], "守");
        protected_by_tam2_hue_a_uai1.style.zIndex = "200";
        parent.append(protected_by_tam2_hue_a_uai1)
      }
      continue;
    }

    const img = createGuideImageAt(list[ind], q.path);

    img.addEventListener(
      "click",
      q.path === "yellow_circle"
        ? function () {
          eraseGuide();
          getThingsGoingAfterStepping_Finite(src, coord, q.piece, list[ind]);
        }
        : function () {
          eraseGuide();
          sendInfAfterStep({
            type: "InfAfterStep",
            step: toAbsoluteCoord(coord),
            plannedDirection: toAbsoluteCoord(list[ind]),
            src: toAbsoluteCoord(src),
          }, {
            color: q.piece.color,
            prof: q.piece.prof,
          });
        },
    );

    img.style.zIndex = "200";
    parent.appendChild(img);
  }
}

function display_guides_before_stepping(
  coord: Coord,
  piece: "Tam2" | NonTam2PieceUpward,
  parent: HTMLElement,
  list: Coord[],
) {
  for (let ind = 0; ind < list.length; ind++) {
    // draw the yellow guides
    const img = createGuideImageAt(list[ind], "yellow_circle");

    // click on it to get things going
    img.addEventListener("click", function () {
      eraseGuide();
      getThingsGoingAfterAGuideIsClicked(
        piece,
        coord,
        list[ind],
        /* ask whether to step, when clicked */ true,
      );
    });

    img.addEventListener("contextmenu", function (e) {
      eraseGuide();
      e.preventDefault();
      getThingsGoingAfterAGuideIsClicked(
        piece,
        coord,
        list[ind],
        /* when right-clicked, default to step */ false,
      );
    });

    parent.appendChild(img);
  }
}

export function selectOwnPieceOnBoard(
  coord: Coord,
  piece: "Tam2" | NonTam2PieceUpward,
) {
  /* erase the guide in all cases, since the guide also contains the selectedness of Hop1zuo1 */
  eraseGuide();

  if (
    SELECTED_COORD_UI == null ||
    SELECTED_COORD_UI[0] === "Hop1zuo1" ||
    !coordEq(SELECTED_COORD_UI, coord)
  ) {
    SELECTED_COORD_UI = coord;

    const contains_guides = document.getElementById("contains_guides")!;

    const centralNode = createPieceSizeImageOnBoardByPath(
      coord,
      "selection2",
      "selection",
    );
    centralNode.style.cursor = "pointer";

    // click on it to erase
    centralNode.addEventListener("click", function () {
      eraseGuide();
      SELECTED_COORD_UI = null;
    });

    contains_guides.appendChild(centralNode);

    const {
      finite: guideListFinite,
      infinite: guideListInfinite,
    } = calculateMovablePositions(
      coord,
      piece,
      GAME_STATE.f.currentBoard,
      GAME_STATE.tam_itself_is_tam_hue,
    );

    display_guides_before_stepping(coord, piece, contains_guides, [
      ...guideListFinite,
      ...guideListInfinite,
    ]);
  } else {
    /* Clicking what was originally selected will make it deselect */
    SELECTED_COORD_UI = null;
  }
}

/**
 * @param ind how many-th hop1 zuo1? / 左から何番目(0始まり)の手駒であるかを指定
 * @param piece the piece / 駒
 * @param list_length how many hop1 zuo1 there are in total on one side / 片側の手駒の個数
 */
export function selectOwnPieceOnHop1zuo1(ind: number, piece: NonTam2Piece, list_length: number) {
  // erase the existing guide in all circumstances
  eraseGuide();

  if (
    SELECTED_COORD_UI == null ||
    SELECTED_COORD_UI[0] !== "Hop1zuo1" ||
    SELECTED_COORD_UI[1] !== ind
  ) {
    SELECTED_COORD_UI = ["Hop1zuo1", ind];

    const contains_guides_on_upward = document.getElementById(
      "contains_guides_on_upward",
    )!;
    const centralNode = createPieceSizeImageOnBoardByPathAndXY(
      1 + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
      hop1_zuo1_left_position({ ind, list_length }),
      "selection2",
      "selection",
    );

    centralNode.style.cursor = "pointer";

    // click on it to erase
    centralNode.addEventListener("click", function () {
      eraseGuide();
      SELECTED_COORD_UI = null;
    });
    contains_guides_on_upward.appendChild(centralNode);

    const contains_guides = document.getElementById("contains_guides")!;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const ij: Coord = [i as BoardIndex, j as BoardIndex];

        // skip if already occupied
        if (GAME_STATE.f.currentBoard[i][j] != null) {
          continue;
        }

        // draw the yellow guides
        const img = createGuideImageAt(ij, "yellow_circle");

        // click on it to get things going
        img.addEventListener("click", function () {
          eraseGuide();
          const dest = GAME_STATE.f.currentBoard[ij[0]][ij[1]];

          if (dest != null) {
            alert("Cannot parachute onto an occupied square");
            throw new Error("Cannot parachute onto an occupied square");
          }

          const abs_dst: AbsoluteCoord = toAbsoluteCoord(ij);
          const message: NormalNonTamMove = {
            type: "NonTamMove",
            data: {
              type: "FromHand",
              color: piece.color,
              prof: piece.prof,
              dest: abs_dst,
            },
          };

          sendNormalMessage(message);
        });

        contains_guides.appendChild(img);
      }
    }
  } else {
    /* re-click: deselect */
    SELECTED_COORD_UI = null;
  }
}

export function increaseRateAndAnimate(done_by_me: boolean) {
  const score_display = document.getElementById("score_display")!;
  score_display.classList.add("nocover");
  // the score display has ended; move the yaku_all back to `left: 750px`
  document.getElementById("yaku_all")!.style.left = "750px";
  const orig_log2_rate = GAME_STATE.log2_rate;
  const log2RateProgressMap: { [P in Log2_Rate]: Log2_Rate } = {
    0: 1,
    1: 2,
    2: 3,
    3: 4,
    4: 5,
    5: 6,
    6: 6, // does not go beyond x64, because the total score is 40
  };
  drawMak2Io1(); // cargo cult
  GAME_STATE.log2_rate = log2RateProgressMap[orig_log2_rate];

  const denote_rate = document.getElementById("denote_rate")!;
  setTimeout(async () => {
    denote_rate.style.display = "block";
    await new Promise(resolve => setTimeout(resolve, 200 * 0.8093));
    await animateNode(
      denote_rate,
      1000 * 0.8093,
      {
        to: getDenoteRateNodeTopLeft(GAME_STATE.log2_rate),
        from: getDenoteRateNodeTopLeft(orig_log2_rate)
      },
    );
    await new Promise(resolve => setTimeout(resolve, 500 * 0.8093));
    drawMak2Io1();
    if (done_by_me) {
      resumePolling();
    } else {
      GAME_STATE.is_my_turn = true;
    }

    document
      .getElementById("protective_cover_over_field_while_asyncawait")!
      .classList.add("nocover");
  }, 200 * 0.8093);
}

/**
 * Group up all the kut2 tam2 to display neatly.
 * @param is_final_cause_kuttam
 * @param scores_of_each_season
 */
function cleanupScoresOfEachSeason(
  is_final_cause_kuttam: boolean,
  scores_of_each_season: [number[], number[], number[], number[]],
): ArrayUpTo4<[number] | [number, number]> {
  const cleanup_ending_in_kuttam: (
    each_season: number[],
  ) => [number] | [number, number] = (each_season: number[]) => {
    return [each_season.reduce((a, b) => a + b, 0)];
  };
  const cleanup_not_ending_in_kuttam: (
    each_season: number[],
  ) => [number] | [number, number] = (each_season: number[]) => {
    return [
      each_season.slice(0, -1).reduce((a, b) => a + b, 0),
      each_season[each_season.length - 1],
    ];
  };

  const cleanup_final_season = is_final_cause_kuttam
    ? cleanup_ending_in_kuttam
    : cleanup_not_ending_in_kuttam;

  if (scores_of_each_season[0].length === 0) {
    throw new Error("why did the game end without any movement of points?");
  } else if (scores_of_each_season[1].length === 0) {
    return [cleanup_final_season(scores_of_each_season[0])];
  } else if (scores_of_each_season[2].length === 0) {
    return [
      cleanup_not_ending_in_kuttam(scores_of_each_season[0]),
      cleanup_final_season(scores_of_each_season[1]),
    ];
  } else if (scores_of_each_season[3].length === 0) {
    return [
      cleanup_not_ending_in_kuttam(scores_of_each_season[0]),
      cleanup_not_ending_in_kuttam(scores_of_each_season[1]),
      cleanup_final_season(scores_of_each_season[2]),
    ];
  } else {
    return [
      cleanup_not_ending_in_kuttam(scores_of_each_season[0]),
      cleanup_not_ending_in_kuttam(scores_of_each_season[1]),
      cleanup_not_ending_in_kuttam(scores_of_each_season[2]),
      cleanup_final_season(scores_of_each_season[3]),
    ];
  }
}

function perzej(
  msg: "you win!" | "you lose..." | "draw",
  is_cause_kuttam: boolean,
) {
  drawFinalScoreDisplay(
    cleanupScoresOfEachSeason(
      is_cause_kuttam,
      GAME_STATE.scores_of_each_season,
    ),
  );

  // show both sides' icon
  document.getElementById("my_icon")!.style.opacity = "1";
  document.getElementById("larta_opponent")!.style.opacity = "1";
  document.getElementById("opponent_message")!.textContent =
    msg === "you win!" ? DICTIONARY.ja.gameResult.victory :
      msg === "draw" ? DICTIONARY.ja.gameResult.draw : DICTIONARY.ja.gameResult.loss
  document.getElementById("opponent_message_linzklar")!.textContent =
    msg === "you win!" ? GAME_END_LINZKLAR.victory :
      msg === "draw" ? GAME_END_LINZKLAR.draw : GAME_END_LINZKLAR.loss;

  KIAR_ARK.body = [...KIAR_ARK.body, { type: "tymoktaxot", dat: "星一周" }];
  KIAR_ARK.header = [...KIAR_ARK.header, { type: "header", dat: `{終時:${(new Date()).toISOString()}}` }];
}

export async function animatePunishStepTamAndCheckPerzej(side: Side) {
  const score_display = document.getElementById("score_display")!;
  score_display.classList.add("nocover");
  // the score display has ended; move the yaku_all back to `left: 750px`
  document.getElementById("yaku_all")!.style.left = "750px";
  const denote_score = document.getElementById("denote_score")!;
  const orig_score = GAME_STATE.my_score;
  GAME_STATE.my_score +=
    (side === Side.Upward ? -5 : 5) * Math.pow(2, GAME_STATE.log2_rate);

  await new Promise(resolve => setTimeout(resolve, 200 * 0.8093));

  await animateNode(
    denote_score,
    1000 * 0.8093,
    {
      to: getDenoteScoreNodeTopLeft(GAME_STATE.my_score),
      from: getDenoteScoreNodeTopLeft(orig_score)
    },
  );

  if (GAME_STATE.my_score >= 40) {
    perzej("you win!", true);
    document
      .getElementById("protective_cover_over_field_while_waiting_for_opponent")
      ?.classList.remove("nocover");
    return;
  } else if (GAME_STATE.my_score <= 0) {
    perzej("you lose...", true);
    document
      .getElementById("protective_cover_over_field_while_waiting_for_opponent")
      ?.classList.remove("nocover");
    return;
  }
  await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));
  drawMak2Io1();

  await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));
  document
    .getElementById("protective_cover_over_field")
    ?.classList.add("nocover");
  document
    .getElementById("protective_tam_cover_over_field")
    ?.classList.add("nocover");

  document
    .getElementById("protective_cover_over_field_while_asyncawait")
    ?.classList.add("nocover");
}

export function endSeason(
  base_score: number,
  is_first_move_my_move_in_the_next_season: boolean | null,
) {
  const score_display = document.getElementById("score_display")!;
  score_display.classList.add("nocover");
  // the score display has ended; move the yaku_all back to `left: 750px`
  document.getElementById("yaku_all")!.style.left = "750px";
  const denote_season = document.getElementById("denote_season")!;
  const denote_score = document.getElementById("denote_score")!;
  const orig_score = GAME_STATE.my_score;
  const orig_season = GAME_STATE.season;
  GAME_STATE.my_score += base_score * Math.pow(2, GAME_STATE.log2_rate);

  const seasonProgressMap: { [P in Season]: Season | null } = {
    0: 1,
    1: 2,
    2: 3,
    3: null,
  };
  const new_season = seasonProgressMap[orig_season];
  if (new_season == null) {
    setTimeout(async () => {
      await animateNode(
        denote_score,
        1000 * 0.8093,
        {
          to: getDenoteScoreNodeTopLeft(GAME_STATE.my_score),
          from: getDenoteScoreNodeTopLeft(orig_score)
        },
      );

      alert(DICTIONARY.ja.gameEnd);

      if (GAME_STATE.my_score > 20) {
        perzej("you win!", false);
        return;
      } else if (GAME_STATE.my_score < 20) {
        perzej("you lose...", false);
        return;
      } else {
        perzej("draw", false);
        return;
      }
    }, 200 * 0.8093);
    return;
  }

  GAME_STATE.season = new_season;
  setTimeout(async () => {
    await animateNode(
      denote_score,
      1000 * 0.8093,
      {
        to: getDenoteScoreNodeTopLeft(GAME_STATE.my_score),
        from: getDenoteScoreNodeTopLeft(orig_score)
      },
    );

    if (GAME_STATE.my_score >= 40) {
      perzej("you win!", false);
      return;
    } else if (GAME_STATE.my_score <= 0) {
      perzej("you lose...", false);
      return;
    }
    await animateNode(
      denote_season,
      700 * 0.8093,
      {
        to: getDenoteSeasonNodeTopLeft(GAME_STATE.season),
        from: getDenoteSeasonNodeTopLeft(orig_season)
      },
    );
    await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));
    drawMak2Io1();
    alert(DICTIONARY.ja.newSeason[GAME_STATE.season]);

    await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));
    document
      .getElementById("protective_cover_over_field")
      ?.classList.remove("nocover");
    document
      .getElementById("protective_tam_cover_over_field")
      ?.classList.remove("nocover");

    await new Promise(resolve => setTimeout(resolve, 4000 * 0.8093));

    GAME_STATE.f = {
      currentBoard: GAME_STATE.IA_is_down
        ? rotateBoard(rotateBoard(initial_board_with_IA_down))
        : rotateBoard(initial_board_with_IA_down),
      hop1zuo1OfDownward: [],
      hop1zuo1OfUpward: [],
    };

    // Reset the rate to 1x
    // レートを1倍へと戻す
    GAME_STATE.log2_rate = 0;
    // Re-render the Mak2Io1 to clear the rate-denoting dummy piece in the previous season
    // 直前の季節で生成されている可能性のある、レート表示用の駒を消すために値直を再描画する
    drawMak2Io1();

    allowPolling(); // reset another global state
    GAME_STATE.last_move_focus = null; /* the board is initialized; no focus */

    console.log("drawField #", 11);
    drawField({ focus: null }); /* the board is initialized; no focus */

    await new Promise(resolve => setTimeout(resolve, 300 * 0.8093));
    document
      .getElementById("protective_cover_over_field")
      ?.classList.add("nocover");
    document
      .getElementById("protective_tam_cover_over_field")
      ?.classList.add("nocover");

    GAME_STATE.is_my_turn = is_first_move_my_move_in_the_next_season!;
    document
      .getElementById("protective_cover_over_field_while_asyncawait")
      ?.classList.add("nocover");
  }, 200 * 0.8093);
}
