import { Coord } from "cerke_online_utility/lib";
export const BOX_SIZE = 70;
export const MAX_PIECE_SIZE = BOX_SIZE - 1;
export const PIECE_SIZE = 60;

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

export function indToHop1Zuo1Horizontal(ind: number) {
  return 1 + ind * BOX_SIZE + (MAX_PIECE_SIZE - PIECE_SIZE) / 2;
}

export function indToHo1Zuo1OfDownward(ind: number) {
  return { top: -135 /* FIXME: magic */, left: indToHop1Zuo1Horizontal(ind) };
}
