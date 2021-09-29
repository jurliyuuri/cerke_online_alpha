export type Elem = { type: "header", dat: string }
    | { type: "movement", dat: string, piece_capture_comment?: string }
    | { type: "tymoktaxot", dat: string };

const _kiar_ark: {
    header: Elem[],
    body: Elem[]
} = { header: [], body: [] };

function groupTwoAndRender(input: Elem[]) {
    let ans: string = "";
    for (let i = 0; i < input.length;) {
        const current: Elem | undefined = input[i];
        const next: Elem | undefined = input[i + 1];
        if (current?.type === "movement" && next?.type === "movement") {
            ans += current.dat + (current.piece_capture_comment ?? "") + "\t" + next.dat + (next.piece_capture_comment ?? "") + "\n";
            i += 2;
        } else if (current?.type === "tymoktaxot") {
            ans += "\n" + current.dat + "\n\n";
            i += 1;
        } else if (current?.type === "movement" && next?.type === "tymoktaxot") {
            ans += current.dat + (current.piece_capture_comment ?? "") + "\n\n" + next.dat + "\n\n";
            i += 2;
        } else {
            throw new Error(`Unexpected: the types passed to KIAR_ARK.body are "${current?.type}" followed by "${next?.type}".`)
        }
    }
    return ans;
}

export const KIAR_ARK = new Proxy(_kiar_ark, {
    set: function (target, p: "header" | "body", value: Elem[]) {
        target[p] = value;
        console.log("_kiar_ark:", _kiar_ark);
        document.getElementById("kiar_ark")!.innerHTML = _kiar_ark.header.map(a => a.dat).join("\n") + "\n" + groupTwoAndRender(_kiar_ark.body)
        return true;
    }
})
