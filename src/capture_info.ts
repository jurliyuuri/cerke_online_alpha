import { Profession, Color } from "cerke_online_api";
import { Piece } from "cerke_online_utility";
import { serializeColor, serializeProf } from "./serialize";

export type MovementInfo = {
  piece_moved: Readonly<Piece | "Tam2">;
  maybe_capture: Readonly<CaptureInfo>;
};

export type CaptureInfo = Readonly<[Color, Profession]> | null;

export function toColorProf(p: Piece | null): CaptureInfo {
  if (p === "Tam2") {
    throw new Error("Tam2 was passed to the function `toColorProf`");
  }
  if (p === null) {
    return null;
  }
  return [p.color, p.prof];
}

export function toPieceCaptureComment(c: CaptureInfo): string {
  if (c === null) {
    return "";
  }
  const [color, prof] = c;
  return `手${serializeColor(color)}${serializeProf(prof)}`;
}
