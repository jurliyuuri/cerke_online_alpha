
type DictElem = {
    whetherToTake: string;
    failedWaterEntry: string;
}

type Dictionary = {
    ja: DictElem
}

const DICTIONARY: Dictionary = {
    ja: {
        whetherToTake: "駒を取る → [OK]\n駒を踏む → [Cancel]",
        failedWaterEntry: "入水判定に失敗しました。"
    }
}
