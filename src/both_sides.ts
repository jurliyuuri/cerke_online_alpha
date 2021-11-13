////////////////////////////////////////////////////////
/// This file is supposed to contain functions       ///
/// that both main.ts and opponent_move.ts depend on ///
////////////////////////////////////////////////////////

import {
  GAME_STATE,
  initial_board_with_IA_down,
} from "./game_state";
import {
  allowMainPolling,
  sendMainPollAndDoEverythingThatFollows,
} from "./opponent_move";
import {
  Side,
  NonTam2Piece,
  rotateBoard,
} from "cerke_online_utility/lib";
import {
  Profession,
  Color,
  Season,
  Log2_Rate,
} from "cerke_online_api";
import {
  getDenoteRateNodeTopLeft,
  getDenoteScoreNodeTopLeft,
  getDenoteSeasonNodeTopLeft,
} from "./html_top_left";
import { DICTIONARY, GAME_END_LINZKLAR } from "./dictionary";
import { API_ORIGIN } from "./env";
import {
  drawFinalScoreDisplay,
  ArrayUpTo4,
} from "./score_display";
import {
  ObtainablePieces,
  calculate_hands_and_score_from_pieces,
} from "cerke_hands_and_score";
import { KIAR_ARK } from "./kiar_ark";
import {
  animateNode,
  drawField,
  drawMak2Io1,
} from "./draw_erase_animate";

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
    msg === "you win!"
      ? DICTIONARY.ja.gameResult.victory
      : msg === "draw"
        ? DICTIONARY.ja.gameResult.draw
        : DICTIONARY.ja.gameResult.loss;
  document.getElementById("opponent_message_linzklar")!.textContent =
    msg === "you win!"
      ? GAME_END_LINZKLAR.victory
      : msg === "draw"
        ? GAME_END_LINZKLAR.draw
        : GAME_END_LINZKLAR.loss;

  KIAR_ARK.body = [...KIAR_ARK.body, { type: "tymoktaxot", dat: "星一周" }];
  KIAR_ARK.header = [
    ...KIAR_ARK.header,
    { type: "header", dat: `{終時:${new Date().toISOString()}}` },
  ];
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

  await new Promise((resolve) => setTimeout(resolve, 200 * 0.8093));

  await animateNode(denote_score, 1000 * 0.8093, {
    to: getDenoteScoreNodeTopLeft(GAME_STATE.my_score),
    from: getDenoteScoreNodeTopLeft(orig_score),
  });

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
  await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
  drawMak2Io1();

  await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
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


export function calculateHandsAndScore(pieces: NonTam2Piece[]) {
  function toObtainablePiece(color: Color, prof: Profession): ObtainablePieces {
    const a: ObtainablePieces[][] = [
      [
        "赤船", "赤兵", "赤弓", "赤車", "赤虎", "赤馬", "赤筆", "赤巫", "赤将", "赤王",
      ],
      [
        "黒船", "黒兵", "黒弓", "黒車", "黒虎", "黒馬", "黒筆", "黒巫", "黒将", "黒王",
      ],
    ];
    return a[color][prof];
  }

  const hop1zuo1: ObtainablePieces[] = pieces.map((p) =>
    toObtainablePiece(p.color, p.prof),
  );
  const res = calculate_hands_and_score_from_pieces(hop1zuo1);
  if (res.error === true) {
    throw new Error(`should not happen: too many of ${res.too_many.join(",")}`);
  }

  return { hands: res.hands, score: res.score };
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
    .then((res) => {
      cover_while_asyncawait.classList.add("nocover");
      return res.json();
    })
    .then(validateInput)
    .catch((error) => {
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
      await animateNode(denote_score, 1000 * 0.8093, {
        to: getDenoteScoreNodeTopLeft(GAME_STATE.my_score),
        from: getDenoteScoreNodeTopLeft(orig_score),
      });

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
    await animateNode(denote_score, 1000 * 0.8093, {
      to: getDenoteScoreNodeTopLeft(GAME_STATE.my_score),
      from: getDenoteScoreNodeTopLeft(orig_score),
    });

    if (GAME_STATE.my_score >= 40) {
      perzej("you win!", false);
      return;
    } else if (GAME_STATE.my_score <= 0) {
      perzej("you lose...", false);
      return;
    }
    await animateNode(denote_season, 700 * 0.8093, {
      to: getDenoteSeasonNodeTopLeft(GAME_STATE.season),
      from: getDenoteSeasonNodeTopLeft(orig_season),
    });
    await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
    drawMak2Io1();
    alert(DICTIONARY.ja.newSeason[GAME_STATE.season]);

    await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
    document
      .getElementById("protective_cover_over_field")
      ?.classList.remove("nocover");
    document
      .getElementById("protective_tam_cover_over_field")
      ?.classList.remove("nocover");

    await new Promise((resolve) => setTimeout(resolve, 4000 * 0.8093));

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

    allowMainPolling(); // reset another global state
    GAME_STATE.last_move_focus = null; /* the board is initialized; no focus */

    console.log("drawField #", 11);
    drawField({ focus: null }); /* the board is initialized; no focus */

    await new Promise((resolve) => setTimeout(resolve, 300 * 0.8093));
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
    await new Promise((resolve) => setTimeout(resolve, 200 * 0.8093));
    await animateNode(denote_rate, 1000 * 0.8093, {
      to: getDenoteRateNodeTopLeft(GAME_STATE.log2_rate),
      from: getDenoteRateNodeTopLeft(orig_log2_rate),
    });
    await new Promise((resolve) => setTimeout(resolve, 500 * 0.8093));
    drawMak2Io1();
    if (done_by_me) {
      allowMainPolling();
      setTimeout(sendMainPollAndDoEverythingThatFollows, 500 * 0.8093);
    } else {
      GAME_STATE.is_my_turn = true;
    }

    document
      .getElementById("protective_cover_over_field_while_asyncawait")!
      .classList.add("nocover");
  }, 200 * 0.8093);
}
