import { WhoGoesFirst } from "cerke_online_api";
import { animateSeasonInitiation, drawField } from "./both_sides";
import { GAME_STATE } from "./game_state";
import * as KiarArk from "./kiar_ark";
import { apply_membrane_state_to_dom } from "./protective_cover";

(
  document.getElementById("coord_annotation")! as HTMLImageElement
).src = `image/IA_is_down=${GAME_STATE.IA_is_down}_x-faikleone=${sessionStorage.lang === "x-faikleone"}.svg`;
console.log("drawField #", 0);
drawField({ focus: null });

if (sessionStorage.lang === "x-faikleone") {
  document.getElementById("kiar_ark")!.classList.add("always_linmarn_bitmap");
  document.getElementById("opponent_message_linzklar")!.classList.add("always_geometric_linzklar");
} else {
  document.getElementById("kiar_ark")!.classList.add("use_linmarn_bitmap_unless_hovered");
  document.getElementById("opponent_message_linzklar")!.classList.add("use_geometric_linzklar_unless_hovered");
}

if (sessionStorage.kiar_ark) {
  KiarArk.resurrect(JSON.parse(sessionStorage.kiar_ark));
  KiarArk.display_kiar_ark();
} else {
  KiarArk.push_header_elem_and_display({
    type: "header",
    dat: `{始時:${new Date().toISOString()}}`,
  });
}

let COORD_TOGGLE: boolean = false;
document
  .getElementById("coord_toggle_button")!
  .addEventListener("click", () => {
    COORD_TOGGLE = !COORD_TOGGLE;
    console.log("COORD_TOGGLE now set to", COORD_TOGGLE);
    document.getElementById("coord_annotation")!.style.visibility = COORD_TOGGLE
      ? "visible"
      : "hidden";
    (document.getElementById("coord_toggle_button")! as HTMLInputElement).src =
      COORD_TOGGLE
        ? "image/toggle/coord_toggle_active.png"
        : "image/toggle/coord_toggle_inactive.png";
  });

export let KRUT_CRUOP: boolean = true;
// toggles `sound/ciurl4.ogg` and `sound/thud.ogg`.

document.getElementById("krut_cruop_button")!.addEventListener("click", () => {
  KRUT_CRUOP = !KRUT_CRUOP;
  console.log("KRUT_CRUOP now set to", KRUT_CRUOP);
  (document.getElementById("krut_cruop_button")! as HTMLInputElement).src =
    KRUT_CRUOP
      ? "image/toggle/kut2_cuop2_active.png"
      : "image/toggle/kut2_cuop2_inactive.png";
});

const BACKGROUND_MUSIC = new Audio(Math.random() < 0.5 ? "sound/cetkaik_ad_loop.mp3" : "sound/cetkaik_leti_duxe_.ogg");
BACKGROUND_MUSIC.loop = true;

export function stopMusicLoop() {
  BACKGROUND_MUSIC.loop = false;
}

let user_interaction: boolean = false;

// toggles the music.
export let LORK_LIAR_ENABLED: boolean = false; // must start with false because otherwise the browser blocks the autoplay
export let LORK_LIAR: number = Number(
  (document.getElementById("volume_slidebar")! as HTMLInputElement).value,
);
BACKGROUND_MUSIC.volume = LORK_LIAR_ENABLED ? LORK_LIAR / 100 : 0;

function toggleBackgroundMusic() {
  LORK_LIAR_ENABLED = !LORK_LIAR_ENABLED;
  if (!user_interaction && LORK_LIAR_ENABLED) {
    BACKGROUND_MUSIC.play();
    user_interaction = true;
  }
  (document.getElementById("lork_liar_button")! as HTMLInputElement).src =
    LORK_LIAR_ENABLED
      ? "image/toggle/lok1_lia1_active.png"
      : "image/toggle/lok1_lia1_inactive.png";
  (document.getElementById("volume_slidebar")! as HTMLInputElement).disabled =
    !LORK_LIAR_ENABLED;
  BACKGROUND_MUSIC.volume = LORK_LIAR_ENABLED ? LORK_LIAR / 100 : 0;
}

document
  .getElementById("lork_liar_button")!
  .addEventListener("click", toggleBackgroundMusic);

(
  document.getElementById("volume_slidebar")! as HTMLInputElement
).addEventListener("input", () => {
  LORK_LIAR = Number(
    (document.getElementById("volume_slidebar")! as HTMLInputElement).value,
  );
  BACKGROUND_MUSIC.volume = LORK_LIAR_ENABLED ? LORK_LIAR / 100 : 0;
});

if (!sessionStorage.getItem('game_state_backup')) {
  // new game
  // 新規ゲーム
  document.getElementById("kait_kaik_button")!.addEventListener("click", async () => {
    document.getElementById("kait_kaik")!.classList.add("nocover");
    const is_first_move_my_move: WhoGoesFirst = JSON.parse(sessionStorage.is_first_move_my_move);
    if (!LORK_LIAR_ENABLED) {
      toggleBackgroundMusic();
    }

    await animateSeasonInitiation(is_first_move_my_move);
  });
} else {
  // resurrect the game
  // ゲームを復活させる
  (document.getElementById("kait_kaik_button")! as HTMLImageElement).src = "image/ty_zau.png";
  document.getElementById("kait_kaik_button")!.addEventListener("click", async () => {

    // Only after pressing "ty zau" will we allow the player from clicking other pieces 
    // "ty zau" のボタンを押して初めて他の駒を動かせる、とするのがいいので、そうする
    apply_membrane_state_to_dom();

    // Trigger the setter by assigning `GAME_STATE.is_my_turn` to itself. Double negation is required here to evade ESLint.
    // GAME_STATE.is_my_turn を自分自身に代入することでセッターをトリガーする。ESLint の目から逃れるために二重否定を書いている。
    GAME_STATE.is_my_turn = !!GAME_STATE.is_my_turn;
    document.getElementById("kait_kaik")!.classList.add("nocover");
    if (!LORK_LIAR_ENABLED) {
      toggleBackgroundMusic();
    }
  });
}

if (sessionStorage.vs === "cpu") {
  document.getElementById(
    "opponent_icon",
  )!.innerHTML = `<img src="image/nystiper2.png">`;
} else if (sessionStorage.vs === "someone") {
  document.getElementById(
    "opponent_icon",
  )!.innerHTML = `<img src="image/larta2.png">`;
} else {
  // Maybe you entered this page without registering. Go back to entrance.html.
  location.href = "entrance.html";
}
