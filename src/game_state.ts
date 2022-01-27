import {
  Side,
  NonTam2Piece,
  NonTam2PieceDownward,
  NonTam2PieceUpward,
  Piece,
  Board,
  Coord,
  rotateBoard,
} from "cerke_online_utility";
import {
  AbsoluteCoord,
  Profession,
  Color,
  Season,
  Log2_Rate,
} from "cerke_online_api";
import { sendMainPollAndDoEverythingThatFollows } from "./opponent_move";

export type Hop1Zuo1 = NonTam2Piece[];

export interface Field {
  currentBoard: Board;
  hop1zuo1OfUpward: NonTam2PieceUpward[];
  hop1zuo1OfDownward: NonTam2PieceDownward[];
}

export interface GameState {
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

import { toAbsoluteCoord_, fromAbsoluteCoord_ } from "cerke_online_utility";
import { add_cover, remove_cover } from "./protective_cover";

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

const gamestate_from_scratch = (p: { IA_is_down: boolean }) => gamestate_from_params({
  IA_is_down: p.IA_is_down,
  my_score: 20,
  season: 0,
  scores_of_each_season: [[], [], [], []],
  log2_rate: 0,
  last_move_focus: null,
  f: {
    currentBoard: p.IA_is_down
      ? rotateBoard(rotateBoard(initial_board_with_IA_down))
      : rotateBoard(initial_board_with_IA_down),
    hop1zuo1OfDownward: [],
    hop1zuo1OfUpward: [],
  },
  backupDuringStepping: null,
});

const gamestate_from_params = (p: GameStatePureParams) => {
  let _is_my_turn: boolean = true; // override this by calling the setter
  let _my_score = p.my_score;
  const scores_of_each_season: [number[], number[], number[], number[]] = p.scores_of_each_season;
  let _season: Season = p.season;
  const log2_rate: Log2_Rate = p.log2_rate;
  return {
    last_move_focus: p.last_move_focus,
    f: p.f,
    IA_is_down: p.IA_is_down,
    tam_itself_is_tam_hue: true,
    opponent_has_just_moved_tam: false,
    set is_my_turn(i: boolean) {
      _is_my_turn = !!i;
      if (_is_my_turn) {
        document.getElementById("my_icon")!.style.opacity = "1";
        document.getElementById("larta_opponent")!.style.opacity = "0.3";
        document.getElementById("opponent_message")!.textContent = "";
        document.getElementById("opponent_message_linzklar")!.textContent = "";

        remove_cover("protective_cover_over_field_while_waiting_for_opponent");
      } else {
        document.getElementById("my_icon")!.style.opacity = "0.3";
        document.getElementById("larta_opponent")!.style.opacity = "1";
        add_cover("protective_cover_over_field_while_waiting_for_opponent");
        window.setTimeout(sendMainPollAndDoEverythingThatFollows, 500 * 0.8093);
      }
    },

    get is_my_turn() {
      return _is_my_turn;
    },
    backupDuringStepping: p.backupDuringStepping,
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
};

type GameStatePureParams = {
  IA_is_down: boolean, my_score: number, season: Season,
  scores_of_each_season: [number[], number[], number[], number[]],
  log2_rate: Log2_Rate,
  last_move_focus: Coord | null,
  f: Field,
  backupDuringStepping: null | [Coord, Piece]
};

export function back_up_gamestate() {
  const obj: GameStatePureParams = {
    IA_is_down: GAME_STATE.IA_is_down,
    my_score: GAME_STATE.my_score,
    season: GAME_STATE.season,
    scores_of_each_season: GAME_STATE.scores_of_each_season,
    log2_rate: GAME_STATE.log2_rate,
    last_move_focus: GAME_STATE.last_move_focus,
    f: GAME_STATE.f,
    backupDuringStepping: GAME_STATE.backupDuringStepping
  };
  sessionStorage.game_state_backup = JSON.stringify(obj);
}

export const GAME_STATE: GameState = sessionStorage.getItem('game_state_backup')
  ? gamestate_from_params(JSON.parse(sessionStorage.game_state_backup))
  : gamestate_from_scratch({
    IA_is_down: (() => {
      try {
        return JSON.parse(sessionStorage.is_IA_down_for_me);
      } catch {
        // Maybe you entered this page without registering. Go back to entrance.html.
        location.href = "entrance.html";
      }
    })(),
  });
