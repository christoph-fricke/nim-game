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
  /** @xstate-layout N4IgpgJg5mDOIC5QCUCGA7CB7AtgBQBtUBPMAJwDoBJCAsAYilRzApywDc4KywBHAK5wALolAAHLLACWw6VnRiQAD0QBGACwaKABgCcegOwAOAGzHjmvRp3GANCGKIATPooGDAZlvHPh5-6GAL5BDmiYuIQk5BQAKgAW0ugA1klQ9MqwwqjCrKgAZrlkABTCiSlpAJT04dj4RKSUCUmp6FBKkjJyCkqqCBqGAKwUanqDzsaGhp6eg6ZzDk4Izs56FBoexl6r04amIWEYdVGNFADKAlAwWWkAspwMTCxsD7AUqADGH2DiokggnVk8kU-z6nmcanWejUqz0nlMhj0rmci3UzlMI1ccNWpjhhi0gwOIFqkQaMQuVxEdwejGYrHYXDeEDAHwISTAHSkQJ6oMQhjUngophsm0sGjMalRCBhGJh+nBelxfgJIVCIHQWGZ8H+JPq0UoNDonK6wN6iEGw2RcM8emMgxmOh0hilK0FGwM4z8Eympk8RN1JxizQqbWN3JBoDBgzWAWcFtmGl9plMOkGLucbo8nv8kz2-qOpP150u1zkbXuXDD3QjKkQvrWGj89rUqcGth0KMc6kR7g8GgmK00GjU+YiesaVdNvIQnkhVpmtvt3idUsG2jl0OHW3BvuCqqAA */
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
              actions: "saveGameState",
              target: "Thinking",
            },
          },
        },
        Thinking: {
          after: {
            thinking: {
              target: "SuggestingMove",
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
