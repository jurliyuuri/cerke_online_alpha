
namespace type__message {
    import Color = type__piece.Color;
    import Profession = type__piece.Profession;

    export enum AbsoluteRow {
        A, E, I, U, O, Y, AI, AU, IA
    }

    export enum AbsoluteColumn {
        K, L, N, T, Z, X, C, M, P
    }

    export type AbsoluteCoord = [AbsoluteRow, AbsoluteColumn];

    export function toAbsoluteCoord_([row, col]: Coord, IA_is_down: boolean): AbsoluteCoord {
        return [
            [
                AbsoluteRow.A, AbsoluteRow.E, AbsoluteRow.I,
                AbsoluteRow.U, AbsoluteRow.O, AbsoluteRow.Y,
                AbsoluteRow.AI, AbsoluteRow.AU, AbsoluteRow.IA
            ][IA_is_down ? row : 8 - row],
            [
                AbsoluteColumn.K, AbsoluteColumn.L, AbsoluteColumn.N,
                AbsoluteColumn.T, AbsoluteColumn.Z, AbsoluteColumn.X,
                AbsoluteColumn.C, AbsoluteColumn.M, AbsoluteColumn.P
            ][IA_is_down ? col : 8 - col]
        ];
    }

    export function fromAbsoluteCoord_([absrow, abscol]: AbsoluteCoord, IA_is_down: boolean): Coord {
        let rowind: BoardIndex;

        if (absrow === AbsoluteRow.A) { rowind = 0; }
        else if (absrow === AbsoluteRow.E) { rowind = 1; }
        else if (absrow === AbsoluteRow.I) { rowind = 2; }
        else if (absrow === AbsoluteRow.U) { rowind = 3; }
        else if (absrow === AbsoluteRow.O) { rowind = 4; }
        else if (absrow === AbsoluteRow.Y) { rowind = 5; }
        else if (absrow === AbsoluteRow.AI) { rowind = 6; }
        else if (absrow === AbsoluteRow.AU) { rowind = 7; }
        else if (absrow === AbsoluteRow.IA) { rowind = 8; }
        else {
            let _should_not_reach_here: never = absrow;
            throw new Error("does not happen");
        }

        let colind: BoardIndex;

        if (abscol === AbsoluteColumn.K) { colind = 0; }
        else if (abscol === AbsoluteColumn.L) { colind = 1; }
        else if (abscol === AbsoluteColumn.N) { colind = 2; }
        else if (abscol === AbsoluteColumn.T) { colind = 3; }
        else if (abscol === AbsoluteColumn.Z) { colind = 4; }
        else if (abscol === AbsoluteColumn.X) { colind = 5; }
        else if (abscol === AbsoluteColumn.C) { colind = 6; }
        else if (abscol === AbsoluteColumn.M) { colind = 7; }
        else if (abscol === AbsoluteColumn.P) { colind = 8; }
        else {
            let _should_not_reach_here: never = abscol;
            throw new Error("does not happen");
        }

        if (IA_is_down) {
            return [rowind, colind];
        } else {
            return [8 - rowind as BoardIndex, 8 - colind as BoardIndex];
        }
    }

    export interface NormalNonTamMove {
        type: 'NonTamMove';
        data: {
            type: 'FromHand';
            color: Color;
            prof: Profession;
            dest: AbsoluteCoord;
        } | {
            type: 'SrcDst';
            src: AbsoluteCoord;
            dest: AbsoluteCoord;
        } | {
            type: 'SrcStepDstFinite';
            src: AbsoluteCoord;
            step: AbsoluteCoord;
            dest: AbsoluteCoord;
        };
    }

    export interface TamMove {
        type: 'TamMove'
        stepStyle: 'NoStep' | 'StepsDuringFormer' | 'StepsDuringLatter';
        src: AbsoluteCoord;
        firstDest: AbsoluteCoord;
        secondDest: AbsoluteCoord;
    }

    export type NormalMove = NormalNonTamMove | TamMove;

    export interface InfAfterStep {
        type: 'InfAfterStep',
        color: Color,
        prof: Profession,
        src: AbsoluteCoord,
        step: AbsoluteCoord,
        plannedDirection: AbsoluteCoord
    }

    export interface AfterHalfAcceptance {
        type: 'AfterHalfAcceptance',
        dest: AbsoluteCoord | null
        /* null: hands over the turn to the opponent */
    }

    export type Ciurl = [boolean, boolean, boolean, boolean, boolean];

    export type Ret_InfAfterStep = {
        legal: false,
        whyIllegal: string
    } | {
        legal: true,
        ciurl: Ciurl
    }

    export type WhetherWaterEntryHappened = {
        waterEntryHappened: true,
        ciurl: Ciurl
    } | {
        waterEntryHappened: false
    };
    
    export type Ret_NormalMove = {
        legal: false,
        whyIllegal: string
    } | {
        legal: true,
        dat: WhetherWaterEntryHappened
    };
    
    export type Ret_AfterHalfAcceptance = {
        legal: false,
        whyIllegal: string
    } | {
        legal: true,
        dat: WhetherWaterEntryHappened
    };
    
}
