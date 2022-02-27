import { assign, createMachine, sendParent, t } from "xstate";
import { PlayerEvent, playMove } from "../game-manager";
import type { Pile, Move, AllowedMoveLength } from "../nim";
import { getFreePositions, createPile, createMove } from "../nim";

interface RandomPlayerContext {
  pile: Pile;
  nextMove: Move;
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
      context: {
        pile: createPile(),
        nextMove: createMove([0]),
      },
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
          pile: e.pile,
        })),
        calculateMove: assign({
          nextMove: (c) => {
            const free = getFreePositions(c.pile);
            const take = deps.getRandomTake();
            return createMove(free.slice(0, take));
          },
        }),
        respondWithMove: sendParent((c) => playMove(deps.secret, c.nextMove)),
      },
    }
  );
}
