namespace type__piece {

    export enum Color {
        Kok1, // Red, 赤
        Huok2 // Black, 黒
    }

    export enum Side {
        Upward,  // Pieces that points upward. Denoted by @^@ in the ASCII notation.
        Downward // Pieces that points downward. Denoted by @_@ in the ASCII notation.
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

}
