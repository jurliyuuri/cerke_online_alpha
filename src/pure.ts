/**
 * Every function must be pure. Thus,
 * - no write to the global variable
 * - no DOM editing
 */
import { Ciurl } from "cerke_online_api";
import { Coord } from "cerke_online_utility/lib";

export function filterInOneDirectionTillCiurlLimit(
  guideListGreen: Coord[],
  step: Coord,
  plannedDirection: Coord,
  ciurl: Ciurl,
) {
  return guideListGreen.filter(function(c: Coord) {
    const subtractStep = function([x, y]: Coord): [number, number] {
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
