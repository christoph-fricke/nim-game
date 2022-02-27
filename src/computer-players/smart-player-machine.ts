import { assign, createMachine, sendParent, t } from "xstate";
import { PlayerEvent, playMove } from "../game-manager";
import type { Move, Position } from "../nim";
import {
  getFreePositions,
  canTake,
  createPile,
  createMove,
  maxAllowed,
} from "../nim";

interface SmartPlayerContext {
  prevFreeCount: number;
  freePos: Position[];
  nextMove: Move;
}

function getInitialContext(): SmartPlayerContext {
  const freePos = getFreePositions(createPile());
  return {
    freePos,
    prevFreeCount: freePos.length,
    nextMove: createMove([0]),
  };
}

export interface SmartPlayerDependencies {
  /** The `secret` is provided by the game manager to verify moves from this actor. */
  secret: string;
}

export function createSmartPlayerMachine(deps: SmartPlayerDependencies) {
  return createMachine(
    {
      tsTypes: {} as import("./smart-player-machine.typegen").Typegen0,
      schema: {
        context: t<SmartPlayerContext>(),
        events: t<PlayerEvent>(),
      },
      id: "SmartPlayer",
      initial: "Idle",
      context: getInitialContext(),
      states: {
        Idle: {
          on: {
            "game.moves.request": {
              target: "Thinking",
              actions: "saveGameState",
            },
          },
        },
        Thinking: {
          after: {
            2000: "SuggestingMove",
          },
        },
        SuggestingMove: {
          entry: ["calculateMove", "respondWithMove"],
          on: {
            "game.moves.accept": {
              target: "Idle",
              actions: "updatePrevFree",
            },
            "game.moves.decline": "SuggestingMove",
          },
        },
      },
    },
    {
      actions: {
        saveGameState: assign((_, e) => ({
          freePos: getFreePositions(e.pile),
        })),
        updatePrevFree: assign({
          prevFreeCount: (c) => c.freePos.length - c.nextMove.length,
        }),
        calculateMove: assign({
          nextMove: (c) => getNextMove(c.freePos, c.prevFreeCount),
        }),
        respondWithMove: sendParent((c) => playMove(deps.secret, c.nextMove)),
      },
    }
  );
}

/**
 * Given a pile contains 13 matches and a player can take 3 matches at most, the
 * smart player realized that it always wins as long as 4 matches were removed
 * after every move combo. This further assumes that it is not the starting player.
 */
const wanted = maxAllowed + 1;

function getNextMove(free: Position[], prevFreeCount: number): Move {
  // This assumes that the given pile always contains fewer matches than the previous.
  const removedByOpponent = prevFreeCount - free.length;
  const take = wanted - removedByOpponent;

  if (canTake(take)) return createMove(free.slice(0, take));

  console.warn(
    "Oh no. The logic of the smart player did not work out. A win is no longer guaranteed.",
    `\nPreviously Free: ${prevFreeCount}`,
    `\nCurrently Free:  ${free.length}`
  );
  // Fallback to grab as much as possible.
  return createMove(free.slice(0, maxAllowed));
}
