
namespace type__message {
    export enum Color {
        Kok1, // Red, 赤
        Huok2 // Black, 黒
    }

    export enum Profession {
        Nuak1, // Vessel, 船, felkana
        Kauk2, // Pawn, 兵, elmer
        Gua2, // Rook, 弓, gustuer
        Kaun1, // Bishop, 車, vadyrd
        Dau2, // Tiger, 虎, stistyst
        Maun1, // Horse, 馬, dodor
        Kua2, // Clerk, 筆, kua
        Tuk2, // Shaman, 巫, terlsk
        Uai1, // General, 将, varxle
        Io, // King, 王, ales
    }

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
