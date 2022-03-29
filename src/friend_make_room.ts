import { API_ORIGIN } from "./env";
import { WhoGoesFirst, RetFriendDeleteRoom, RetFriendMakeRoom, RetFriendPoll } from "cerke_online_api";

type SessionToken = string & { __SessionTokenBrand: never };
function let_the_game_begin(
	session_token: SessionToken,
	is_first_move_my_move: WhoGoesFirst,
	is_IA_down_for_me: boolean,
) {
	sessionStorage.vs = "someone";
	sessionStorage.session_token = session_token;
	sessionStorage.is_first_move_my_move = JSON.stringify(is_first_move_my_move);
	sessionStorage.is_IA_down_for_me = JSON.stringify(is_IA_down_for_me);
	location.href = "main.html";
}

let ROOM: RetFriendMakeRoom | undefined;

function make_room() {
	(async () => {
		const o: RetFriendMakeRoom = await makeRoom<RetFriendMakeRoom>((a) => a);
		ROOM = o;
		const url_segments = location.href.split("/");
		url_segments[url_segments.length - 1] = `friend_join_room.html?room_id=${o.room_id}&room_key=${o.room_key}`;
		(document.getElementById("url") as HTMLInputElement).value = url_segments.join("/");
		const url_button = document.getElementById("url-button") as HTMLInputElement;
		url_button.disabled = false;
		url_button.value = isSecureContext ? "URLをコピーする" : "全選択";
		let res: RetFriendPoll = await sendPoll<RetFriendPoll>(
			o.session_token as SessionToken,
			(a) => a,
		);
		while (res.type !== "Ok" || res.ret.type !== "LetTheGameBegin") {
			await new Promise((resolve) =>
				setTimeout(resolve, (2 + Math.random()) * 200 * 0.8093),
			);
			const newRes: RetFriendPoll = await sendPoll<RetFriendPoll>(
				o.session_token as SessionToken,
				(a) => a,
			);
			res = newRes;
		}
		let_the_game_begin(
			o.session_token as SessionToken,
			res.ret.is_first_move_my_move,
			res.ret.is_IA_down_for_me,
		);
	})();
}

make_room();

async function sendPoll<U>(
	session_token: SessionToken,
	validateInput: (response: any) => U,
): Promise<U> {
	return await sendSomethingSomewhere(
		location.href.includes("staging")
			? `${API_ORIGIN}/matching/friend/poll/staging`
			: `${API_ORIGIN}/matching/friend/poll`,
		{
			session_token,
		},
		validateInput,
	);
}

document.getElementById('cancel_button')!.onclick = function delete_room() {
	if (typeof ROOM !== "undefined") {
		(async () => {
			console.log(`trying to cancel ${ROOM.session_token}:`);
			const newRes: RetFriendDeleteRoom = await sendCancel<RetFriendDeleteRoom>(
				ROOM.session_token as SessionToken,
				(a) => a,
			);
			console.log(`got result ${JSON.stringify(newRes)}`);
		})();
	}
	location.href = "entrance.html";
}

async function sendCancel<U>(
	session_token: SessionToken,
	validateInput: (response: any) => U,
): Promise<U> {
	return await sendSomethingSomewhere(
		location.href.includes("staging")
			? `${API_ORIGIN}/matching/friend/delete_room/staging`
			: `${API_ORIGIN}/matching/friend/delete_room`,
		{
			session_token,
		},
		validateInput,
	);
}

async function sendSomethingSomewhere<T, U>(
	url: string,
	data: T,
	validateInput: (response: any) => U,
): Promise<U> {
	const res: void | U = await fetch(url, {
		method: "POST",
		body: JSON.stringify(data), // data can be `string` or {object}!
		headers: {
			"Content-Type": "application/json",
		},
		keepalive: true,
	})
		.then((res) => res.json())
		.then(validateInput)
		.catch((error) => {
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

async function makeRoom<U>(
	validateInput: (response: any) => U,
): Promise<U> {
	return await sendSomethingSomewhere(
		location.href.includes("staging")
			? `${API_ORIGIN}/matching/friend/make_room/staging`
			: `${API_ORIGIN}/matching/friend/make_room`,
		{},
		validateInput,
	);
}


