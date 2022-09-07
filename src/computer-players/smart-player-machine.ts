import { assign, createMachine, sendParent, t } from "xstate";
import { PlayerEvent, playMove } from "../game-manager";
import type { Move, Position } from "../nim";
import {
  canTake,
  createMove,
  createPile,
  getFreePositions,
  maxAllowed,
} from "../nim";

interface SmartPlayerContext {
  prevFreeCount: number;
  freePositions: Position[];
  nextMove: Move;
}

function getInitialContext(): SmartPlayerContext {
  const freePos = getFreePositions(createPile());
  return {
    freePositions: freePos,
    prevFreeCount: freePos.length,
    nextMove: createMove([0]),
  };
}

export interface SmartPlayerDependencies {
  /** The `secret` is provided by the game manager to verify moves from this actor. */
  secret: string;
}

export function createSmartPlayerMachine(deps: SmartPlayerDependencies) {
  /** @xstate-layout N4IgpgJg5mDOIC5QGUC2BDATgFwAoBt0BPMTAOgEkJ8wBiKdVMM1AewDc4zMwBHAVzjZEoAA6tYAS2yTWAOxEgAHogCMAVgAcZTetW7VAFgAMATgBsmzQCYA7ABoQRRNeumyh0182Xzt24ZGAL5BjmhYeIQk5AAqABaScgDWiVC0SrDY6NjM6ABmOZgAFNbGZQCUtOE4BMSkZPGJKXJQiuJSMvKKKgiexmTm5oa2pabGAMzmY4aOzgjWhtpe3prG5hqa48aaIWEYNVH1yPxQMJmpALIcdAxMLNewZOgAxs9gosJIIO3SsgpfPXG42sZFU1nGql8hks6msqlmams5jIEP8qmMsNKhi25l2IGqkTq5GOpyEl2u9EYzDYnEeEDAz3wiTAbQkvy6AMQtmMhjIxnB41sgyMxls41MCIQRnUOlUaLlG00w0MIVCIDkrHp8C+BNq0Uo1BZXx+nX+oB6AVBQsMcKMpiMNvMkoW4z5ZTKm3UlntYrxusOsQSyVSrI6f26iEm7mmJlsY1cQolThc2Ld7s93rl4z9+0J+pJZxkLSunFD7LNykQ5nFHkFniG+mVSbmqi8HmW3vMxlUkLWOYietIZdNEYQ6n6cqGts8DqRkvUvNRU3Gqxs6lM2PUqqCQA */
  return createMachine(
    {
      context: getInitialContext(),
      tsTypes: {} as import("./smart-player-machine.typegen").Typegen0,
      schema: { context: t<SmartPlayerContext>(), events: t<PlayerEvent>() },
      predictableActionArguments: true,
      id: "SmartPlayer",
      initial: "Idle",
      states: {
        Idle: {
          on: {
            "game.moves.request": {
              actions: "saveGameState",
              target: "Thinking",
            },
          },
        },
        Thinking: {
          after: {
            "2000": {
              target: "SuggestingMove",
            },
          },
        },
        SuggestingMove: {
          entry: ["calculateMove", "respondWithMove"],
          on: {
            "game.moves.accept": {
              actions: "updatePrevFree",
              target: "Idle",
            },
            "game.moves.decline": {
              target: "SuggestingMove",
              internal: false,
            },
          },
        },
      },
    },
    {
      actions: {
        saveGameState: assign((_, e) => ({
          freePositions: getFreePositions(e.pile),
        })),
        updatePrevFree: assign({
          prevFreeCount: (_, e) => getFreePositions(e.pile).length,
        }),
        calculateMove: assign({
          nextMove: (c) => getNextMove(c.freePositions, c.prevFreeCount),
        }),
        respondWithMove: sendParent((c) => playMove(deps.secret, c.nextMove)),
      },
    }
  );
}

/**
 * Given a pile contains 13 matches and a player can take 3 matches at most, the
 * smart player realized that it always wins as long as 4 matches are removed
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
