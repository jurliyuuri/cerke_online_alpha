enum AbsoluteRow {
    A, E, I, U, O, Y, AI, AU, IA
}

enum AbsoluteColumn {
    K, L, N, T, Z, X, C, M, P
}

type AbsoluteCoord = [AbsoluteRow, AbsoluteColumn];


interface NormalNonTamMove {
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

interface TamMove {
    type: 'TamMove'
    stepStyle: 'NoStep' | 'StepsDuringFormer' | 'StepsDuringLatter';
    src: AbsoluteCoord;
    firstDest: AbsoluteCoord;
    secondDest: AbsoluteCoord;
}

type NormalMove = NormalNonTamMove | TamMove;