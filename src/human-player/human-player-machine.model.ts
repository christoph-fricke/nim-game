import { createEvent, EventFrom } from "xsystem";
import { createPile, getFreePositions, Move, Pile, Position } from "../nim";

export interface HumanContext {
  pile: Pile;
  freePositions: Position[];
  nextMove: Move;
}

export function getInitialContext(): HumanContext {
  const pile = createPile();
  return {
    pile,
    freePositions: getFreePositions(pile),
    // Initially the human player can't have "placeholder matches" selected since
    // it would be wrongly displayed in the UI.
    nextMove: [] as unknown as Move,
  };
}

export type HumanEvent =
  | EventFrom<typeof toggleMatch>
  | EventFrom<typeof submitMove>
  | EventFrom<typeof stopGame>;

export const toggleMatch = createEvent(
  "human.toggle_match",
  (position: Position) => ({ position })
);

export const submitMove = createEvent("human.submit");

export const stopGame = createEvent("human.stop_game");
