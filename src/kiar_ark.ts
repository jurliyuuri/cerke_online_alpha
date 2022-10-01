export type HeaderElem = { type: "header"; dat: string };
export type BodyElem =
  | { type: "movement"; dat: string; piece_capture_comment?: string }
  | { type: "tymoktaxot"; dat: string };

const KIAR_ARK: {
  header: HeaderElem[];
  initial_colors: ("赤" | "黒")[];
  body: BodyElem[];
} = { header: [], body: [], initial_colors: [] };

function groupTwoAndRender(input: BodyElem[]) {
  let ans: string = "";
  for (let i = 0; i < input.length;) {
    const current: BodyElem | undefined = input[i];
    const next: BodyElem | undefined = input[i + 1];
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
  sessionStorage.kiar_ark = JSON.stringify(KIAR_ARK);
  console.log("_kiar_ark:", KIAR_ARK);
  const text_content =
    `{一位色:${KIAR_ARK.initial_colors.join("")}}\n` +
    KIAR_ARK.header.map((a) => a.dat).join("\n") +
    "\n" +
    groupTwoAndRender(KIAR_ARK.body);
  document.getElementById("kiar_ark")!.textContent = text_content;
  (document.getElementById("kiar_ark_link") as HTMLLinkElement).href = `https://sozysozbot.github.io/cetkaik_platform/show_history.html?history=${encodeURIComponent(text_content)}`
}

export function push_initial_colors_and_display(e: "赤" | "黒") {
  KIAR_ARK.initial_colors.push(e);
  display_kiar_ark();
}

export function push_body_elem_and_display(e: BodyElem) {
  KIAR_ARK.body.push(e);
  display_kiar_ark();
}

export function push_header_elem_and_display(e: HeaderElem) {
  KIAR_ARK.header.push(e);
  display_kiar_ark();
}

export function resurrect(k: {
  header: HeaderElem[];
  initial_colors: ("赤" | "黒")[];
  body: BodyElem[];
}) {
  KIAR_ARK.header = k.header;
  KIAR_ARK.initial_colors = k.initial_colors;
  KIAR_ARK.body = k.body;
}