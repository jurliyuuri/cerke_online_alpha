
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
