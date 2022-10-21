import {
  ActorRefFrom,
  assign,
  createMachine,
  sendParent,
  StateFrom,
  t,
} from "xstate";
import { PlayerEvent, playMove, stopGame } from "../game-manager";
import { createMove, getFreePositions, maxAllowed, Move } from "../nim";
import {
  getInitialContext,
  HumanContext,
  HumanEvent,
} from "./human-player-machine.model";

export type HumanPlayerActor = ActorRefFrom<typeof createHumanPlayerMachine>;
export type HumanPlayerState = StateFrom<typeof createHumanPlayerMachine>;

export interface HumanPlayerDependencies {
  /** The `secret` is provided by the game manager to verify moves from this actor. */
  secret: string;
}

export function createHumanPlayerMachine(deps: HumanPlayerDependencies) {
  /** @xstate-layout N4IgpgJg5mDOIC5QAkCuBbAhgOwAoBtMBPMAJwDoBBAd0wEsAXO7KAJTAEdU4GBiKTOjDl0AewBuccqU7dYDANoAGALqJQAB1GxGdUdnUgAHogAsADgDs5JUoBMAVnPmAnHfcuHlgDQgiiADYARjtyczslANMQ2yCAyIBfBN80LDxCEgoCYmYocgA5fQBlMHwwAGMGSF4ACwwccgZRKCgygH0sBnKa5TUkEC0dJn1DEwQHAGYA8jsgoMtTYInzByCHX38EIKUF8gnTCYcXSxcXHccklPr04jJybKJc8gBZCTASssrqurTyWFQAEboRi9QyDXQjfpjELmaZxOzHE4BM6mDaIU5BcgOJwuUxKFzhVYBOyXECpHAPO4PJ6vSQfCpVCC1a6NZqtMAdTBdHqqMHaCEGKGBIKmGzmJR4qIhNYBcxohCw0V2FaONyyw5BFyk8k3TL3DI0t70r5Mn4NJotdqdboKIJ9TT84aC0BjYIOLESiaWZGedw+Pzo2V7OKWSYWRzw7XXSlZA0sXgQfTCeRc4Q6mP6nIsUH9cFO0aIEKmUKWSwTFyanZeUv+zZRCZhDwTebF8UTKNpDM0ehMFjsWBabCwMD8QTCMSSWDkTDlcpgDSKXm5x16Z3GRDelxYuylgIORaOHe1xAOWZhUzRKwBZv2SwdikZO7d3R9uCD4ejoQiN5TiAVfDMGAOYOkMq4FgguLuoe8T2M25gWPK17TJEyrKpYsTxAE966mQzK-PIogaG0AhCMBAwrpCLroisYRBFMdjFosExKBM8oTHY0y4uYywBAEliahM+xJMkIDYKIf7wP06aPhQz69mwsg8HyoGUeu4y2OQ0S8asxYeF48rYuYjYrMS17bDu2EZtSLAFMUpQMpAykCuBixKpY7jmNs6G2MxrEBhBFZYjieIEhGxKWTJmaPDZtLvPZJpOfmQpbHM1gcaYFbImWXpyv5GJBa4IWEpGInSbcsZZnkRSAsCDCJWByUivuYT7vBkyngiLHyi4fE2MF+LFeFpXRpF1lQPVqljFpMzucqXm2CxXX+e5aUrMxdhesxwTmBF5VULQL4KQO+jDhNa7QkoVjkD1ZbItibjbH5mwOLxWKlixyymCtlg7cNnYyWd4FTEZO4efNPlLZsByhPB0QYp5B4OMJCRAA */
  return createMachine(
    {
      context: getInitialContext(),
      tsTypes: {} as import("./human-player-machine.typegen").Typegen0,
      schema: {
        context: t<HumanContext>(),
        events: t<PlayerEvent | HumanEvent>(),
      },
      predictableActionArguments: true,
      id: "HumanPlayer",
      initial: "AwaitingRequest",
      on: {
        "human.stop_game": {
          actions: "proxyGameStop",
        },
      },
      states: {
        AwaitingRequest: {
          tags: "waiting",
          on: {
            "game.moves.request": {
              target: "Playing",
              actions: "saveGameState",
            },
          },
        },
        Playing: {
          entry: "clearMove",
          initial: "NonSelected",
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
                "human.submit": {
                  target: "Submit",
                },
                "human.toggle_match": [
                  {
                    target: "NonSelected",
                    cond: "willEmptyMove",
                    actions: "clearMove",
                  },
                  {
                    target: "MoveSelected",
                    cond: "validPositionAndMoveNotFull",
                    actions: "updateMove",
                    internal: false,
                  },
                ],
              },
            },
            Submit: {
              entry: "respondWithMove",
              type: "final",
            },
          },
          onDone: {
            target: "AwaitingResponse",
          },
        },
        AwaitingResponse: {
          tags: "waiting",
          on: {
            "game.moves.accept": {
              target: "AwaitingRequest",
              actions: ["saveGameState", "clearMove"],
            },
            "game.moves.decline": {
              target: "Playing",
            },
          },
        },
      },
    },
    {
      guards: {
        validPositionAndMoveNotFull: (c, e) =>
          c.freePositions.includes(e.position) &&
          (c.nextMove.includes(e.position) || c.nextMove.length < maxAllowed),
        willEmptyMove: (c, e) =>
          c.nextMove.length === 1 && c.nextMove.includes(e.position),
      },
      actions: {
        proxyGameStop: sendParent(stopGame()),
        saveGameState: assign((_, e) => ({
          pile: e.pile,
          freePositions: getFreePositions(e.pile),
        })),
        clearMove: assign({ nextMove: (_) => [] as unknown as Move }),
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
