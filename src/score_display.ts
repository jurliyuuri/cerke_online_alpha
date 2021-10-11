import { HandAndNegativeHand, hand_to_score } from "cerke_hands_and_score";
import { DigitLinzklar, toDigitsLinzklar } from "./to_digits";

export type ArrayUpTo4<T> = [T] | [T, T] | [T, T, T] | [T, T, T, T];

const letter_spacing = -0.06;

/**
 *
 * @param scores_of_each_season each [number] | [number, number] contains the score(s) obtained by the player on each season. kut2 tam2 comes first, if needed (Since there is no space to accomodate multiple kut2 tam2 for one season, multiple kut2 tam2 are combined into one.); then comes the score of the hand with which the season has terminated (or it might not come, if kut2 tam2 terminated the game)
 */
export function drawFinalScoreDisplay(
  scores_of_each_season: ArrayUpTo4<[number] | [number, number]>,
) {
  const starting_position_left = 530;
  const spacing = 60;

  const createDigitsMidHTML = (score: number, ind: number) =>
    createDigitsHTML(
      {
        left: starting_position_left - spacing * ind,
        top: ((50 * (1 + letter_spacing)) / 2) * (2 - toDigitsLinzklar(score).length) + 239,
        width: 50
      },
      toDigitsLinzklar(score),
    );

  const scores = ([] as number[]).concat(...scores_of_each_season);
  const total_score = 20 + scores.reduce((a, b) => a + b, 0);
  const final_score_display = document.getElementById("final_score_display")!;
  final_score_display.classList.remove("nocover");
  final_score_display.innerHTML =
    Array.from({ length: scores_of_each_season.length })
      .map((_, ind) => {
        const a = ([] as number[]).concat(
          ...scores_of_each_season.slice(0, ind),
        ).length;
        return `<img style="position:absolute; left: ${starting_position_left -
          spacing *
          a}px; top: 15px;" src="image/season_${ind}.png" width="50">`;
      })
      .join("") +
    scores.map((a, ind) => createDigitsMidHTML(a, ind)).join("") +
    createDigitsMidHTML(20, -1);
  final_score_display.append(...createTotalScoreDigits(total_score));
}

function createDigit(
  o: {
    left: number,
    top: number,
    width: number
  },
  digit: DigitLinzklar,
  index: number
): HTMLImageElement {
  const i = document.createElement("img");
  i.src = `image/dat2/${digit}.png`;
  i.style.position = "absolute";
  i.style.left = `${o.left}px`;
  i.style.top = `${(1 + letter_spacing) * o.width * index + o.top}px`
  i.width = o.width;
  return i;
}

/**
 * @deprecated Use createDigit, which does the same thing but returns HTMLImageElement
 */
function createDigitsHTML(
  o: {
    left: number,
    top: number,
    width: number
  },
  digits: DigitLinzklar[],
) {
  return digits
    .map(
      (digit, index) => `<img
        src="image/dat2/${digit}.png"
        style="position:absolute; left: ${o.left}px; top: ${(1 + letter_spacing) *
        o.width *
        index +
        o.top}px;" width="${o.width}"
    >`,
    )
    .join("");
}

export function drawScoreDisplay(hands_: HandAndNegativeHand[]) {
  const hands = hands_.sort((a, b) => {
    const hands_ordering: HandAndNegativeHand[] = [
      "同色無抗行処",
      "無抗行処",
      "同色筆兵無傾",
      "筆兵無傾",
      "同色地心",
      "地心",
      "同色馬弓兵",
      "馬弓兵",
      "同色行行",
      "行行",
      "王",
      "同色獣",
      "獣",
      "同色戦集",
      "戦集",
      "同色助友",
      "助友",
      "同色闇戦之集",
      "闇戦之集",
      "撃皇",
      "皇再来",
    ];
    return hands_ordering.indexOf(a) - hands_ordering.indexOf(b);
  });

  const top_padding = 15;
  if (hands.length > 11) {
    throw new Error("too many hands");
  }
  const starting_position_left = [
    550,
    550,
    550,
    550,
    550,
    550,
    550,
    550,
    550,
    575,
    585,
    595,
  ][hands.length];
  const spacing = [60, 60, 60, 60, 60, 60, 60, 60, 60, 57, 53, 49][
    hands.length
  ];

  function createHandAndScoreHTML(
    hand: HandAndNegativeHand,
    left: number,
  ): string {
    const digits: DigitLinzklar[] = toDigitsLinzklar(hand_to_score[hand]);
    let ans = "";
    if (hand.slice(0, 2) === "同色") {
      ans += `
        <img src="image/dat2/${hand.slice(
        2,
      )}.png" style="position:absolute; left: ${left}px; top: ${top_padding}px;" width="50">
        <img src="image/dat2/同色.png" style="position:absolute; left: ${left}px; top: ${185 +
        top_padding}px;" width="50">`;
    } else {
      ans += `<img src="image/dat2/${hand}.png" style="position:absolute; left: ${left}px; top: ${top_padding}px;" width="50">`;
    }
    ans += createDigitsHTML({ left, top: 280 + top_padding, width: 50 }, digits);
    return ans;
  }

  const score_display = document.getElementById("score_display")!;
  score_display.classList.remove("nocover");
  // while the score is displayed, move the yaku_all image from `left: 750px` to `left: 790px` to avoid overlap with taxot and tymok
  document.getElementById("yaku_all")!.style.left = "790px";
  const base_score = hands
    .map(h => hand_to_score[h])
    .reduce((a, b) => a + b, 0);
  score_display.innerHTML =
    hands
      .map((hand, index) =>
        createHandAndScoreHTML(hand, starting_position_left - spacing * index),
      )
      .join("");
  score_display.append(...createTotalScoreDigits(base_score));
}

function createTotalScoreDigits(total_score: number): HTMLImageElement[] {
  const total_score_digits: DigitLinzklar[] = toDigitsLinzklar(total_score);
  return total_score_digits.map((digit, index) => createDigit({
    left: 20,
    top: 234 - (70 * total_score_digits.length) / 2,
    width: 70
  }, digit, index))
}
