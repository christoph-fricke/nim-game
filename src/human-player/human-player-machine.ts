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
  /** @xstate-layout N4IgpgJg5mDOIC5QAkCuBbAhgOwAoBtMBPMAJwDoBBAd0wEsAXO7KAJTAEdU4GBiKTOjDl0AewBuccqU7dYDRKAAOo2IzqjsikAA9EARgDsATnIAWY4YAcAZisAmewAYAbPuMuXAGhBFEhl1M3e2N9AFYrJ0Mw-TN7AF94nzQsPEISCgJiZihyADlNAGUwfDAAYwZIXgALDBxyBlEoKFKAfSwGMurtFTUmTW09BDDQ8hirMzMnezCbG319Kx8-BAWwp3JXM0MnG0NYo30XROS6tOIyciyiHPIAWQkwYtKKqtrU8lhUACN0Rh7VOoBkhdAYnFZDORjDYzBMbCEJtFDMsweCoS4YWEws4djY3CcQCkcNdLtdbg9JM9ypUIDUzg0mi0wO1MJ1uiDekCtCChmF9uQXDF7JNMXioiiEFZjPZyHiIlZbOFBYZDASiecMld0jleBBNMJ5KzhOqSZltSwAX0NNzQEN7HjzPbEdtovMnGYJfppi5yPZwjZpnEolZZmqzqaqLR1Cx2LAVNhYGB+IJhGJJLByJgymUwEoFBzAf0baCEABaDbC7FOBYuXHhKz6YUSqUy2su2FOWZmTxh1IRmj0JgxuDxxPJoQiR4ZiDlfDMMCWrmDMGQlyOSLuSydixhT3hDZbXH7MyHY5JQnh9JkOkfeSiJStARCRdF5cIKZjJzGaZhFzV6ZRMiviIH++hQtEnYLFKgTzIk57YKIM7wCCJpXhQA7Rmwsg8C+1pvlYAp7CMWLSm4KpmDYErWDY5ALCEJ7QoKHiqueqEXGa2QsPkRQlNSkC4cCtqICeYGwkY9h-rWUohp6ThyeimJYsEX5nqcfZoVqnG5BSTy8a8EACcWQzQq2gSOCeEnGNK9iybs5gYmYWK-o2Km9sSGlklxhQ-H8+bKIWeE8gYwoyvoeyWDYoRuF2EqWJC3aYjsxgjPirGXuxmk3BaBZWoJJZ2PFDaGBJrjWMYMnAQgASmHKxjdnF9iGJFbkapcGFDlhcaaImhlvjRRieIKyr2liuyyc4vr+lE5U2BETUtaavVBWWwq+o5zg1nWEQSoEkK1bssRNSqNhwfEQA */
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
              actions: "saveGameState",
              target: "Playing",
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
                  actions: "updateMove",
                  cond: "validPositionAndMoveNotFull",
                  target: "MoveSelected",
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
                    actions: "clearMove",
                    cond: "willEmptyMove",
                    target: "NonSelected",
                  },
                  {
                    actions: "updateMove",
                    cond: "validPositionAndMoveNotFull",
                    target: "MoveSelected",
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
              actions: ["saveGameState", "clearMove"],
              target: "AwaitingRequest",
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
