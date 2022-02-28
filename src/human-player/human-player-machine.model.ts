import { createEvent, EventFrom } from "xsystem";
import { createPile, getFreePositions, Move, Pile, Position } from "../nim";

export interface HumanContext {
  pile: Pile;
  freePos: Position[];
  nextMove: Move;
}

export function getInitialContext(): HumanContext {
  const pile = createPile();
  return {
    pile,
    freePos: getFreePositions(pile),
    // Initially the human player should have no sticks selected to avoid confusing the user.
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
