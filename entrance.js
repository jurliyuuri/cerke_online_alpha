"use strict";
let UNLOAD_TRIGGERED_BY_USER = true;
window.addEventListener("beforeunload", function (e) {
    if (!UNLOAD_TRIGGERED_BY_USER) {
        // beforeunload should only capture what has been triggered by the user
        return;
    }
    (async () => {
        if (typeof RESULT !== "undefined") { // you already have an access token
            const r = await sendCancel(RESULT.access_token, (a) => a);
            if (!r.legal) {
                alert(`sending cancel somehow resulted in an error: ${r.whyIllegal}`);
                throw new Error(`sending cancel somehow resulted in an error: ${r.whyIllegal}`);
            }
            if (r.cancellable) { // successfully cancelled; you can exit the page
                return;
            }
            else {
                e.preventDefault();
                e.returnValue = "cannot cancel the game, as it is already ready";
            }
        }
    })();
});
async function sendCancel(access_token, validateInput) {
    return await sendSomethingSomewhere("http://localhost:23564/random/cancel", {
        access_token,
    }, validateInput);
}
function let_the_game_begin(access_token) {
    alert("Let the game begin");
    sessionStorage.access_token = access_token;
    location.href = "main.html";
}
let RESULT;
function apply_for_random_game() {
    (async () => {
        let res = await sendEntrance((a) => a);
        RESULT = res;
        while (res.state != "let_the_game_begin") {
            await new Promise((resolve) => setTimeout(resolve, (2 + Math.random()) * 200 * 0.8093));
            const newRes = await sendPoll(res.access_token, (a) => a);
            if (newRes.legal) {
                res = newRes.ret;
                RESULT = res;
            }
            else {
                // re-entry
                res = await sendEntrance((a) => a);
                RESULT = res;
            }
        }
        let_the_game_begin(res.access_token);
    })();
}
async function sendPoll(access_token, validateInput) {
    return await sendSomethingSomewhere("http://localhost:23564/random/poll", {
        access_token,
    }, validateInput);
}
async function sendSomethingSomewhere(url, data, validateInput) {
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    }).then(function (res) {
        return res.json();
    }).then(validateInput)
        .catch(function (error) {
        console.error("Error:", error);
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
    return await sendSomethingSomewhere("http://localhost:23564/random/entry", {}, validateInput);
}
