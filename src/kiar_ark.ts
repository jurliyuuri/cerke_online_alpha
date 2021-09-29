const _kiar_ark: {
    header: string[],
    body: string[]
} = { header: [], body: [] };

function groupTwoAndRender(input: string[]) {
    let ans: string = "";
    for (let i = 0; i < input.length; i += 2) {
        ans += (input[i] ?? "") + "\t" + (input[i+1] ?? "") + "\n";
    }
    return ans;
}

export const KIAR_ARK = new Proxy(_kiar_ark, {
    set: function (target, p: "header" | "body", value: string[]) {
        target[p] = value;
        console.log("_kiar_ark:", _kiar_ark);
        document.getElementById("kiar_ark")!.innerHTML = _kiar_ark.header.join("\n") + "\n" + groupTwoAndRender(_kiar_ark.body)
        return true;
    }
})
