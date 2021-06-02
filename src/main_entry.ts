import { drawField } from "./main";
import { GAME_STATE } from "./game_state";

console.log("drawField #", 0);
drawField({ focus: null });

document.getElementById("kait_kaik_button")!.addEventListener("click", () => {
  document.getElementById("kait_kaik")!.classList.add("nocover");
  GAME_STATE.is_my_turn = JSON.parse(sessionStorage.is_first_move_my_move);
});
