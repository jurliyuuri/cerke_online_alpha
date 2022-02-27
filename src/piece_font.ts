type PieceFont = "官字" | "略字" | "やる気なし";

type ElementOf<A extends any[]> = A extends (infer Elm)[] ? Elm : unknown;
type IsNever<T> = T[] extends never[] ? true : false;
function allElements<V>(): <Arr extends V[]>(arr: Arr) =>
	IsNever<Exclude<V, ElementOf<Arr>>> extends true ? V[] : unknown {
	return arr => arr as any;
}

/* GLOBAL STATE */
let current_piece_font: PieceFont = "官字";

export function getPieceFont() { return current_piece_font; }

export function setPieceFont(to: PieceFont) {
	console.log("changing the piece font", current_piece_font, "into", to);
	(document.getElementById("denote_season")! as HTMLImageElement).src = `image/piece_img/${to}/upright/rtam.png`;

	for (const id of ["contains_pieces_on_upward", "contains_pieces_on_downward", "contains_pieces_on_board", "contains_phantom"]) {
		const elem = document.getElementById(id)!;
		for (const child of elem.childNodes) {
			console.log("replacing the image path", (child as HTMLImageElement).src, "into the new path", (child as HTMLImageElement).src.replace(current_piece_font, to));
			(child as HTMLImageElement).src = (child as HTMLImageElement).src.replace(current_piece_font, to); // OH NO
		}
	}

	current_piece_font = to;
}

const piece_fonts: PieceFont[] = allElements<PieceFont>()(["官字", "略字", "やる気なし"]);

for (const font of piece_fonts) {
	document.getElementById(`radio_${font}`)!.addEventListener("click", () => setPieceFont(font))
}

