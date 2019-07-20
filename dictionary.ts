
type DictElem = {
    whetherToTake: string;
    failedWaterEntry: string;
}

type Dictionary = {
    ja: DictElem
}

const DICTIONARY: Dictionary = {
    ja: {
        whetherToTake: "駒を取りますか？",
        failedWaterEntry: "入水判定に失敗しました。"
    }
}
