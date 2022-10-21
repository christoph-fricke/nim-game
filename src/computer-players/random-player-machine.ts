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
  thinkingDelay: number;
  getRandomTake(): AllowedMoveLength;
}

export function createRandomPlayerMachine(deps: RandomPlayerDependencies) {
  /** @xstate-layout N4IgpgJg5mDOIC5QCUCGA7CB7AtgBQBtUBPMAJwDoBJCAsAYilRzApywDc4KywBHAK5wALgG0ADAF1EoAA5ZYAS2GKs6GSAAeiAIwBmAOwVxAFgBsZgBx6AnJYCsevePGWANCGKIATC4rf7AwMzE0sDbzDgvQBfaI80TFxCEnIKABUAC0V0AGtsqHpNWGFUYVZUADMysgAKYSzc-IBKegTsfCJSSkzsvPQoCWkkEHklFTUNbQQTAxMKA30bexsDGzM9Cw8vBG9vPQoTGyP7PfDIs1j4jHbkrooAZQEoGGL8gFlOBiYWNk-YClQAGNAWBZGIpBpRspVOphlMTKEDuslis1hszFtdHodBQjkcTBFdjoETpLiA2klOqlHs8RO9PoxmKx2Fx-hAwICCNkwINIQpoRM4YgDH4dEdvIdLOJ7K5xN5MQh9Di8TYCZYiSTYnEQOgsOz4MMKR0UpQaHQ+WMYZNEPZ7P45TYnHZHM5xAYFbt9odjqcIkF1mSjbdUj1Gv0LQLYaApnplv5wrbY+Z0dKPXsDniToY-cFA9dKSaHk8Xip+h8uBHxlGtIh1nb7OYbOIzNKZVL5Z5dA5cZnfZFAnnEsaupWrUKEEZfN5HbYHE4XO7O9NvD38YTvMSTDpSVqgA */
  return createMachine(
    {
      context: getInitialContext(),
      tsTypes: {} as import("./random-player-machine.typegen").Typegen0,
      schema: { context: t<RandomPlayerContext>(), events: t<PlayerEvent>() },
      predictableActionArguments: true,
      id: "RandomPlayer",
      initial: "Idle",
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
            thinking: {
              target: "#RandomPlayer.SuggestingMove",
              actions: [],
              internal: false,
            },
          },
        },
        SuggestingMove: {
          entry: ["calculateMove", "respondWithMove"],
          on: {
            "game.moves.accept": {
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
      delays: {
        thinking: () => deps.thinkingDelay,
      },
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
