import { Ciurl } from "cerke_online_api";
import { Coord, Piece, BoardIndex, Side, NonTam2PieceUpward, NonTam2PieceDownward } from "cerke_online_utility/lib";
import {
  createArrowSvg,
  createCancelButton,
  createCiurl,
  createPieceImgToBePlacedOnBoard,
  createPieceImgToBePlacedOnHop1zuo1,
  createPieceSizeImageOnBoardByPath_Shifted
} from "./create_html_element";
import { Season, Log2_Rate, GAME_STATE } from "./game_state";
import { BOX_SIZE } from "./html_top_left";
import { selectOwnPieceOnBoard, selectOwnPieceOnHop1zuo1 } from "./main";
import { toPath, toPath_ } from "./piece_to_path";

function removeChildren(parent: HTMLElement) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

export function getDenoteSeasonNodeTopLeft(season: Season) {
  return { top: 360 + 51 * (3 - season), left: 3 };
}

export function getDenoteScoreNodeTopLeft(score: number) {
  return { top: 447 + 21.83333333333333 * (20 - score), left: 65 };
}

export function getDenoteRateNodeTopLeft(log2_rate: Log2_Rate) {
  return { top: 873 - 96.66666666666667 * (log2_rate - 1), left: 4 };
}

/**
 * @param total_duration total duration in millisecond
 * @param rotate angle to rotate, in degrees
 */
export async function animateNode(
  node: HTMLElement,
  total_duration: number,
  to: { top: number; left: number },
  from: { top: number; left: number },
  zIndex: string = "100",
  rotate?: number,
) {
  node.style.transition = `transform ${total_duration / 1000}s ease`;
  node.style.zIndex = zIndex; // so that it doesn't go under another piece
  node.style.transform = `translateY(${to.top - from.top}px)`;
  node.style.transform += `translateX(${to.left - from.left}px)`;
  if (rotate != null) {
    node.style.transform += `rotate(${rotate}deg)`;
  }
  await new Promise(resolve => setTimeout(resolve, total_duration));
}

export async function animateStepTamLogo() {
  const step_tam_logo = document.getElementById("step_tam_logo")!;
  step_tam_logo.style.display = "block";
  step_tam_logo.classList.add("step_tam");
  const cover_while_asyncawait = document.getElementById(
    "protective_cover_over_field_while_asyncawait",
  )!;
  cover_while_asyncawait.classList.remove("nocover");

  setTimeout(() => {
    step_tam_logo.style.display = "none";
    cover_while_asyncawait.classList.add("nocover");
  }, 1200 * 0.8093);
  await new Promise(resolve => setTimeout(resolve, 1000 * 0.8093));
}

export async function animateWaterEntryLogo() {
  const water_entry_logo = document.getElementById("water_entry_logo")!;
  water_entry_logo.style.display = "block";
  water_entry_logo.classList.add("water_entry");
  const cover_while_asyncawait = document.getElementById(
    "protective_cover_over_field_while_asyncawait",
  )!;
  cover_while_asyncawait.classList.remove("nocover");

  setTimeout(() => {
    water_entry_logo.style.display = "none";
    cover_while_asyncawait.classList.add("nocover");
  }, 1200 * 0.8093);
  await new Promise(resolve => setTimeout(resolve, 1000 * 0.8093));
}

export function drawCiurl(ciurl: Ciurl, side?: Side) {
  // copied and pasted from https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
  // Standard Normal variate using Box-Muller transform.
  const randn_bm = function (): number {
    let u = 0,
      v = 0;
    while (u === 0) {
      u = Math.random();
    } // Converting [0,1) to (0,1)
    while (v === 0) {
      v = Math.random();
    }
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  const contains_ciurl = document.getElementById("contains_ciurl")!;

  eraseCiurl();

  const averageLeft = BOX_SIZE * (335 / 70 + randn_bm() / 6);
  const hop1zuo1_height = 140;
  const board_height = 631;
  const averageTop =
    84 +
    (side == null || side === Side.Upward ? hop1zuo1_height + board_height : 0);

  const imgs: HTMLImageElement[] = ciurl.map((side, ind) =>
    createCiurl(side, {
      left: averageLeft + BOX_SIZE * 0.2 * randn_bm(),
      top:
        averageTop +
        (ind + 0.5 - ciurl.length / 2) * 26 +
        BOX_SIZE * 0.05 * randn_bm(),
      rotateDeg: Math.random() * 40 - 20,
    }),
  );

  // Fisher-Yates
  for (let i = imgs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
  }

  for (let i = 0; i < imgs.length; i++) {
    contains_ciurl.appendChild(imgs[i]);
  }
}

function eraseCiurl() {
  removeChildren(document.getElementById("contains_ciurl")!);
}

export function eraseGuide(): void {
  removeChildren(document.getElementById("contains_guides")!);
  removeChildren(document.getElementById("contains_guides_on_upward")!);
}

export function erasePhantomAndOptionallyCancelButton() {
  const contains_phantom = document.getElementById("contains_phantom")!;
  while (contains_phantom.firstChild) {
    contains_phantom.removeChild(contains_phantom.firstChild);
  }
}

export function eraseArrow() {
  removeChildren(document.getElementById("arrows")!);
}

export function drawPhantomAt(coord: Coord, piece: Piece) {
  const contains_phantom = document.getElementById("contains_phantom")!;
  erasePhantomAndOptionallyCancelButton();

  const phantom: HTMLImageElement = createPieceImgToBePlacedOnBoard(
    coord,
    piece,
  );
  phantom.style.opacity = "0.1";
  contains_phantom.appendChild(phantom);
}

export function drawHoverAt_<T extends "Tam2" | NonTam2PieceUpward>(
  coord: Coord,
  piece: T,
  selectHover_: (coord: Coord, piece: T) => void,
) {
  const contains_phantom = document.getElementById("contains_phantom")!;

  const img = createPieceSizeImageOnBoardByPath_Shifted(
    coord,
    toPath_(piece),
    "piece_image_on_board",
  );

  img.style.zIndex = "100";
  img.style.cursor = "pointer";

  const selectHover = function () {
    selectHover_(coord, piece);
  };

  img.addEventListener("click", selectHover);
  contains_phantom.appendChild(img);

  // draw as already selected
  selectHover();
}

export function drawCancelButton(fn: () => void) {
  const contains_phantom = document.getElementById("contains_phantom")!;

  const cancelButton = createCancelButton();
  cancelButton.width = 80;
  cancelButton.height = 80;

  cancelButton.style.zIndex = "100";
  cancelButton.style.cursor = "pointer";
  cancelButton.setAttribute("id", "cancelButton");

  cancelButton.addEventListener("click", fn);
  contains_phantom.appendChild(cancelButton);
}

export function drawMak2Io1() {
  const denote_season = document.getElementById("denote_season")!;
  denote_season.style.top = `${getDenoteSeasonNodeTopLeft(GAME_STATE.season).top
    }px`;
  denote_season.style.transition = ``; // needs to clear the animation
  denote_season.style.transform = ``;

  const denote_score = document.getElementById("denote_score")!;
  denote_score.style.top = `${getDenoteScoreNodeTopLeft(GAME_STATE.my_score).top
    }px`;
  denote_score.style.transition = ``;
  denote_score.style.transform = ``;

  const denote_rate = document.getElementById("denote_rate")!;
  if (GAME_STATE.log2_rate === 0) {
    denote_rate.style.display = "none";
  } else {
    denote_rate.style.display = "block";
  }
  denote_rate.style.top = `${getDenoteRateNodeTopLeft(GAME_STATE.log2_rate).top
    }px`;
  denote_rate.style.transition = ``;
  denote_rate.style.transform = ``;
}

export function drawField(o: { focus?: Coord | null }) {
  console.log(`focusing:`, o.focus);

  // First, draw the board.
  {
    const board = GAME_STATE.f.currentBoard;
    const contains_pieces_on_board = document.getElementById(
      "contains_pieces_on_board",
    )!;

    // delete everything
    removeChildren(contains_pieces_on_board);

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        const piece: Piece | null = board[i][j];
        if (piece == null) {
          continue;
        }

        const coord: Coord = [i as BoardIndex, j as BoardIndex];
        const imgNode: HTMLImageElement = createPieceImgToBePlacedOnBoard(
          coord,
          piece,
        );
        imgNode.id = `field_piece_${i}_${j}`;

        if (o.focus && coord[0] === o.focus[0] && coord[1] === o.focus[1]) {
          // Add a border for the focus
          imgNode.style.border = "8px solid #ff6";
          imgNode.style.margin = "-8px";
        }

        if (piece === "Tam2") {
          // prevent tam2 ty sak2
          if (!GAME_STATE.opponent_has_just_moved_tam) {
            imgNode.style.cursor = "pointer";
            imgNode.addEventListener("click", function () {
              selectOwnPieceOnBoard(coord, piece);
            });
          }
        } else if (piece.side === Side.Upward) {
          const q: NonTam2PieceUpward = {
            prof: piece.prof,
            side: Side.Upward,
            color: piece.color,
          };
          imgNode.style.cursor = "pointer";
          imgNode.addEventListener("click", function () {
            selectOwnPieceOnBoard(coord, q);
          });
        }

        contains_pieces_on_board.appendChild(imgNode);
      }
    }
  }

  // Then, draw the Upward's hop1zuo1
  {
    const list: NonTam2PieceUpward[] = GAME_STATE.f.hop1zuo1OfUpward;
    const contains_pieces_on_upward = document.getElementById(
      "contains_pieces_on_upward",
    )!;

    // delete everything
    removeChildren(contains_pieces_on_upward);

    for (let i = 0; i < list.length; i++) {
      const piece: NonTam2PieceUpward = list[i];
      const imgNode = createPieceImgToBePlacedOnHop1zuo1(i, toPath(piece));

      imgNode.style.cursor = "pointer";
      imgNode.addEventListener("click", function () {
        selectOwnPieceOnHop1zuo1(i, piece);
      });

      contains_pieces_on_upward.appendChild(imgNode);
    }
  }

  // Then, draw the Downward's hop1zuo1
  {
    const list: NonTam2PieceDownward[] = GAME_STATE.f.hop1zuo1OfDownward;
    const contains_pieces_on_downward = document.getElementById(
      "contains_pieces_on_downward",
    )!;

    // delete everything
    removeChildren(contains_pieces_on_downward);

    for (let i = 0; i < list.length; i++) {
      const piece: NonTam2PieceDownward = list[i];
      const imgNode = createPieceImgToBePlacedOnHop1zuo1(i, toPath(piece));
      imgNode.id = `hop1zuo1OfDownward_${i}`;
      contains_pieces_on_downward.appendChild(imgNode);
    }
  }
}

export function drawArrow(from: Coord, to: Coord) {
  if (from[1] === to[1] && from[0] > to[0]) { // up arrow
    const delta = from[0] - to[0];
    document
      .getElementById("arrows")!
      .appendChild(createArrowSvg(
        `m31.6 ${51.3 + BOX_SIZE * delta}h5.8v${-(34.5 + BOX_SIZE * delta)}l-21.3 31 4.5 3.2 11-16z`
        , from));
  } else if (from[1] === to[1] && from[0] < to[0]) { // down arrow
    const delta = to[0] - from[0];
    document
      .getElementById("arrows")!
      .appendChild(createArrowSvg(
        `m31.6 18.7h5.8v${34.5 + BOX_SIZE * delta}l-21.3-31 4.5-3.2 11 16z`
        , from));
  } else if (from[0] === to[0] && from[1] > to[1]) { // left arrow
    const delta = from[1] - to[1];
    document
      .getElementById("arrows")!
      .appendChild(createArrowSvg(
        `m${51.3 + BOX_SIZE * delta} 31.6v5.8h${-(34.5 + BOX_SIZE * delta)}l31-21.3 3.2 4.5-16 11z`
        , from));
  } else if (from[0] === to[0] && from[1] < to[1]) { // right arrow
    const delta = to[1] - from[1];
    document
      .getElementById("arrows")!
      .appendChild(createArrowSvg(
        `m18.7 31.6v5.8h${34.5 + BOX_SIZE * delta}l-31-21.3-3.2 4.5 16 11z`
        , from));
  } else if (
    from[0] > to[0] &&
    from[1] < to[1] &&
    from[0] - to[0] === to[1] - from[1]
  ) { // up right arrow
    const delta = from[0] - to[0];
    document
      .getElementById("arrows")!
      .appendChild(createArrowSvg(
        `m${32.9 + BOX_SIZE * delta} 34.8-19.8 5.6-1.8-5.9 41-10.7 ${-(32.4 + BOX_SIZE * delta)} ${32.4 + BOX_SIZE * delta}-4.2-4.2z`
        , from));
  } else if (
    from[0] < to[0] &&
    from[1] > to[1] &&
    from[0] - to[0] === to[1] - from[1]
  ) { // down left arrow
    const delta = from[1] - to[1];
    document
      .getElementById("arrows")!
      .appendChild(createArrowSvg(
        `m34.8 ${32.9 + BOX_SIZE * delta} 5.6-19.8-5.9-1.8-10.7 41 ${32.4 + BOX_SIZE * delta} ${-(32.4 + BOX_SIZE * delta)}-4.2-4.2z`
        , from));
  } else if (
    from[0] > to[0] &&
    from[1] > to[1] &&
    from[0] - to[0] === from[1] - to[1]
  ) { // up left arrow
    const delta = from[1] - to[1];
    document
      .getElementById("arrows")!
      .appendChild(createArrowSvg(
        `m34.8 37.1 5.6 19.8-5.9 1.8-10.7-41 ${32.4 + BOX_SIZE * delta} ${32.4 + BOX_SIZE * delta}-4.2 4.2z`
        , from));
  } else if (
    from[0] < to[0] &&
    from[1] < to[1] &&
    from[0] - to[0] === from[1] - to[1]
  ) { // down right arrow
    const delta = to[0] - from[0];
    document
      .getElementById("arrows")!
      .appendChild(createArrowSvg(
        `m${32.9 + BOX_SIZE * delta} ${35.2 + BOX_SIZE * delta}-19.8-5.6-1.8 5.9 41 10.7 ${-(32.4 + BOX_SIZE * delta)} ${-(32.4 + BOX_SIZE * delta)}-4.2 4.2z`
        , from));
  } else {
    throw new Error("unsupported direction for the arrow");
  }
}
