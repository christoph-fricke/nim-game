import { assign, createMachine, sendParent, t } from "xstate";
import { PlayerEvent, playMove, stopGame } from "../game-manager";
import { createMove, getFreePositions, maxAllowed, Move } from "../nim";
import {
  getInitialContext,
  HumanContext,
  HumanEvent,
} from "./human-player-machine.model";

export interface HumanPlayerDependencies {
  /** The `secret` is provided by the game manager to verify moves from this actor. */
  secret: string;
}

export function createHumanPlayerMachine(deps: HumanPlayerDependencies) {
  return createMachine(
    {
      tsTypes: {} as import("./human-player-machine.typegen").Typegen0,
      schema: {
        context: t<HumanContext>(),
        events: t<PlayerEvent | HumanEvent>(),
      },
      id: "HumanPlayer",
      context: getInitialContext(),
      initial: "AwaitingRequest",
      on: {
        "human.stop_game": { internal: true, actions: "proxyGameStop" },
      },
      states: {
        AwaitingRequest: {
          on: {
            "game.moves.request": {
              target: "Playing",
              actions: "saveGameState",
            },
          },
        },
        Playing: {
          initial: "NonSelected",
          entry: "clearMove",
          onDone: "AwaitingResponse",
          states: {
            NonSelected: {
              on: {
                "human.toggle_match": {
                  target: "MoveSelected",
                  cond: "validPositionAndMoveNotFull",
                  actions: "updateMove",
                },
              },
            },
            MoveSelected: {
              on: {
                "human.submit": "Submit",
                "human.toggle_match": [
                  {
                    target: "NonSelected",
                    cond: "willEmptyMove",
                    actions: "updateMove",
                  },
                  {
                    target: "MoveSelected",
                    cond: "validPositionAndMoveNotFull",
                    actions: "updateMove",
                  },
                ],
              },
            },
            Submit: { type: "final", entry: "respondWithMove" },
          },
        },
        AwaitingResponse: {
          on: {
            "game.moves.accept": {
              target: "AwaitingRequest",
              actions: "saveGameState",
            },
            "game.moves.decline": "Playing",
          },
        },
      },
    },
    {
      guards: {
        validPositionAndMoveNotFull: (c, e) =>
          c.freePos.includes(e.position) &&
          (c.nextMove.includes(e.position) || c.nextMove.length < maxAllowed),
        willEmptyMove: (c, e) =>
          c.nextMove.length === 1 && c.nextMove.includes(e.position),
      },
      actions: {
        proxyGameStop: sendParent(stopGame()),
        saveGameState: assign((c, e) => ({
          pile: e.pile,
          freePos: getFreePositions(e.pile),
        })),
        clearMove: assign({ nextMove: (c) => [] as unknown as Move }),
        updateMove: assign({
          nextMove: (c, e) =>
            c.nextMove.includes(e.position)
              ? createMove(c.nextMove.filter((p) => p !== e.position))
              : createMove(c.nextMove.concat(e.position)),
        }),
        respondWithMove: sendParent((c) => playMove(deps.secret, c.nextMove)),
      },
    }
  );
}
