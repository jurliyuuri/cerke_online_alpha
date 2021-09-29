const _kiar_ark: {
    header: string[],
    body: string[]
} = { header: [], body: [] };

export const KIAR_ARK = new Proxy(_kiar_ark, {
    set: function (target, p: "header" | "body", value) {
        target[p] = value;
        document.getElementById("kiar_ark")!.innerHTML = target.header.join("\n") + "\n" + target.body.join("\n")
        return true;
    }
})
