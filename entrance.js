"use strict";
function let_the_game_begin(access_token) {
    alert("Let the game begin");
}
function apply_for_random_game() {
    (async () => {
        let res = await sendEntrance(a => a);
        while (res.state != "let_the_game_begin") {
            await new Promise(resolve => setTimeout(resolve, (2 + Math.random()) * 200 * 0.8093));
            const newRes = await sendPoll(res.access_token, a => a);
            if (newRes.legal) {
                res = newRes.ret;
            }
            else {
                // re-entry
                res = await sendEntrance(a => a);
            }
        }
        let_the_game_begin(res.access_token);
    })();
}
async function sendPoll(access_token, validateInput) {
    let url = 'http://localhost:23564/random/poll';
    const data = {
        "access_token": access_token
    };
    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (res) {
        return res.json();
    }).then(validateInput)
        .catch(function (error) {
        console.error('Error:', error);
        return;
    });
    console.log(res);
    if (!res) {
        alert("network error!");
        throw new Error("network error!");
    }
    return res;
}
async function sendEntrance(validateInput) {
    let url = 'http://localhost:23564/random/entry';
    const data = {};
    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (res) {
        return res.json();
    }).then(validateInput)
        .catch(function (error) {
        console.error('Error:', error);
        return;
    });
    console.log(res);
    if (!res) {
        alert("network error!");
        throw new Error("network error!");
    }
    return res;
}
