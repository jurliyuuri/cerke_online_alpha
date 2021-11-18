import { Season, Log2_Rate } from "cerke_online_api";
import { Coord } from "cerke_online_utility";
export const BOX_SIZE = 70;
export const MAX_PIECE_SIZE = BOX_SIZE - 1;
export const PIECE_SIZE = 60;

export function adjust_ind_for_hop1zuo1(o: {
  ind: number;
  list_length: number;
}) {
  return o.list_length <= 9
    ? o.ind
    : (o.ind * 8) / (o.list_length - 1) /* 0 から 8 の間に均等に配置 */;
}

export function coordToPieceXY(coord: Coord) {
  const [row_index, column_index] = coord;
  return {
    top: 1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
    left: 1 + column_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
  };
}

export function coordToPieceXY_Shifted(coord: Coord) {
  const [row_index, column_index] = coord;
  return {
    top: 1 + row_index * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE),
    left: 1 + column_index * BOX_SIZE,
  };
}

export function hop1_zuo1_left_position(o: {
  ind: number;
  list_length: number;
}) {
  const adjusted_ind = adjust_ind_for_hop1zuo1(o);
  return 1 + adjusted_ind * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2;
}

export function indToHo1Zuo1OfDownward(ind: number) {
  return {
    top: -135,
    left: 1 + ind * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2,
  };
}

export function getDenoteSeasonNodeTopLeft(season: Season) {
  return { top: 360 + 51 * (3 - season), left: 3 };
}

export function getDenoteScoreNodeTopLeft(score: number) {
  return { top: 447 + 21.83333333333333 * (20 - score), left: 65 };
}

export function getDenoteRateNodeTopLeft(log2_rate: Log2_Rate) {
  return { top: 873 - (96.66666666666667 / 2) * (log2_rate - 1), left: 4 };
}
