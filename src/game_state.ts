import {
  Side,
  NonTam2Piece,
  NonTam2PieceDownward,
  NonTam2PieceUpward,
  Piece,
  Board,
  Coord,
  rotateBoard,
} from "cerke_online_utility/lib";
import { AbsoluteCoord, Profession, Color } from "cerke_online_api";
import { sendMainPoll } from "./main";

export type Hop1Zuo1 = NonTam2Piece[];

export interface Field {
  currentBoard: Board;
  hop1zuo1OfUpward: NonTam2PieceUpward[];
  hop1zuo1OfDownward: NonTam2PieceDownward[];
}

export type Season = 0 | 1 | 2 | 3;
export type Log2_Rate = 0 | 1 | 2 | 3 | 4 | 5 | 6;
/*
 * Theoretically speaking, it is necessary to distinguish x32 and x64
 * because it is possible to score 1 point (3+3-5).
 * Not that it will ever be of use in any real situation.
 */

export interface GAME_STATE {
  f: Field;
  IA_is_down: boolean;
  tam_itself_is_tam_hue: boolean;
  is_my_turn: boolean;
  backupDuringStepping: null | [Coord, Piece];
  season: Season;
  my_score: number;
  log2_rate: Log2_Rate;
  opponent_has_just_moved_tam: boolean;
  scores_of_each_season: [number[], number[], number[], number[]];
  last_move_focus: Coord | null;
}

import { toAbsoluteCoord_, fromAbsoluteCoord_ } from "cerke_online_utility/lib";

export function toAbsoluteCoord(coord: Coord): AbsoluteCoord {
  return toAbsoluteCoord_(coord, GAME_STATE.IA_is_down);
}

export function fromAbsoluteCoord(abs: AbsoluteCoord): Coord {
  return fromAbsoluteCoord_(abs, GAME_STATE.IA_is_down);
}

export const initial_board_with_IA_down: Board = [
  [
    { color: Color.Huok2, prof: Profession.Kua2, side: Side.Downward },
    { color: Color.Huok2, prof: Profession.Maun1, side: Side.Downward },
    { color: Color.Huok2, prof: Profession.Kaun1, side: Side.Downward },
    { color: Color.Huok2, prof: Profession.Uai1, side: Side.Downward },
    { color: Color.Kok1, prof: Profession.Io, side: Side.Downward },
    { color: Color.Kok1, prof: Profession.Uai1, side: Side.Downward },
    { color: Color.Kok1, prof: Profession.Kaun1, side: Side.Downward },
    { color: Color.Kok1, prof: Profession.Maun1, side: Side.Downward },
    { color: Color.Kok1, prof: Profession.Kua2, side: Side.Downward },
  ],
  [
    { color: Color.Kok1, prof: Profession.Tuk2, side: Side.Downward },
    { color: Color.Kok1, prof: Profession.Gua2, side: Side.Downward },
    null,
    { color: Color.Kok1, prof: Profession.Dau2, side: Side.Downward },
    null,
    { color: Color.Huok2, prof: Profession.Dau2, side: Side.Downward },
    null,
    { color: Color.Huok2, prof: Profession.Gua2, side: Side.Downward },
    { color: Color.Huok2, prof: Profession.Tuk2, side: Side.Downward },
  ],
  [
    { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Downward },
    { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Downward },
    { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Downward },
    { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Downward },
    { color: Color.Kok1, prof: Profession.Nuak1, side: Side.Downward },
    { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Downward },
    { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Downward },
    { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Downward },
    { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Downward },
  ],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, "Tam2", null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [
    { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward },
    { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward },
    { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward },
    { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward },
    { color: Color.Huok2, prof: Profession.Nuak1, side: Side.Upward },
    { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward },
    { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward },
    { color: Color.Kok1, prof: Profession.Kauk2, side: Side.Upward },
    { color: Color.Huok2, prof: Profession.Kauk2, side: Side.Upward },
  ],
  [
    { color: Color.Huok2, prof: Profession.Tuk2, side: Side.Upward },
    { color: Color.Huok2, prof: Profession.Gua2, side: Side.Upward },
    null,
    { color: Color.Huok2, prof: Profession.Dau2, side: Side.Upward },
    null,
    { color: Color.Kok1, prof: Profession.Dau2, side: Side.Upward },
    null,
    { color: Color.Kok1, prof: Profession.Gua2, side: Side.Upward },
    { color: Color.Kok1, prof: Profession.Tuk2, side: Side.Upward },
  ],
  [
    { color: Color.Kok1, prof: Profession.Kua2, side: Side.Upward },
    { color: Color.Kok1, prof: Profession.Maun1, side: Side.Upward },
    { color: Color.Kok1, prof: Profession.Kaun1, side: Side.Upward },
    { color: Color.Kok1, prof: Profession.Uai1, side: Side.Upward },
    { color: Color.Huok2, prof: Profession.Io, side: Side.Upward },
    { color: Color.Huok2, prof: Profession.Uai1, side: Side.Upward },
    { color: Color.Huok2, prof: Profession.Kaun1, side: Side.Upward },
    { color: Color.Huok2, prof: Profession.Maun1, side: Side.Upward },
    { color: Color.Huok2, prof: Profession.Kua2, side: Side.Upward },
  ],
];

export let GAME_STATE: GAME_STATE = ((p: { IA_is_down: boolean }) => {
  let _is_my_turn: boolean = true; // override this by calling the setter
  let _my_score = 20;
  const scores_of_each_season: [number[], number[], number[], number[]] = [
    [],
    [],
    [],
    [],
  ];
  let _season: Season = 0;
  const log2_rate: Log2_Rate = 0;
  return {
    last_move_focus: null,
    f: {
      currentBoard: p.IA_is_down
        ? rotateBoard(rotateBoard(initial_board_with_IA_down))
        : rotateBoard(initial_board_with_IA_down),
      hop1zuo1OfDownward: [],
      hop1zuo1OfUpward: [],
    },
    IA_is_down: p.IA_is_down,
    tam_itself_is_tam_hue: true,
    opponent_has_just_moved_tam: false,
    set is_my_turn(i: boolean) {
      _is_my_turn = !!i;
      if (_is_my_turn) {
        document.getElementById("larta_me")!.style.display = "block";
        document.getElementById("larta_opponent")!.style.display = "none";
        document
          .getElementById(
            "protective_cover_over_field_while_waiting_for_opponent",
          )!
          .classList.add("nocover");
      } else {
        document.getElementById("larta_me")!.style.display = "none";
        document.getElementById("larta_opponent")!.style.display = "block";
        if (sessionStorage.vs === "cpu") { document.getElementById("larta_opponent")!.innerHTML = `<img src="image/nystiper.png">` }
        document
          .getElementById(
            "protective_cover_over_field_while_waiting_for_opponent",
          )!
          .classList.remove("nocover");
        window.setTimeout(sendMainPoll, 500 * 0.8093);
      }
    },

    get is_my_turn() {
      return _is_my_turn;
    },
    backupDuringStepping: null,
    set my_score(score: number) {
      scores_of_each_season[_season].push(score - _my_score);
      _my_score = score;
    },
    get my_score() {
      return _my_score;
    },
    get season() {
      return _season;
    },
    set season(season: Season) {
      _season = season;
    },
    get scores_of_each_season() {
      return [
        scores_of_each_season[0].concat([]),
        scores_of_each_season[1].concat([]),
        scores_of_each_season[2].concat([]),
        scores_of_each_season[3].concat([]),
      ];
    },
    set scores_of_each_season(_: [number[], number[], number[], number[]]) {
      throw new Error(
        "Cannot set scores_of_each_season. Please set my_score to reflect the change in the score.",
      );
    },
    log2_rate,
  };
})({ IA_is_down: JSON.parse(sessionStorage.is_IA_down_for_me) });
