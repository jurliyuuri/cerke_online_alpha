"use strict";
const { drawScoreDisplay, drawFinalScoreDisplay } = (() => {
    function toDigits(num) {
        if (num % 1 !== 0) {
            throw new Error("non-integer");
        }
        else if (num >= 200) {
            const lastHundredArr = num % 100 === 0 ? [] : toDigitsSub(num % 100);
            return [...toDigitsSub(Math.floor(num / 100)), "num100", ...lastHundredArr];
        }
        else if (num >= 100) {
            const lastHundredArr = num % 100 === 0 ? [] : toDigits(num % 100);
            return ["num100", ...lastHundredArr];
        }
        else if (num < 0) {
            return ["neg", ...toDigits(-num)];
        }
        else if (num == 0) {
            return ["num00"];
        }
        const lastDigitArr = num % 10 === 0 ? [] : [`num0${num % 10}`];
        if (num >= 20) {
            return [`num0${Math.floor(num / 10)}`, "num10", ...lastDigitArr];
        }
        else if (num >= 10) {
            return ["num10", ...lastDigitArr];
        }
        else {
            return lastDigitArr;
        }
    }
    // -6848 should be 下六八百四八, not 下六十八百四十八. This function thus converts 68 to 六八, not 六十八.
    function toDigitsSub(num) {
        if (num % 1 !== 0) {
            throw new Error("non-integer");
        }
        else if (num >= 100) {
            throw new Error("100 or more detected in toDigitsSub");
        }
        else if (num <= 0) {
            throw new Error("0 or less detected in toDigitsSub");
        }
        if (num % 10 === 0) {
            if (num >= 20) {
                return [`num0${Math.floor(num / 10)}`, "num10"];
            }
            else if (num == 10) {
                return ["num10"];
            }
            else {
                throw new Error("cannot happen");
            }
        }
        else {
            const lastDigit = `num0${num % 10}`;
            if (num >= 20) {
                return [`num0${Math.floor(num / 10)}`, lastDigit];
            }
            else if (num >= 10) {
                return ["num10", lastDigit];
            }
            else {
                return [lastDigit];
            }
        }
    }
    const letter_spacing = -0.06;
    /**
     *
     * @param scores_of_each_season each [number] | [number, number] contains the score(s) obtained by the player on each season. kut2 tam2 comes first, if needed (Since there is no space to accomodate multiple kut2 tam2 for one season, multiple kut2 tam2 are combined into one.); then comes the score of the hand with which the season has terminated (or it might not come, if kut2 tam2 terminated the game)
     */
    function drawFinalScoreDisplay(scores_of_each_season) {
        const starting_position_left = 530;
        const spacing = 60;
        const createDigitsMidHTML = (score, ind) => createDigitsHTML(starting_position_left - spacing * ind, 50 * (1 + letter_spacing) / 2 * (2 - toDigits(score).length) + 239, 50, toDigits(score));
        const scores = [].concat(...scores_of_each_season);
        const final_score_display = document.getElementById("final_score_display");
        final_score_display.classList.remove("nocover");
        final_score_display.innerHTML = Array.from({ length: scores_of_each_season.length }).map((_, ind) => {
            const a = [].concat(...scores_of_each_season.slice(0, ind)).length;
            return `<img style="position:absolute; left: ${starting_position_left - spacing * a}px; top: 15px;" src="image/season_${ind}.png" width="50">`;
        }).join("") + scores.map((a, ind) => createDigitsMidHTML(a, ind)).join("")
            + createDigitsMidHTML(20, -1)
            + createTotalScoreHTML(20 + scores.reduce((a, b) => a + b, 0));
    }
    function createDigitsHTML(left, top, width, digits) {
        return digits.map((digit, index) => `<img
        src="image/dat2/${digit}.png"
        style="position:absolute; left: ${left}px; top: ${(1 + letter_spacing) * width * index + top}px;" width="${width}"
    >`).join("");
    }
    function drawScoreDisplay(hands_) {
        const hands = hands_.sort((a, b) => {
            const hands_ordering = [
                "同色無抗行処", "無抗行処",
                "同色筆兵無傾", "筆兵無傾",
                "同色地心", "地心",
                "同色馬弓兵", "馬弓兵",
                "同色行行", "行行",
                "王",
                "同色獣", "獣",
                "同色戦集", "戦集",
                "同色助友", "助友",
                "同色闇戦之集", "闇戦之集",
                "撃皇",
                "皇再来",
            ];
            return hands_ordering.indexOf(a) - hands_ordering.indexOf(b);
        });
        const top_padding = 15;
        if (hands.length > 11) {
            throw new Error("too many hands");
        }
        const starting_position_left = [550, 550, 550, 550, 550, 550, 550, 550, 550, 575, 585, 595][hands.length];
        const spacing = [60, 60, 60, 60, 60, 60, 60, 60, 60, 57, 53, 49][hands.length];
        function createHandAndScoreHTML(hand, left) {
            const digits = toDigits(hand_to_score[hand]);
            let ans = "";
            if (hand.slice(0, 2) === "同色") {
                ans += `
        <img src="image/dat2/${hand.slice(2)}.png" style="position:absolute; left: ${left}px; top: ${top_padding}px;" width="50">
        <img src="image/dat2/同色.png" style="position:absolute; left: ${left}px; top: ${185 + top_padding}px;" width="50">`;
            }
            else {
                ans += `<img src="image/dat2/${hand}.png" style="position:absolute; left: ${left}px; top: ${top_padding}px;" width="50">`;
            }
            ans += createDigitsHTML(left, 280 + top_padding, 50, digits);
            return ans;
        }
        const score_display = document.getElementById("score_display");
        score_display.classList.remove("nocover");
        const base_score = hands.map((h) => hand_to_score[h]).reduce((a, b) => a + b, 0);
        score_display.innerHTML =
            hands.map((hand, index) => createHandAndScoreHTML(hand, starting_position_left - spacing * index)).join("") +
                createTotalScoreHTML(base_score);
    }
    function createTotalScoreHTML(total_score) {
        const base_score_digits = toDigits(total_score);
        return createDigitsHTML(20, 234 - 70 * base_score_digits.length / 2, 70, base_score_digits);
    }
    return { drawScoreDisplay, drawFinalScoreDisplay };
})();
