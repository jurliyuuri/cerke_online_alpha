/**
 * Every function must be pure. Thus,
 * - no write to the global variable
 * - no DOM editing
 */

import Profession = type__message.Profession;
import Side = type__piece.Side;
import Color = type__message.Color;
import toPath = type__piece.toPath;
import toPath_ = type__piece.toPath_;
import NonTam2Piece = type__piece.NonTam2Piece;
import NonTam2PieceUpward = type__piece.NonTam2PieceUpward;
import NonTam2PieceDownward = type__piece.NonTam2PieceDownward;
import Board = type__piece.Board;
import Piece = type__piece.Piece;
import Coord = type__piece.Coord;
import BoardIndex = type__piece.BoardIndex;
import toUpOrDown = type__piece.toUpOrDown;
import AbsoluteColumn = type__message.AbsoluteColumn;
import AbsoluteCoord = type__message.AbsoluteCoord;
import AbsoluteRow = type__message.AbsoluteRow;
import NormalMove = type__message.NormalMove;
import calculateMovablePositions = calculate_movable.calculateMovablePositions;
import coordEq = type__piece.coordEq;
import rotateCoord = type__piece.rotateCoord;
import rotateBoard = type__piece.rotateBoard;
import NormalNonTamMove = type__message.NormalNonTamMove;
import InfAfterStep = type__message.InfAfterStep;
import AfterHalfAcceptance = type__message.AfterHalfAcceptance;
import Ciurl = type__message.Ciurl;
import Ret_InfAfterStep = type__message.Ret_InfAfterStep;
import Ret_NormalMove = type__message.Ret_NormalMove;
import Ret_AfterHalfAcceptance = type__message.Ret_AfterHalfAcceptance;
import SrcDst = type__message.SrcDst;
import SrcStepDstFinite = type__message.SrcStepDstFinite;
import MoveToBePolled = type__message.MoveToBePolled;
import eightNeighborhood = calculate_movable.eightNeighborhood;
import isTamHue = calculate_movable.isTamHue;
import canGetOccupiedBy = calculate_movable.canGetOccupiedBy;

function filterInOneDirectionTillCiurlLimit(guideListGreen: Coord[], step: Coord, plannedDirection: Coord, ciurl: Ciurl) {
    return guideListGreen.filter(function(c: Coord) {
        const subtractStep = function([x, y]: Coord): [number, number] {
            const [step_x, step_y] = step;
            return [x - step_x, y - step_y];
        };

        const limit: number = ciurl.filter((x) => x).length;

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
