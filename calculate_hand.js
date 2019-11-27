"use strict";
;
(() => {
    const toObtainablePieces2 = {
        "黒兵": { color: "黒", prof: "兵" },
        "赤兵": { color: "赤", prof: "兵" },
        "黒弓": { color: "黒", prof: "弓" },
        "黒車": { color: "黒", prof: "車" },
        "黒虎": { color: "黒", prof: "虎" },
        "黒馬": { color: "黒", prof: "馬" },
        "黒筆": { color: "黒", prof: "筆" },
        "黒巫": { color: "黒", prof: "巫" },
        "黒将": { color: "黒", prof: "将" },
        "赤弓": { color: "赤", prof: "弓" },
        "赤車": { color: "赤", prof: "車" },
        "赤虎": { color: "赤", prof: "虎" },
        "赤馬": { color: "赤", prof: "馬" },
        "赤筆": { color: "赤", prof: "筆" },
        "赤巫": { color: "赤", prof: "巫" },
        "赤将": { color: "赤", prof: "将" },
        "黒王": { color: "黒", prof: "王" },
        "赤王": { color: "赤", prof: "王" },
        "黒船": { color: "黒", prof: "船" },
        "赤船": { color: "赤", prof: "船" }
    };
    const piece_list = ["黒兵", "黒兵", "黒兵", "黒兵", "黒兵", "黒兵", "黒兵", "黒兵", "赤兵", "赤兵", "赤兵", "赤兵", "赤兵", "赤兵", "赤兵", "赤兵", "黒弓", "黒車", "黒虎", "黒馬", "黒筆", "黒巫", "黒将", "黒弓", "黒車", "黒虎", "黒馬", "黒筆", "黒巫", "黒将", "赤弓", "赤車", "赤虎", "赤馬", "赤筆", "赤巫", "赤将", "赤弓", "赤車", "赤虎", "赤馬", "赤筆", "赤巫", "赤将", "黒王", "赤王", "黒船", "赤船"];
    const toScore = {
        "無抗行処": 50,
        "同色無抗行処": 52,
        "筆兵無傾": 10,
        "同色筆兵無傾": 12,
        "地心": 7,
        "同色地心": 9,
        "馬弓兵": 5,
        "同色馬弓兵": 7,
        "行行": 5,
        "同色行行": 7,
        "王": 3 + 2,
        "獣": 3,
        "同色獣": 5,
        "戦集": 3,
        "同色戦集": 5,
        "助友": 3,
        "同色助友": 5,
        "闇戦之集": 3,
        "同色闇戦之集": 5
    };
    function calculate_hands_with_no_king(count) {
        function has(prof) {
            return count[prof]["赤"] + count[prof]["黒"] > 0;
        }
        function has_all(profs) {
            return profs.every(has);
        }
        function has_all_same_color(profs) {
            return profs.every(a => count[a]["赤"] >= 1) || profs.every(a => count[a]["黒"] >= 1);
        }
        function howmany(prof) {
            return count[prof]["赤"] + count[prof]["黒"];
        }
        let ans = new Set();
        if (count["兵"]["赤"] >= 5 || count["兵"]["黒"] >= 5) {
            ans.add("同色闇戦之集");
        }
        else if (howmany("兵") >= 5) {
            ans.add("闇戦之集");
        }
        if ((count["車"]["赤"] >= 1 && count["兵"]["赤"] >= 2)
            || (count["車"]["黒"] >= 1 && count["兵"]["黒"] >= 2)) {
            ans.add("同色助友");
        }
        else if (has("車") && howmany("兵") >= 2) {
            ans.add("助友");
        }
        if ((count["将"]["赤"] >= 1 && count["兵"]["赤"] >= 2)
            || (count["将"]["黒"] >= 1 && count["兵"]["黒"] >= 2)) {
            ans.add("同色戦集");
        }
        else if (has("将") && howmany("兵") >= 2) {
            ans.add("戦集");
        }
        const f = (arr, flashhand, hand) => {
            if (has_all_same_color(arr)) {
                ans.add(flashhand);
            }
            else if (has_all(arr)) {
                ans.add(hand);
            }
        };
        f(["虎", "馬"], "同色獣", "獣");
        f(["船", "車", "馬"], "同色行行", "行行");
        f(["兵", "弓", "馬"], "同色馬弓兵", "馬弓兵");
        f(["筆", "巫", "将"], "同色地心", "地心");
        f(["兵", "弓", "将", "筆", "巫"], "同色筆兵無傾", "筆兵無傾");
        return ans;
    }
    function calculate_hands_with_king(count) {
        let ans = new Set(["王"]);
        ans.add("王");
        const prof_list_excluding_king = [
            "兵", "弓", "車", "虎", "馬", "筆", "巫", "将", "船"
        ];
        const f = (color) => {
            if (count["王"][color] === 1) {
                count["王"][color]--;
                for (let i = 0; i < prof_list_excluding_king.length; i++) {
                    count[prof_list_excluding_king[i]][color]++; // wildcard
                    ans = new Set([...ans, ...calculate_hands_(count)]);
                    count[prof_list_excluding_king[i]][color]--;
                }
                count["王"][color]++;
            }
        };
        f("赤");
        f("黒");
        const g = (flashhand, hand) => {
            if (ans.has(flashhand)) {
                ans.delete(hand);
            }
        };
        g("同色助友", "助友");
        g("同色地心", "地心");
        g("同色戦集", "戦集");
        g("同色馬弓兵", "馬弓兵");
        g("同色獣", "獣");
        g("同色行行", "行行");
        g("同色筆兵無傾", "筆兵無傾");
        g("同色闇戦之集", "闇戦之集");
        return ans;
    }
    function calculate_hands_(count) {
        if (count["王"]["黒"] === 0 && count["王"]["赤"] === 0) {
            return calculate_hands_with_no_king(count);
        }
        else {
            return calculate_hands_with_king(count);
        }
    }
    function calculate_hands_from_pieces(ps) {
        const pieces = ps.map(a => toObtainablePieces2[a]);
        let count = {
            "兵": { "黒": 0, "赤": 0 },
            "弓": { "黒": 0, "赤": 0 },
            "車": { "黒": 0, "赤": 0 },
            "虎": { "黒": 0, "赤": 0 },
            "馬": { "黒": 0, "赤": 0 },
            "筆": { "黒": 0, "赤": 0 },
            "巫": { "黒": 0, "赤": 0 },
            "将": { "黒": 0, "赤": 0 },
            "王": { "黒": 0, "赤": 0 },
            "船": { "黒": 0, "赤": 0 },
        };
        for (let i = 0; i < pieces.length; i++) {
            count[pieces[i].prof][pieces[i].color]++;
        }
        // check if the input contains too many pieces
        let too_many_list = [];
        if (count["兵"]["黒"] > 8) {
            too_many_list.push("黒兵");
        }
        if (count["兵"]["赤"] > 8) {
            too_many_list.push("赤兵");
        }
        if (count["弓"]["黒"] > 2) {
            too_many_list.push("黒弓");
        }
        if (count["弓"]["赤"] > 2) {
            too_many_list.push("赤弓");
        }
        if (count["車"]["黒"] > 2) {
            too_many_list.push("黒車");
        }
        if (count["車"]["赤"] > 2) {
            too_many_list.push("赤車");
        }
        if (count["虎"]["黒"] > 2) {
            too_many_list.push("黒虎");
        }
        if (count["虎"]["赤"] > 2) {
            too_many_list.push("赤虎");
        }
        if (count["馬"]["黒"] > 2) {
            too_many_list.push("黒馬");
        }
        if (count["馬"]["赤"] > 2) {
            too_many_list.push("赤馬");
        }
        if (count["筆"]["黒"] > 2) {
            too_many_list.push("黒筆");
        }
        if (count["筆"]["赤"] > 2) {
            too_many_list.push("赤筆");
        }
        if (count["巫"]["黒"] > 2) {
            too_many_list.push("黒巫");
        }
        if (count["巫"]["赤"] > 2) {
            too_many_list.push("赤巫");
        }
        if (count["将"]["黒"] > 2) {
            too_many_list.push("黒将");
        }
        if (count["将"]["赤"] > 2) {
            too_many_list.push("赤将");
        }
        if (count["王"]["黒"] > 1) {
            too_many_list.push("黒王");
        }
        if (count["王"]["赤"] > 1) {
            too_many_list.push("赤王");
        }
        if (count["船"]["黒"] > 1) {
            too_many_list.push("黒船");
        }
        if (count["船"]["赤"] > 1) {
            too_many_list.push("赤船");
        }
        if (too_many_list.length > 0) {
            return { "too_many": too_many_list };
        }
        return [...calculate_hands_(count)];
    }
    function calculate_hands_and_score_from_pieces(ps) {
        const hands = calculate_hands_from_pieces(ps);
        if (Array.isArray(hands)) {
            return { "error": false, "score": hands.map(a => toScore[a]).reduce((a, b) => a + b, 0), "hands": hands };
        }
        else {
            return { "error": true, "too_many": hands.too_many };
        }
    }
    const tests = [
        { "pieces": ["赤弓"], "score": 0, "hands": [] },
        { "pieces": ["赤兵"], "score": 0, "hands": [] },
        { "pieces": ["赤車"], "score": 0, "hands": [] },
        { "pieces": ["赤筆"], "score": 0, "hands": [] },
        { "pieces": ["黒車"], "score": 0, "hands": [] },
        { "pieces": ["赤馬"], "score": 0, "hands": [] },
        { "pieces": ["黒巫"], "score": 0, "hands": [] },
        { "pieces": ["黒巫"], "score": 0, "hands": [] },
        { "pieces": ["赤車"], "score": 0, "hands": [] },
        { "pieces": ["赤虎"], "score": 0, "hands": [] },
        { "pieces": ["赤兵"], "score": 0, "hands": [] },
        { "pieces": ["赤巫"], "score": 0, "hands": [] },
        { "pieces": ["黒車"], "score": 0, "hands": [] },
        { "pieces": ["黒筆"], "score": 0, "hands": [] },
        { "pieces": ["黒将"], "score": 0, "hands": [] },
        { "pieces": ["赤虎"], "score": 0, "hands": [] },
        { "pieces": ["黒王"], "score": 5, "hands": ["王"] },
        { "pieces": ["黒車", "黒将"], "score": 0, "hands": [] },
        { "pieces": ["黒弓", "赤兵"], "score": 0, "hands": [] },
        { "pieces": ["赤車", "赤巫"], "score": 0, "hands": [] },
        { "pieces": ["赤兵", "黒兵"], "score": 0, "hands": [] },
        { "pieces": ["黒虎", "赤馬"], "score": 3, "hands": ["獣"] },
        { "pieces": ["赤兵", "黒兵"], "score": 0, "hands": [] },
        { "pieces": ["赤船", "赤筆"], "score": 0, "hands": [] },
        { "pieces": ["赤兵", "赤馬"], "score": 0, "hands": [] },
        { "pieces": ["赤筆", "黒将"], "score": 0, "hands": [] },
        { "pieces": ["赤弓", "赤兵"], "score": 0, "hands": [] },
        { "pieces": ["黒兵", "赤弓"], "score": 0, "hands": [] },
        { "pieces": ["黒虎", "黒王"], "score": 10, "hands": ["王", "同色獣"] },
        { "pieces": ["赤船", "赤王"], "score": 5, "hands": ["王"] },
        { "pieces": ["赤虎", "赤将", "黒兵"], "score": 0, "hands": [] },
        { "pieces": ["赤船", "赤兵", "赤王"], "score": 5, "hands": ["王"] },
        { "pieces": ["黒筆", "黒虎", "黒馬"], "score": 5, "hands": ["同色獣"] },
        { "pieces": ["赤兵", "赤兵", "黒王"], "score": 11, "hands": ["助友", "戦集", "王"] },
        { "pieces": ["黒兵", "黒兵", "赤将"], "score": 3, "hands": ["戦集"] },
        { "pieces": ["赤将", "黒兵", "黒筆"], "score": 0, "hands": [] },
        { "pieces": ["黒弓", "赤兵", "黒兵"], "score": 0, "hands": [] },
        { "pieces": ["赤馬", "赤虎", "赤車"], "score": 5, "hands": ["同色獣"] },
        { "pieces": ["黒車", "黒兵", "赤兵"], "score": 3, "hands": ["助友"] },
        { "pieces": ["黒将", "黒兵", "赤兵"], "score": 3, "hands": ["戦集"] },
        { "pieces": ["黒筆", "赤王", "黒巫"], "score": 12, "hands": ["王", "地心"] },
        { "pieces": ["赤船", "黒車", "赤王"], "score": 10, "hands": ["王", "行行"] },
        { "pieces": ["黒車", "赤兵", "赤兵"], "score": 3, "hands": ["助友"] },
        { "pieces": ["黒虎", "黒兵", "黒馬", "赤兵"], "score": 5, "hands": ["同色獣"] },
        { "pieces": ["赤車", "赤兵", "黒巫", "赤兵"], "score": 5, "hands": ["同色助友"] },
        { "pieces": ["赤将", "黒馬", "赤車", "黒兵"], "score": 0, "hands": [] },
        { "pieces": ["黒兵", "赤車", "黒筆", "黒兵"], "score": 3, "hands": ["助友"] },
        { "pieces": ["赤筆", "黒虎", "赤虎", "赤巫"], "score": 0, "hands": [] },
        { "pieces": ["赤車", "赤兵", "赤弓", "黒兵"], "score": 3, "hands": ["助友"] },
        { "pieces": ["赤兵", "赤車", "黒将", "黒巫"], "score": 0, "hands": [] },
        { "pieces": ["黒車", "黒馬", "黒馬", "赤車"], "score": 0, "hands": [] },
        { "pieces": ["黒兵", "黒王", "黒弓", "赤兵"], "score": 18, "hands": ["助友", "戦集", "王", "同色馬弓兵"] },
        { "pieces": ["黒兵", "黒兵", "赤弓", "黒馬"], "score": 5, "hands": ["馬弓兵"] },
        { "pieces": ["赤兵", "黒弓", "黒船", "赤王"], "score": 10, "hands": ["王", "馬弓兵"] },
        { "pieces": ["黒虎", "赤弓", "黒兵", "赤王"], "score": 13, "hands": ["獣", "王", "馬弓兵"] },
        { "pieces": ["黒馬", "黒筆", "赤将", "赤馬", "赤兵"], "score": 0, "hands": [] },
        { "pieces": ["赤馬", "赤巫", "黒船", "黒兵", "黒兵"], "score": 0, "hands": [] },
        { "pieces": ["黒将", "黒馬", "黒兵", "黒車", "赤馬"], "score": 0, "hands": [] },
        { "pieces": ["赤将", "赤車", "黒馬", "赤兵", "黒兵"], "score": 6, "hands": ["助友", "戦集"] },
        { "pieces": ["赤虎", "赤将", "黒兵", "赤兵", "黒馬"], "score": 6, "hands": ["獣", "戦集"] },
        { "pieces": ["赤兵", "赤虎", "赤将", "黒筆", "赤兵"], "score": 5, "hands": ["同色戦集"] },
        { "pieces": ["赤車", "黒兵", "黒巫", "黒兵", "赤馬"], "score": 3, "hands": ["助友"] },
        { "pieces": ["黒兵", "黒弓", "赤筆", "赤巫", "黒王"], "score": 29, "hands": ["地心", "筆兵無傾", "同色馬弓兵", "王"] },
        { "pieces": ["赤兵", "赤筆", "赤車", "赤兵", "黒車", "赤虎"], "score": 5, "hands": ["同色助友"] },
        { "pieces": ["黒車", "赤兵", "黒弓", "赤兵", "赤虎", "黒兵"], "score": 3, "hands": ["助友"] },
        { "pieces": ["赤将", "黒兵", "黒兵", "赤車", "赤車", "赤弓"], "score": 6, "hands": ["助友", "戦集"] },
        { "pieces": ["赤船", "赤馬", "赤虎", "赤兵", "黒筆", "赤将"], "score": 5, "hands": ["同色獣"] },
        { "pieces": ["黒筆", "黒弓", "黒王", "黒兵", "赤弓", "赤車"], "score": 15, "hands": ["王", "助友", "同色馬弓兵"] },
        { "pieces": ["黒馬", "赤兵", "赤兵", "黒筆", "赤将", "黒車"], "score": 8, "hands": ["助友", "同色戦集"] },
        { "pieces": ["黒将", "赤筆", "赤兵", "黒弓", "黒王", "赤王"], "score": 36, "hands": ["王", "馬弓兵", "地心", "筆兵無傾", "獣", "戦集", "助友"] },
        { "pieces": ["赤兵", "黒車", "黒兵", "赤将"], "score": 6, "hands": ["助友", "戦集"] },
        { "pieces": ["黒将", "赤弓", "黒兵", "黒兵"], "score": 5, "hands": ["同色戦集"] },
        { "pieces": ["赤弓", "赤車", "赤筆", "赤将", "赤虎", "黒弓"], "score": 0, "hands": [] },
        { "pieces": ["赤車", "黒王", "黒兵", "黒船", "黒兵", "黒馬"], "score": 34, "hands": ["王", "同色助友", "同色戦集", "同色馬弓兵", "同色行行", "同色獣"] },
        { "pieces": ["赤兵", "赤巫", "赤馬", "赤虎", "赤将", "赤兵"], "score": 10, "hands": ["同色獣", "同色戦集"] },
        { "pieces": ["黒弓", "黒馬", "赤筆", "赤将", "黒兵", "黒兵"], "score": 10, "hands": ["同色馬弓兵", "戦集"] },
        { "pieces": ["赤兵", "黒筆", "赤虎", "黒兵", "赤筆", "黒巫"], "score": 0, "hands": [] },
        { "pieces": ["黒虎", "黒兵", "赤兵", "赤巫", "黒巫", "黒馬", "赤兵"], "score": 5, "hands": ["同色獣"] },
        { "pieces": ["黒車", "赤将", "黒筆", "黒兵", "黒馬", "赤筆", "赤兵"], "score": 6, "hands": ["助友", "戦集"] },
        { "pieces": ["赤虎", "赤将", "黒虎", "赤弓", "赤兵", "赤将", "赤兵"], "score": 5, "hands": ["同色戦集"] },
        { "pieces": ["赤王", "赤馬", "黒兵", "赤兵", "黒馬", "赤虎", "黒筆"], "score": 23, "hands": ["助友", "戦集", "王", "同色獣", "同色馬弓兵"] },
        { "pieces": ["赤将", "黒船", "黒巫", "黒弓", "黒車", "黒兵", "黒将"], "score": 0, "hands": [] },
        { "pieces": ["黒兵", "赤兵", "黒弓", "黒車", "黒巫", "赤巫", "赤馬"], "score": 8, "hands": ["助友", "馬弓兵"] },
        { "pieces": ["黒馬", "黒兵", "赤馬", "赤筆", "赤弓", "黒馬", "黒兵"], "score": 5, "hands": ["馬弓兵"] },
        { "pieces": ["黒巫", "赤筆", "赤兵", "黒兵", "赤車", "黒将", "赤兵", "赤虎"], "score": 15, "hands": ["戦集", "同色助友", "地心"] },
        { "pieces": ["黒車", "黒馬", "黒船", "赤船", "黒兵", "赤馬", "黒車", "赤巫"], "score": 7, "hands": ["同色行行"] },
        { "pieces": ["赤兵", "黒馬", "黒兵", "赤兵", "赤巫", "黒筆", "黒兵", "黒虎"], "score": 5, "hands": ["同色獣"] },
        { "pieces": ["黒車", "黒将", "黒巫", "赤兵", "黒兵", "赤巫", "黒弓", "赤兵"], "score": 6, "hands": ["助友", "戦集"] },
        { "pieces": ["黒兵", "黒筆", "赤馬", "赤巫", "赤筆", "赤車", "黒巫", "黒将"], "score": 9, "hands": ["同色地心"] },
        { "pieces": ["黒船", "黒馬", "黒筆", "黒虎", "黒将", "赤巫", "赤虎", "赤兵"], "score": 12, "hands": ["同色獣", "地心"] },
        { "pieces": ["赤車", "黒兵", "赤王", "赤兵", "赤兵", "赤巫", "黒虎", "赤筆"], "score": 27, "hands": ["王", "同色助友", "同色戦集", "同色地心", "獣"] },
        { "pieces": ["赤馬", "黒弓", "黒将", "赤王", "赤船", "赤将", "赤将", "黒馬"], "score": 22, "hands": ["馬弓兵", "同色行行", "王", "同色獣"] },
        { "pieces": ["黒兵", "赤馬", "赤巫", "黒筆", "黒馬", "黒巫", "黒将", "赤虎", "赤馬"], "score": 14, "hands": ["同色獣", "同色地心"] },
        { "pieces": ["黒将", "黒兵", "赤兵", "黒虎", "黒兵", "黒巫", "赤巫", "赤筆", "赤車"], "score": 15, "hands": ["同色戦集", "助友", "地心"] },
        { "pieces": ["赤弓", "赤兵", "黒兵", "黒兵", "黒兵", "黒虎", "赤兵", "赤車", "黒巫"], "score": 8, "hands": ["闇戦之集", "同色助友"] },
        { "pieces": ["赤車", "黒将", "黒兵", "黒虎", "赤兵", "黒車", "黒虎", "黒巫", "赤兵"], "score": 8, "hands": ["同色助友", "戦集"] },
        { "pieces": ["赤将", "黒王", "黒将", "黒馬", "黒馬", "黒兵", "黒巫", "黒兵", "黒兵"], "score": 36, "hands": ["同色戦集", "王", "同色助友", "同色獣", "同色馬弓兵", "同色地心"] },
        { "pieces": ["黒巫", "赤筆", "黒兵", "黒巫", "黒兵", "赤兵", "赤兵", "赤馬", "赤馬"], "score": 0, "hands": [] },
        { "pieces": ["黒虎", "赤虎", "黒馬", "赤弓", "赤王", "黒筆", "黒船", "黒車", "赤兵"], "score": 27, "hands": ["同色馬弓兵", "同色獣", "助友", "王", "同色行行"] },
        { "pieces": ["赤弓", "黒筆", "黒巫", "黒兵", "黒船", "赤兵", "赤将", "赤王", "赤馬"], "score": 47, "hands": ["王", "同色戦集", "行行", "同色獣", "同色馬弓兵", "地心", "筆兵無傾", "助友"] },
        { "pieces": ["赤筆", "黒将", "黒筆", "赤兵", "黒兵", "赤兵", "赤兵", "黒兵", "黒弓"], "score": 8, "hands": ["闇戦之集", "同色戦集"] },
        { "pieces": ["黒兵", "赤兵", "赤兵", "赤虎", "赤王", "黒兵", "赤車", "赤虎", "赤兵"], "score": 23, "hands": ["闇戦之集", "同色助友", "同色戦集", "同色獣", "王"] },
        { "pieces": ["赤兵", "赤弓", "赤虎", "赤兵", "赤兵", "黒巫", "赤兵", "赤兵", "黒兵"], "score": 5, "hands": ["同色闇戦之集"] }
    ];
    for (let i = 0; i < tests.length; i++) {
        const scores_and_hands = calculate_hands_and_score_from_pieces(tests[i].pieces);
        if (scores_and_hands.error === false) {
            const { score, hands } = scores_and_hands;
            if (score === tests[i].score && JSON.stringify(hands.sort()) === JSON.stringify(tests[i].hands.sort())) {
                console.log("ok");
            }
            else {
                console.log(`wrong, in ${tests[i].pieces.join("、")}; 
            expected ${score} from ${hands.sort().join("、")} 
            but got ${tests[i].score} from ${tests[i].hands.sort().join("、")}`);
            }
        }
        else {
            alert(`wrong, in ${tests[i].pieces.join("、")}; too many of ${scores_and_hands.too_many.join("、")}`);
        }
    }
})();
