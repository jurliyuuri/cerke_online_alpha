
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
        color: Color,
        prof: Profession,
        src: AbsoluteCoord,
        step: AbsoluteCoord,
        plannedDirection: AbsoluteCoord
    }
}
