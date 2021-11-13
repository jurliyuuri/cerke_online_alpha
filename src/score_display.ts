import { HandAndNegativeHand, hand_to_score } from "cerke_hands_and_score";
import { createBapPokImage, createHandImage } from "./create_html_element";
import { removeAllChildren } from "extra-dom";
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
  const createDigitsMid = (o: { score: number; column_index: number }) =>
    createDigits(toDigitsLinzklar(o.score), {
      left: starting_position_left - spacing * o.column_index,
      top:
        ((50 * (1 + letter_spacing)) / 2) *
          (2 - toDigitsLinzklar(o.score).length) +
        239,
      width: 50,
    });

  const scores = ([] as number[]).concat(...scores_of_each_season);
  const total_score = 20 + scores.reduce((a, b) => a + b, 0);
  const final_score_display = document.getElementById("final_score_display")!;
  final_score_display.classList.remove("nocover");
  removeAllChildren(final_score_display);
  final_score_display.append(
    ...Array.from({ length: scores_of_each_season.length }, (_, season) => {
      const a = ([] as number[]).concat(
        ...scores_of_each_season.slice(0, season),
      ).length;
      return createSeasonImg({
        left: starting_position_left - spacing * a,
        season,
      });
    }),
  );
  final_score_display.append(
    ...scores.flatMap((score, column_index) =>
      createDigitsMid({ score, column_index }),
    ),
  );
  final_score_display.append(
    ...createDigitsMid({ score: 20, column_index: -1 }),
  );
  final_score_display.append(
    createHut2Img({ left: starting_position_left - spacing * -1 }),
  );
  final_score_display.append(...createTotalScoreDigits(total_score));
}

function createHut2Img(o: { left: number }): HTMLImageElement {
  const i = document.createElement("img");
  i.src = `image/始.png`;
  i.style.position = "absolute";
  i.style.left = `${o.left}px`;
  i.style.top = "15px";
  i.width = 50;
  return i;
}

function createSeasonImg(o: {
  left: number;
  season: number;
}): HTMLImageElement {
  const i = document.createElement("img");
  i.src = `image/season/${["春", "夏", "秋", "冬"][o.season]}.png`;
  i.style.position = "absolute";
  i.style.left = `${o.left}px`;
  i.style.top = "15px";
  i.width = 50;
  return i;
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
  const [starting_position_left, column_spacing] = [
    [550, 60],
    [550, 60],
    [550, 60],
    [550, 60],
    [550, 60],
    [550, 60],
    [550, 60],
    [550, 60],
    [550, 60],
    [575, 57] /*  9 */,
    [585, 53] /* 10 */,
    [595, 49] /* 11 */,
  ][hands.length];
  const score_display = document.getElementById("score_display")!;
  score_display.classList.remove("nocover");
  removeAllChildren(score_display);
  // while the score is displayed, move the yaku_all image from `left: 750px` to `left: 790px` to avoid overlap with taxot and tymok
  document.getElementById("yaku_all")!.style.left = "790px";
  const base_score_total = hands
    .map((h) => hand_to_score[h])
    .reduce((a, b) => a + b, 0);
  score_display.append(
    ...hands.flatMap((hand, index) => {
      /* display hands and scores */
      const left = starting_position_left - column_spacing * index;
      const digits: DigitLinzklar[] = toDigitsLinzklar(hand_to_score[hand]);
      const hand_and_score: HTMLImageElement[] = createDigits(digits, {
        left,
        top: 280 + top_padding,
        width: 50,
      });
      if (hand.slice(0, 2) === "同色") {
        hand_and_score.push(
          createHandImage(hand.slice(2), { left, top_padding }),
        );
        hand_and_score.push(createBapPokImage({ left, top_padding }));
      } else {
        hand_and_score.push(createHandImage(hand, { left, top_padding }));
      }
      return hand_and_score;
    }),
  );
  score_display.append(...createTotalScoreDigits(base_score_total));
}

function createDigits(
  digits: DigitLinzklar[],
  o: { left: number; top: number; width: number },
): HTMLImageElement[] {
  return digits.map((digit, row_index) => {
    const i = document.createElement("img");
    i.src = `image/digit/${digit}.png`;
    i.style.position = "absolute";
    i.style.left = `${o.left}px`;
    i.style.top = `${(1 + letter_spacing) * o.width * row_index + o.top}px`;
    i.width = o.width;
    return i;
  });
}

function createTotalScoreDigits(total_score: number): HTMLImageElement[] {
  const total_score_digits: DigitLinzklar[] = toDigitsLinzklar(total_score);
  return createDigits(total_score_digits, {
    left: 20,
    top: 234 - (70 * total_score_digits.length) / 2,
    width: 70,
  });
}
