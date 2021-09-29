const _kiar_ark: {
    header: string[],
    body: string[]
} = { header: [], body: [] };

export const KIAR_ARK = new Proxy(_kiar_ark, {
    set: function (target, p: "header" | "body", value: string[]) {
        target[p] = value;
        document.getElementById("kiar_ark")!.innerHTML = _kiar_ark.header.join("\n") + "\n" + _kiar_ark.body.join("\n")
        return true;
    }
})
