import { ActorRefFrom, createMachine, StateFrom, t } from "xstate";
import { assign, pure, send } from "xstate/lib/actions";
import type { GameDifficulty } from ".";
import { applyMove, createPile, isEmpty, validateMove } from "../nim";
import {
  GameManagerEvent,
  GameMangerContext,
  getInitialContext,
} from "./game-manager-machine.model";
import {
  acceptMove,
  declineMove,
  PlayerFactory,
  requestMove,
} from "./player-model";

export type GameManagerActor = ActorRefFrom<typeof createGameManagerMachine>;
export type GameManagerState = StateFrom<typeof createGameManagerMachine>;

export interface GameManagerDependencies {
  spawnHumanPlayer: PlayerFactory;
  spawnComputerPlayer: PlayerFactory;
}

export function createGameManagerMachine(deps: GameManagerDependencies) {
  /** @xstate-layout N4IgpgJg5mDOIC5QHECGBbMBZVA7VMATgHQ4CWuWYuArgMRQZjGwAuqhrioADgPawyrMn1zcQAD0QBWAEzEAHAoBsCgAwB2ZQE4NagMwAWbduUAaEAE9EujcTWy1ahRsMLj0lQF8vFtJhx8IlJUCipaBiZiAGMACzwYAH0IMgAzVLJomgAbVmskEH5BYVFxKQQAWllZfWIARjq1QzVtB1kFT20LfOU3RQ065S0FR1a5Hz8mQIIwEgAFbNRLCihiAAkadDwsPgA3ZgBBAHdQ4VwoHf3IzFhidD24Yh5F-N4BIRExAvLm+TdDZraQz6IyaIzdRAqeQOJyGaTKZT6FrafQTED+bB4GbzF4rdabbYPOgQUTMNioVjMDHTYILJZ4jZbSgPcRFD6lb42Op2EYKbnaRqmZp1CEIUzKYj6aQgkzS+GeOpo6lY2m487EADCfHQPBolMIl0OJw+50N10e932t2eS1Z7xKX1A5TqUoUxA00jUdVkdSBzkRGlFKkMxDksPhiORqN86KmKtmxDpy3VWp1etmZpJuDJ7EpxGVQQTSbxqd1+sNduKnzKXJ57X5gt6XtFGm08lkpmkcncwOUgyVccLOPp53NLFYfB4lfZjskiGUshb+jqxFUCLbKg3dUMA4C8ZIjLwAHVRGPyZxpw6awhagM1AukYZVPDl7JzFZEN7W-ZnCZZBo3wRaQdxjAtsXxJkABkBFYM92AvAo2SvTkEEcd0ARldw+wXIFDFFb1fWIXDmnUNwoR8GNcD4CA4HEMDgnIShqBoS9qxQip4VDBR9HaKUeI0BRtG46Qg1kaR0KGPR71cBENF3TEh0TNVVkPZl9mIY5ThWCtEPtNinUQWRjEUYEPXaQwBI9BRRV0FcYTUMN7xaYD5JpItlIgwl1IAMQoMhYFibSWV0qsOQMhAdDUUM6nhQw6l5KVAw-MU9FDRxNHihoNGy1z9yUkcVIJNSwFYsK51QsSTP0Mz3Eszwl20exfSE0xWjcaNJj3RTixTbUywzB4NONM4LmCt5QtnZ1HAlQUnzlaUeJsjRakc10jKEjtcu6jzS3TA1Bt83B-MC00xsKPSyudWT3QMf99BUB8LKW2p7IGPluRy0DB3AnrVl28szqQ-TyoaEZ6haOapQWxdktcFdHKGbRPXcLafuU0rJsMr0qpqiyXHq5LgJDL0TClHRW2yxUvq68DVJPWcgcuz8vTdPs4Q+r0ePhfC7p-QSBR45xTNR4JVOgtgMevVpGoE5R4Q9YCnD7HnvVDJs4SEwxAOUEXZkl9ijLsBomhaNoOkE0ULOhX0lH+AFW1kCivCAA */
  return createMachine(
    {
      context: getInitialContext(),
      tsTypes: {} as import("./game-manager-machine.typegen").Typegen0,
      schema: {
        context: t<GameMangerContext>(),
        events: t<GameManagerEvent>(),
      },
      predictableActionArguments: true,
      id: "GameManager",
      initial: "MainMenu",
      states: {
        MainMenu: {
          tags: "main_menu",
          on: {
            "game.start": {
              target: "Playing",
            },
            "game.change_difficulty": {
              actions: "setDifficulty",
              cond: "isDifficulty",
            },
          },
        },
        Playing: {
          entry: ["resetGame", "spawnPlayers"],
          exit: "stopPlayers",
          tags: "playing",
          initial: "HumanMove",
          states: {
            HumanMove: {
              entry: "requestHumanMove",
              tags: "human_move",
              initial: "AwaitingMove",
              states: {
                AwaitingMove: {
                  on: {
                    "games.moves.play": [
                      {
                        actions: ["applyHumanMoveToPile", "acceptHumanMove"],
                        cond: "validMoveFromHuman",
                        target: "FinishingMove",
                      },
                      {
                        actions: "declineHumanMove",
                        cond: "moveFromHuman",
                        target: "AwaitingMove",
                        internal: false,
                      },
                    ],
                  },
                },
                FinishingMove: {
                  type: "final",
                },
              },
              onDone: [
                {
                  cond: "matchesRemaining",
                  target: "ComputerMove",
                },
                {
                  target: "#GameManager.HumanLost",
                },
              ],
            },
            ComputerMove: {
              entry: "requestComputerMove",
              tags: "computer_move",
              initial: "AwaitingMove",
              states: {
                AwaitingMove: {
                  on: {
                    "games.moves.play": [
                      {
                        actions: [
                          "applyComputerMoveToPile",
                          "acceptComputerMove",
                        ],
                        cond: "validMoveFromComputer",
                        target: "FinishingMove",
                      },
                      {
                        actions: "declineComputerMove",
                        cond: "moveFromComputer",
                        target: "AwaitingMove",
                        internal: false,
                      },
                    ],
                  },
                },
                FinishingMove: {
                  type: "final",
                },
              },
              onDone: [
                {
                  cond: "matchesRemaining",
                  target: "HumanMove",
                },
                {
                  target: "#GameManager.HumanWon",
                },
              ],
            },
          },
          on: {
            "game.stop": {
              target: "MainMenu",
            },
          },
        },
        HumanWon: {
          tags: "human_won",
          on: {
            "game.start": {
              target: "MainMenu",
            },
          },
        },
        HumanLost: {
          tags: "human_lost",
          on: {
            "game.start": {
              target: "MainMenu",
            },
          },
        },
      },
    },
    {
      guards: {
        matchesRemaining: (c) => !isEmpty(c.pile),
        moveFromHuman: (c, e) => e.secret === c.secrets.human,
        validMoveFromHuman: (c, e) =>
          e.secret === c.secrets.human && validateMove(c.pile, e.move),
        moveFromComputer: (c, e) => e.secret === c.secrets.computer,
        validMoveFromComputer: (c, e) =>
          e.secret === c.secrets.computer && validateMove(c.pile, e.move),
        isDifficulty: (_, e) =>
          e.difficulty === "medium" || e.difficulty === "extreme",
      },
      actions: {
        setDifficulty: assign({
          difficulty: (_, e) => e.difficulty as GameDifficulty,
        }),
        resetGame: assign({ pile: (_) => createPile() }),
        spawnPlayers: assign({
          players: (c) => ({
            human: deps.spawnHumanPlayer({
              secret: c.secrets.human,
              difficulty: c.difficulty,
            }),
            computer: deps.spawnComputerPlayer({
              secret: c.secrets.computer,
              difficulty: c.difficulty,
            }),
          }),
        }),
        stopPlayers: pure(() => [
          // The provided `stop` action appears to be unable to stop `ActorRef`s... ?
          { type: "stop", exec: (c) => c.players.human?.stop?.() },
          { type: "stop", exec: (c) => c.players.computer?.stop?.() },
        ]),
        requestHumanMove: send((c) => requestMove(c.pile), {
          to: (c) => c.players.human!,
        }),
        acceptHumanMove: send((c) => acceptMove(c.pile), {
          to: (c) => c.players.human!,
        }),
        declineHumanMove: send(declineMove(), {
          to: (c) => c.players.human!,
        }),
        applyHumanMoveToPile: assign({
          pile: (c, e) => applyMove(c.pile, e.move, "player1"),
        }),
        requestComputerMove: send((c) => requestMove(c.pile), {
          to: (c) => c.players.computer!,
        }),
        acceptComputerMove: send((c) => acceptMove(c.pile), {
          to: (c) => c.players.computer!,
        }),
        declineComputerMove: send(declineMove(), {
          to: (c) => c.players.computer!,
        }),
        applyComputerMoveToPile: assign({
          pile: (c, e) => applyMove(c.pile, e.move, "player2"),
        }),
      },
    }
  );
}
