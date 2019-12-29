
interface DictElem {
    whetherToTake: string;
    failedWaterEntry: string;
    gameEnd: string;
    newSeason: string[]
}

interface Dictionary {
    ja: DictElem;
}

const DICTIONARY: Dictionary = {
    ja: {
        whetherToTake: "駒を取る → [OK]\n駒を踏む → [Cancel]",
        failedWaterEntry: "入水判定に失敗しました。",
        newSeason: [
            "",
            "季節が改まり夏になりました。",
            "季節が改まり秋になりました。",
            "季節が改まり冬になりました。"
        ],
        gameEnd: "試合終了です。"
    },
};
