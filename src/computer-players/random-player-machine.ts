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
  /** @xstate-layout N4IgpgJg5mDOIC5QCUCGA7CB7AtgBQBtUBPMAJwDoBJCAsAYilRzApywDc4KywBHAK5wALolAAHLLACWw6VnRiQAD0QBGACwaKABgCcegOwAOAGzHjmvRp3GANCGKIATPooGDAZlvHPh5-6GAL5BDmiYuIQk5BQAKgAW0ugA1klQ9MqwwqjCrKgAZrlkABSuOjoAlPTh2PhEpJQJSanoUEqSMnIKSqoIGta6ns5DGgCseqMapnoOTgjOznoU-V6uhoaj5nqeIWEYtVENFADKAlAwWWkAspwMTCxst7AUqADGr2DiokggHbLyih+vSGamWejUi22pkMelczlm6mcpgoEP0Qz00z8WlGuxANUi9Rip3OImut0YzFY7C4zwgYFeBCSYHaUn+3SBiEMak8FFMNg8Fk0ZjUCIQEORqO2i0xhmxIVCIHQWDp8B++Lq0UoNDoLM6AJ6iFGowocO2nj0xlGnm8OkMooWPJWE2G-mM61MOwV6sOMSaKTSurZgNAwPGJv8Rs8kw9plMOlG9uGYIMoxdzjdhlMuO9hMoxIuclaNy4ga6wZUiA9Sw0fitanjo1sOnhjnUMPcHg06YWmg0amz+wJmtL+o5CE8oNN1otVptdtbCEmKNc1lM9bUHu8-flQA */
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
            "2000": {
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
