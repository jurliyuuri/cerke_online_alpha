import { API_ORIGIN } from "./env";
import { RetVsCpuEntry } from "cerke_online_api";

type AccessToken = string & { __AccessTokenBrand: never };
function let_the_game_begin(
  access_token: AccessToken,
  is_first_move_my_move: boolean,
  is_IA_down_for_me: boolean,
) {
  sessionStorage.access_token = access_token;
  sessionStorage.vs = "cpu";
  sessionStorage.is_first_move_my_move = JSON.stringify(is_first_move_my_move);
  sessionStorage.is_IA_down_for_me = JSON.stringify(is_IA_down_for_me);
  location.href = "main.html";
}

let RESULT: RetVsCpuEntry | undefined;

function apply_for_vs_cpu_game() {
  (async () => {
    const res: RetVsCpuEntry = await sendVsCpuEntrance<RetVsCpuEntry>(
      (a) => a,
    );
    RESULT = res;
    let_the_game_begin(
      res.access_token as AccessToken,
      res.is_first_move_my_move.result, // FIXME: also use .process
      res.is_IA_down_for_me,
    );
  })();
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

async function sendVsCpuEntrance<U>(
  validateInput: (response: any) => U,
): Promise<U> {
  return await sendSomethingSomewhere(
    location.href.includes("staging")
      ? `${API_ORIGIN}/vs_cpu/entry/staging`
      : `${API_ORIGIN}/vs_cpu/entry`,
    {},
    validateInput,
  );
}

apply_for_vs_cpu_game();
