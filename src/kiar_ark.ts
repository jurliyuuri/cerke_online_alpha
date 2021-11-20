export type ElemHeader =
  | { type: "header"; dat: string }
export type ElemBody =
  | { type: "movement"; dat: string; piece_capture_comment?: string }
  | { type: "tymoktaxot"; dat: string };

const KIAR_ARK: {
  header: ElemHeader[];
  initial_colors: ("赤" | "黒")[];
  body: ElemBody[];
} = { header: [], body: [], initial_colors: [] };

function groupTwoAndRender(input: ElemBody[]) {
  let ans: string = "";
  for (let i = 0; i < input.length;) {
    const current: ElemBody | undefined = input[i];
    const next: ElemBody | undefined = input[i + 1];
    if (current?.type === "movement" && next?.type === "movement") {
      ans +=
        current.dat +
        (current.piece_capture_comment ?? "") +
        "\t" +
        next.dat +
        (next.piece_capture_comment ?? "") +
        "\n";
      i += 2;
    } else if (current?.type === "tymoktaxot") {
      ans += "\n" + current.dat + "\n\n";
      i += 1;
    } else if (current?.type === "movement" && next?.type === "tymoktaxot") {
      ans +=
        current.dat +
        (current.piece_capture_comment ?? "") +
        "\n\n" +
        next.dat +
        "\n\n";
      i += 2;
    } else if (current?.type === "movement" && next === undefined) {
      ans += current.dat + (current.piece_capture_comment ?? "") + "\n";
      i += 1;
    } else {
      throw new Error(
        `Unexpected: the types passed to KIAR_ARK.body are "${current?.type}" followed by "${next?.type}".`,
      );
    }
  }
  return ans;
}

export function display_kiar_ark() {
  console.log("_kiar_ark:", KIAR_ARK);
  document.getElementById("kiar_ark")!.textContent =
    `{一位色:${KIAR_ARK.initial_colors.join("")}}\n` +
    KIAR_ARK.header.map((a) => a.dat).join("\n") +
    "\n" +
    groupTwoAndRender(KIAR_ARK.body);
}

export function push_to_kiar_ark_initial_colors_and_display(e: "赤" | "黒") {
  KIAR_ARK.initial_colors.push(e);
  display_kiar_ark();
}

export function push_to_kiar_ark_body_and_display(e: ElemBody) {
  KIAR_ARK.body.push(e);
  display_kiar_ark();
}

export function push_to_kiar_ark_header_and_display(e: ElemHeader) {
  KIAR_ARK.header.push(e);
  display_kiar_ark();
}