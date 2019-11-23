namespace type__piece {

    import Color = type__message.Color;
    import Profession = type__message.Profession;

    export enum Side {
        Upward,  // Pieces that points upward. Denoted by @^@ in the ASCII notation.
        Downward // Pieces that points downward. Denoted by @_@ in the ASCII notation.
    }

    export interface NonTam2Piece {
        color: Color; // The color of the piece
        prof: Profession; // The profession of the piece
        side: Side; // The side that the piece belongs to
    }

    export function fromUpOrDown(u_or_d: NonTam2PieceDownward | NonTam2PieceUpward): NonTam2Piece {
        return {
            color: u_or_d.color,
            prof: u_or_d.prof,
            side: u_or_d.side
        };
    }

    export function toUpOrDown(nontam: NonTam2Piece): NonTam2PieceDownward | NonTam2PieceUpward {
        if (nontam.side === Side.Downward) {
            return {
                color: nontam.color,
                prof: nontam.prof,
                side: nontam.side
            };
        } else {
            return {
                color: nontam.color,
                prof: nontam.prof,
                side: nontam.side
            };
        }
    }

    export interface NonTam2PieceDownward {
        color: Color; // The color of the piece
        prof: Profession; // The profession of the piece
        side: Side.Downward; // The side that the piece belongs to
    }

    export interface NonTam2PieceUpward {
        color: Color; // The color of the piece
        prof: Profession; // The profession of the piece
        side: Side.Upward; // The side that the piece belongs to
    }

    export type Piece = "Tam2" | NonTam2Piece;

    export type Tuple9<T> = [T, T, T, T, T, T, T, T, T]

    export type Board = Tuple9<Row>;
    export type Row = Tuple9<Piece | null>;

    export type BoardIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

    export type Coord = Readonly<[BoardIndex, BoardIndex]>;

    export function coordEq(a: Coord, b: Coord): boolean {
        return a[0] === b[0] && a[1] === b[1];
    }

    export function rotateCoord(c: Coord): Coord {
        return [8 - c[0] as BoardIndex, 8 - c[1] as BoardIndex];
    }

    export function rotateBoard(b: Board): Board {
        let ans: Board = [
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"],
            [null, null, null, null, null, null, null, null, "Tam2"]
        ];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                ans[i][j] = rotatePieceOrNull(b[8 - i][8 - j]);
            }
        }
        return ans;
    }

    function rotatePieceOrNull(p: Piece | null): Piece | null {
        if (p === null || p === "Tam2") {
            return p;
        } else {
            return {prof: p.prof, color: p.color, side: 1 - p.side};
        }
    }

    export function toPath(p: NonTam2Piece): string {
        const sideToPath = function (side: Side): string {
            if (side === Side.Downward) return "piece_rev";
            if (side === Side.Upward) return "piece";

            let _should_not_reach_here: never = side;
            return _should_not_reach_here;
        }

        const colorToPath = function (color: Color): string {
            if (color === Color.Huok2) return "b";
            if (color === Color.Kok1) return "r";

            let _should_not_reach_here: never = color;
            return _should_not_reach_here;
        }

        const profToPath = function (prof: Profession): string {
            if (prof === Profession.Dau2) return "dau";
            if (prof === Profession.Gua2) return "gua";
            if (prof === Profession.Io) return "io";
            if (prof === Profession.Kauk2) return "kauk";
            if (prof === Profession.Kaun1) return "kaun";
            if (prof === Profession.Kua2) return "kua";
            if (prof === Profession.Maun1) return "maun";
            if (prof === Profession.Nuak1) return "nuak";
            if (prof === Profession.Tuk2) return "tuk";
            if (prof === Profession.Uai1) return "uai";

            let _should_not_reach_here: never = prof;
            return _should_not_reach_here;
        }

        return `${sideToPath(p.side)}/${colorToPath(p.color)}${profToPath(p.prof)}`
    }

    export function toPath_(piece: Piece) {
        if (piece === "Tam2") {
            return "piece/tam";
        } else {
            return toPath(piece);
        }
    }

}
