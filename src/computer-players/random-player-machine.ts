import { assign, createMachine, sendParent, t } from "xstate";
import { PlayerEvent, playMove } from "../game-manager";
import type { AllowedMoveLength, Move, Position } from "../nim";
import { createMove, createPile, getFreePositions } from "../nim";

interface RandomPlayerContext {
  freePos: Position[];
  nextMove: Move;
}

function getInitialContext(): RandomPlayerContext {
  return {
    freePos: getFreePositions(createPile()),
    nextMove: createMove([0]),
  };
}

export interface RandomPlayerDependencies {
  /** The `secret` is provided by the game manager to verify moves from this actor. */
  secret: string;
  getRandomTake(): AllowedMoveLength;
}

export function createRandomPlayerMachine(deps: RandomPlayerDependencies) {
  return createMachine(
    {
      tsTypes: {} as import("./random-player-machine.typegen").Typegen0,
      schema: {
        context: t<RandomPlayerContext>(),
        events: t<PlayerEvent>(),
      },
      id: "RandomPlayer",
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
            "game.moves.accept": "Idle",
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
        calculateMove: assign({
          nextMove: (c) => {
            const take = deps.getRandomTake();
            return createMove(c.freePos.slice(0, take));
          },
        }),
        respondWithMove: sendParent((c) => playMove(deps.secret, c.nextMove)),
      },
    }
  );
}
