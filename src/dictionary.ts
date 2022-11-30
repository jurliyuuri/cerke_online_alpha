export interface DictElem {
  whetherToTake: string;
  failedWaterEntry: string;
  gameEnd: string;
  newSeason: string[];
  tactics: Tactics;
  gameResult: {
    victory: string;
    draw: string;
    loss: string;
  };
  tymokExplanation: string,
  taxotExplanation: string,
}

export type Tactics = {
  victory_almost_certain: string;
  strengthened_shaman: string;
  free_lunch: string;
  avoid_defeat: string;
  loss_almost_certain: string;
  neutral: string;
};

export const TACTICS_LINZKLAR: Tactics = {
  victory_almost_certain: "我須上行。",
  strengthened_shaman: "為激巫。",
  free_lunch: "我為無与之手。",
  avoid_defeat: "心為此而無行下行之道。",
  loss_almost_certain: "為何即下行。行我心之道。",
  neutral: "無心来為何善。行周時無下行之道。",
};

export const GAME_END_LINZKLAR = {
  victory: "汝上行終",
  draw: "汝値同於我",
  loss: "汝下行終",
};

export type TacticsKey = keyof Tactics;

export interface Dictionary {
  ja: DictElem;
}

export const DICTIONARY: Dictionary = {
  ja: {
    whetherToTake: "駒を取る → [OK]\n駒を踏む → [Cancel]",
    failedWaterEntry: "入水判定に失敗しました。",
    newSeason: [
      "",
      "季節が改まり夏になりました。",
      "季節が改まり秋になりました。",
      "季節が改まり冬になりました。",
    ],
    gameEnd: "試合終了です。",
    gameResult: {
      victory: "あなたの勝ちです",
      draw: "引き分けです",
      loss: "あなたの負けです",
    },
    tactics: {
      victory_almost_certain: "勝ち確",
      strengthened_shaman: "激巫作成",
      free_lunch: "ただ取り",
      avoid_defeat: "負けを避けるためにこう指してみるか",
      loss_almost_certain: "なにやっても負けそうなので好き勝手に指す",
      neutral: "いい手が思いつかなかったので、即負けしない範囲で好き勝手に指す",
    },
    tymokExplanation: "再行; シーズン続行; こいこい",
    taxotExplanation: "終季; シーズン終了; 点数獲得"
  },
};
