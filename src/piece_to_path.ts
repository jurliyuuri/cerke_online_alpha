import { Color, Profession } from "cerke_online_api";
import { Side, NonTam2Piece, Piece } from "cerke_online_utility";

export function toPath(p: NonTam2Piece): string {
  const sideToPath = function (side: Side): string {
    if (side === Side.Downward) {
      return "reversed";
    }
    if (side === Side.Upward) {
      return "upright";
    }

    const _should_not_reach_here: never = side;
    return _should_not_reach_here;
  };

  const colorToPath = function (color: Color): string {
    if (color === Color.Huok2) {
      return "b";
    }
    if (color === Color.Kok1) {
      return "r";
    }

    const _should_not_reach_here: never = color;
    return _should_not_reach_here;
  };

  const profToPath = function (prof: Profession): string {
    if (prof === Profession.Dau2) {
      return "dau";
    }
    if (prof === Profession.Gua2) {
      return "gua";
    }
    if (prof === Profession.Io) {
      return "io";
    }
    if (prof === Profession.Kauk2) {
      return "kauk";
    }
    if (prof === Profession.Kaun1) {
      return "kaun";
    }
    if (prof === Profession.Kua2) {
      return "kua";
    }
    if (prof === Profession.Maun1) {
      return "maun";
    }
    if (prof === Profession.Nuak1) {
      return "nuak";
    }
    if (prof === Profession.Tuk2) {
      return "tuk";
    }
    if (prof === Profession.Uai1) {
      return "uai";
    }

    const _should_not_reach_here: never = prof;
    return _should_not_reach_here;
  };

  const fontToPath = function (): string { return "官字"; }

  return `piece_img/${fontToPath()}/${sideToPath(p.side)}/${colorToPath(p.color)}${profToPath(p.prof)}`;
}

export function toPath_(piece: Piece) {
  const fontToPath = function (): string { return "官字"; }
  if (piece === "Tam2") {
    return `piece_img/${fontToPath()}/upright/tam`;
  } else {
    return toPath(piece);
  }
}
