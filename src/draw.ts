import { Coord, Board, Piece, BoardIndex, Side, NonTam2PieceUpward, NonTam2PieceDownward } from "cerke_online_utility/lib";
import { createCancelButton, createPieceImgToBePlacedOnBoard, createPieceImgToBePlacedOnHop1zuo1, createPieceSizeImageOnBoardByPath_Shifted } from "./create_html_element";
import { Season, Log2_Rate, GAME_STATE } from "./game_state";
import { removeChildren, selectOwnPieceOnBoard, selectOwnPieceOnHop1zuo1 } from "./main";
import { toPath, toPath_ } from "./piece_to_path";

export function getDenoteSeasonNodeTopLeft(season: Season) {
  return { top: 360 + 51 * (3 - season), left: 3 };
}

export function getDenoteScoreNodeTopLeft(score: number) {
  return { top: 447 + 21.83333333333333 * (20 - score), left: 65 };
}

export function getDenoteRateNodeTopLeft(log2_rate: Log2_Rate) {
  return { top: 873 - 96.66666666666667 * (log2_rate - 1), left: 4 };
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

export function drawScoreboard() {
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
