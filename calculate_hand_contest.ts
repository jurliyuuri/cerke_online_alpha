/* magic estimator */
function estimate_prob_of_hand_existing(piece_num: number) {
    return 1 / (1 + Math.exp(-0.82487 * (piece_num - 4.426)));
}

type Prob = ObtainablePieces[];

const initialize_funcs = (TOTAL_PROB_NUM: number) => {

function create_probs(): Prob[] {
    const prob_piece_nums = Array.from({length: TOTAL_PROB_NUM}).map(() => Math.floor(Math.random() * 7 + 3.5)).sort((a,b) => a - b);
   
    return prob_piece_nums.map(piece_num => {
        if (estimate_prob_of_hand_existing(piece_num) < 0.6) { // if less than 60%, skew
            const should_contain_hand = Math.random() < 0.6; // contains hands with 60% chance
            while (true) {
                const k = generate_example(piece_num);
                const u = calculate_hands_and_score_from_pieces(k);
                if (u.error === true) { throw new Error("cannot happen"); }

                if ((u.hands.length > 0) === should_contain_hand) { return k; }
            }
        } else {
            return generate_example(piece_num);
        }
    });
}

const PROBS = create_probs();

let CURRENT_PROB = -1;

let ANS_LIST: ({"correct_ans": Hand[], "user_ans": Hand[], "matches": false} | {"ans": Hand[], "matches": true})[] = [];

function calculate_hand_contest() {
    if (CURRENT_PROB === TOTAL_PROB_NUM - 1) { // finish
        const correct_num = ANS_LIST.filter(a => a.matches).length;
        let html = `正答率 ${correct_num / TOTAL_PROB_NUM * 100}% (${correct_num}/${TOTAL_PROB_NUM})<table style='border-collapse: collapse; border-spacing: 0;'><tr><td>手駒</td><td></td><td>正解</td><td>回答</td>`;
        for (let i = 0; i < ANS_LIST.length; i++) {
            html += `<tr><td>${to_images(PROBS[i])}</td>`;
            const a = ANS_LIST[i];
            if (a.matches === true) {
                html += `<td>正</td><td>${a.ans.join("、")}</td><td>${a.ans.join("、")}</td>`
            } else {
                html += `<td>誤</td><td>${a.correct_ans.join("、")}</td><td>${a.user_ans.join("、")}</td>`
            }
            html += "</tr>"
        }
        html += "</table>"
        document.getElementById("contest")!.innerHTML = "";
        document.getElementById("result")!.innerHTML = html;
        return;
    }
    CURRENT_PROB++;
    document.getElementById("result")!.innerHTML = "";
    create_form(PROBS[CURRENT_PROB], CURRENT_PROB);
}

function submit_ans(salt: string) {
    (document.getElementById("submit_" + salt)! as HTMLInputElement).disabled = true;
    let ans: Hand[] = [];
    const f = (hand_id: string, hand: Hand, hand_flash: Hand) => {
        const normal_node = document.getElementById(hand_id + "_" + salt)! as HTMLInputElement;
        normal_node.disabled = true;
        const flash_node = document.getElementById(hand_id + "_flash_" + salt)! as HTMLInputElement;
        flash_node.disabled = true;
        const no_node = document.getElementById(hand_id + "_not_" + salt)! as HTMLInputElement;
        no_node.disabled = true;
        if (normal_node.checked) {
            ans.push(hand);
        } else if (flash_node.checked) {
            ans.push(hand_flash);
        }
    }
    f("unbeatable", "無抗行処", "同色無抗行処"); 
    f("social_order", "筆兵無傾", "同色筆兵無傾");
    f("culture", "地心", "同色地心");
    f("cavalry", "馬弓兵", "同色馬弓兵");
    f("attack", "行行", "同色行行");
    const king_node = document.getElementById("king_" + salt)! as HTMLInputElement;
    king_node.disabled = true;
    const no_king_node =  document.getElementById("king_not_" + salt)! as HTMLInputElement;
    no_king_node.disabled = true;
    if (king_node.checked) {
        ans.push("王");
    }
    f("animals", "獣", "同色獣");
    f("army", "戦集", "同色戦集");
    f("comrades", "助友", "同色助友");
    f("deadly_army", "闇戦之集", "同色闇戦之集");
    console.log("user submitted: ", ans);

    const u = calculate_hands_and_score_from_pieces(PROBS[CURRENT_PROB]);
    if (u.error === true) { throw new Error("should not happen"); }

    let html = "";
    if (JSON.stringify(ans.sort()) === JSON.stringify(u.hands.sort())) {
        html = "<strong style='background-color: rgb(174, 242, 193)'>正解!</strong>";
        ANS_LIST.push({"ans": ans, "matches": true});
    } else {
        html = `<strong style='background-color: rgb(253, 172, 181)'>不正解...</strong>${
           ans.length > 0 ? ans.sort().join("、") : "役なし"
        }ではなく${
            u.hands.length > 0 ? u.hands.sort().join("、") : "役なし" 
        }です`;
        ANS_LIST.push({"correct_ans": u.hands, "user_ans": ans, "matches": false});
    }

    html += "<input type='button' onclick='calculate_hand_contest()' value='OK'>";

    document.getElementById("result")!.innerHTML = html;
}

function create_form(prob: Prob, current_prob: number) {
    const salt = Math.random().toString(26).slice(2);
    const f = (hand_id: string, hand: Hand) => `
        <input type="radio" id="${hand_id}_not_${salt}" name="${hand_id}" checked>
        <label for="${hand_id}_not_${salt}">なし</label> | 
        <input type="radio" id="${hand_id}_${salt}" name="${hand_id}">
        <label for="${hand_id}_${salt}">${hand}</label> | 
        <input type="radio" id="${hand_id}_flash_${salt}" name="${hand_id}">
        <label for="${hand_id}_flash_${salt}">同色${hand}</label>
    `;

    document.getElementById("contest")!.innerHTML = [
        `<h3>第${current_prob + 1}問 (${current_prob + 1}/${TOTAL_PROB_NUM})</h3>`,
        prob.join("、"),
        to_images(prob),
        f("unbeatable", "無抗行処"), 
        f("social_order", "筆兵無傾"),
        f("culture", "地心"),
        f("cavalry", "馬弓兵"),
        f("attack", "行行"),
        `
            <input type="radio" id="king_not_${salt}" name="king" checked>
            <label for="king_not_${salt}">なし</label> | 
            <input type="radio" id="king_${salt}" name="king">
            <label for="king_${salt}">王 = 同色王</label>
        `,
        f("animals", "獣"),
        f("army", "戦集"),
        f("comrades", "助友"),
        f("deadly_army", "闇戦之集")
    ].join("<br>") + `<br><input type='button' id='submit_${salt}' onclick='submit_ans("${salt}")' value='決定'>`;
}

function to_images(prob: Prob): string{
    const to_paige: {[P in ObtainableProf]: string} = {
        "兵": "kauk",
        "虎": "dau",
        "弓": "gua",
        "王": "io",
        "車": "kaun",
        "筆": "kua",
        "馬": "maun",
        "船": "nuak",
        "巫": "tuk",
        "将": "uai"
    };

    return prob.map(piece => `<img src="image/piece/${ 
        toObtainablePieces2[piece].color === "赤" ? "r" : "b"
    }${to_paige[toObtainablePieces2[piece].prof]}.png" width="30" style="padding: 2px;">`).join("");
}

return {calculate_hand_contest, submit_ans};

};