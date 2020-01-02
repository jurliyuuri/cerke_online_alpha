import Res_RandomEntry = type__message.Ret_RandomEntry;
import Res_RandomPoll = type__message.Ret_RandomPoll;

let UNLOAD_TRIGGERED_BY_USER: boolean = true;

type Ret_RandomCancel = {
    legal: false;
    whyIllegal: string
} | {
    legal: true,
    cancellable: boolean,
};

window.addEventListener("beforeunload", function(e) {
    if (!UNLOAD_TRIGGERED_BY_USER) {
        // beforeunload should only capture what has been triggered by the user
        return;
    }

    (async () => {
        if (typeof RESULT !== "undefined") { // you already have an access token
            const r = await sendCancel<Ret_RandomCancel>(RESULT.access_token as AccessToken, (a) => a);
            if (!r.legal) {
                alert(`sending cancel somehow resulted in an error: ${r.whyIllegal}`);
                throw new Error(`sending cancel somehow resulted in an error: ${r.whyIllegal}`);
            }

            if (r.cancellable) { // successfully cancelled; you can exit the page
                return;
            } else {
                e.preventDefault();
                e.returnValue = "cannot cancel the game, as it is already ready";
            }
        }
    })();
});

async function sendCancel<U>(access_token: AccessToken, validateInput: (response: any) => U): Promise<U> {
    return await sendSomethingSomewhere("https://serene-reef-96808.herokuapp.com/random/cancel", {
        access_token,
    }, validateInput);
}

type AccessToken = string & { __AccessTokenBrand: never };
function let_the_game_begin(access_token: AccessToken, is_first_move_my_move: boolean, is_IA_down_for_me: boolean) {
    alert("Let the game begin");
    sessionStorage.access_token = access_token;
    sessionStorage.is_first_move_my_move = JSON.stringify(is_first_move_my_move);
    sessionStorage.is_IA_down_for_me = JSON.stringify(is_IA_down_for_me);
    location.href = "main.html";
}

let RESULT: Res_RandomEntry | undefined;

function apply_for_random_game() {
    (async () => {
        let res: Res_RandomEntry = await sendEntrance<Res_RandomEntry>((a) => a);
        RESULT = res;
        while (res.state != "let_the_game_begin") {
            await new Promise((resolve) => setTimeout(resolve, (2 + Math.random()) * 200 * 0.8093));
            const newRes: Res_RandomPoll = await sendPoll<Res_RandomPoll>(res.access_token as AccessToken, (a) => a);
            if (newRes.legal) {
                res = newRes.ret;
                RESULT = res;
            } else {
                // re-entry
                res = await sendEntrance<Res_RandomEntry>((a) => a);
                RESULT = res;
            }
        }
        let_the_game_begin(res.access_token as AccessToken, res.is_first_move_my_move, res.is_IA_down_for_me);
    })();
}

async function sendPoll<U>(access_token: AccessToken, validateInput: (response: any) => U): Promise<U> {
    return await sendSomethingSomewhere("https://serene-reef-96808.herokuapp.com/random/poll", {
        access_token,
    }, validateInput);
}

async function sendSomethingSomewhere<T, U>(url: string, data: T, validateInput: (response: any) => U): Promise<U> {
    const res: void | U = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: {
            "Content-Type": "application/json",
        },
    }).then(function(res) {
        return res.json();
    }).then(validateInput)
        .catch(function(error) {
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

async function sendEntrance<U>(validateInput: (response: any) => U): Promise<U> {
    return await sendSomethingSomewhere("https://serene-reef-96808.herokuapp.com/random/entry", {}, validateInput);
}
