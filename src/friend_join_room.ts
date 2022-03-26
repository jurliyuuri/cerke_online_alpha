import { API_ORIGIN } from "./env";
import { WhoGoesFirst, RetFriendJoinRoom } from "cerke_online_api";


type RoomId = string & { __RoomIdBrand: never };
type RoomKey = string & { __RoomKeyBrand: never };

const params = new URLSearchParams((new URL(location.href)).search);
const room_key_ = params.get("room_key");
const room_id_ = params.get("room_id");

if (room_key_ == null || room_id_ == null) {
	alert("この対戦参加用 URL は無効です");
	location.href = "entrance.html";
} else {
	const room_key = room_key_ as RoomKey;
	const room_id = room_id_ as RoomId;
	(async () => {
		console.log(`trying to join a room ${room_id} with a key ${room_key}:`);
		const res: RetFriendJoinRoom = await sendJoin<RetFriendJoinRoom>(
			{ room_id, room_key },
			(a) => a,
		);
		if (res.type === "Err") {
			alert(res.why_illegal);
			location.href = "entrance.html";
		} else {
			let_the_game_begin(
				res.ret.session_token as SessionToken,
				res.ret.is_first_move_my_move,
				res.ret.is_IA_down_for_me,
			);
		}
	})();
}

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

async function sendJoin<U>(
	o: { room_id: RoomId, room_key: RoomKey },
	validateInput: (response: any) => U,
): Promise<U> {
	return await sendSomethingSomewhere(
		location.href.includes("staging")
			? `${API_ORIGIN}/matching/friend/join_room/staging`
			: `${API_ORIGIN}/matching/friend/join_room`,
		o,
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