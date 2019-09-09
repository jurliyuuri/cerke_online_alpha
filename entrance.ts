import Res_RandomEntry = type__message.Ret_RandomEntry;
import Res_RandomPoll = type__message.Ret_RandomPoll;
type AccessToken = string & { __AccessTokenBrand: never };
function let_the_game_begin(access_token: AccessToken) {
    alert("Let the game begin");
}

function apply_for_random_game() {
    (async () => {
        let res: Res_RandomEntry = await sendEntrance<Res_RandomEntry>(a => a);
        while (res.state != "let_the_game_begin") {
            await new Promise(resolve => setTimeout(resolve, (2 + Math.random()) * 200 * 0.8093));
            const newRes: Res_RandomPoll = await sendPoll<Res_RandomPoll>(res.access_token as AccessToken, a => a);
            if (newRes.legal) {
                res = newRes.ret;
            } else {
                // re-entry
                res = await sendEntrance<Res_RandomEntry>(a => a);
            }
        }
        let_the_game_begin(res.access_token as AccessToken);
    })();
}

async function sendPoll<U>(access_token: AccessToken, validateInput: (response: any) => U): Promise<U> {
    let url = 'http://localhost:23564/random/poll';
    const data = {
        "access_token": access_token
    };

    const res: void | U = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data), // data can be `string` or {object}!
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


async function sendEntrance<U>(validateInput: (response: any) => U): Promise<U> {
    let url = 'http://localhost:23564/random/entry';
    const data = {};

    const res: void | U = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data), // data can be `string` or {object}!
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
