enum Color { 
    Kok1, // Red, 赤
    Huok2 // Black, 黒
}

enum Side {
    Upward,  // Pieces that points upward. Denoted by @^@ in the ASCII notation.
    Downward // Pieces that points downward. Denoted by @_@ in the ASCII notation.
}

enum Profession {
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

interface NonTam2Piece {
    color: Color; // The color of the piece
    prof: Profession; // The profession of the piece
    side: Side; // The side that the piece belongs to
}

type Piece = "Tam2" | NonTam2Piece;

type Tuple9<T> = [T, T, T, T, T, T, T, T, T]

type Board = Tuple9<Row>;
type Row = Tuple9<Piece | null>;
