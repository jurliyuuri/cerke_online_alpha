import { drawField } from "./main";
import { GAME_STATE } from "./game_state";

console.log("drawField #", 0);
drawField({ focus: null });

document.getElementById("kait_kaik_button")!.addEventListener("click", () => {
  document.getElementById("kait_kaik")!.classList.add("nocover");
  GAME_STATE.is_my_turn = JSON.parse(sessionStorage.is_first_move_my_move);
});

if (sessionStorage.vs === "cpu") {
  document.getElementById("larta_opponent_img")!.innerHTML = `<img src="image/nystiper2.png">`;
} else if (sessionStorage.vs === "someone") {
  document.getElementById("larta_opponent_img")!.innerHTML = `<img src="image/larta2.png">`;
} else {
  // Maybe you entered this page without registering. Go back to entrance.html.
  location.href = "entrance.html";
}

console.log("GAME_STATE.is_my_turn:", GAME_STATE.is_my_turn)
console.log("GAME_STATE.IA_is_down:", GAME_STATE.IA_is_down)
document.getElementById("kiar_ark")!.innerHTML = `{始時:${(new Date()).toISOString()}}
{一位色:${GAME_STATE.is_my_turn === GAME_STATE.IA_is_down ? "黒" : "赤"}}
`;
