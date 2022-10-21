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
  /** @xstate-layout N4IgpgJg5mDOIC5QHECGBbMBZVA7VMATgHQ4CWuWYuArgMRQZjGwAuqhrA2gAwC6iUAAcA9rDKsyI3IJAAPRAE5iAdhUAWTQCYtKgKzq9RlQBoQAT0QBaAIw31xHuoDM6gBw2ePLa72KVAL4BZmiYOPhEpKgUVLQMTMQAxgAWeDAA+hBkAGbZZIk0ADas5rwCSCCi4pLSsgoIVlruxABsis56PG5aNnpuzs5u6maWDbp6xHodnYq9bjwtLYHBIKHYeARgJAAKhajmFFDEABI06HhYIgBuzACCAO7RkrhQlzfxmLDE6NdwxEJ7Ur8WRVCRSGQVerqLTKZyzRReNyzPRaFrOEbWTzEXQImxo3q6RYdIIhJjhTY7QGHE5nC6-YgPJ6HN5gD5-H43L4A-ZcGzlYRiMG1SGIaEtVR+Lr9ZGo9EWRB2NzERR6ewolzqFQ+ZwtEmrMkbSK7fbU07nSi-OgQaTMNioVjMNbko1Ul4080ssogwU1CGgeqeNrEDqGLQo1wtTQYhqRxwqHgqNE8BGJpxuPVOw1bYjGg5us1097W3C29gO4iZiLZ3Om2kWm68-mVH3guoKhM8ZXqbwIxRoiNuaMOQZNaE8Gxw9SRpoZg1Vykmt0AYRE6CENAdhBZDMeYJeLLZXw5f25QKboN9bYQNg0yiaiecqLDehaNi00dsWmIbjcRlfqoMTUp2cWcwizBc8yOFc1w3LZt0ZPdXktRhPm+X4uUBRtvWqVsRWvDRxVfdwtHHZ9X3feVrx6SY+nHWZIxVOEQJWSsKRzV0oNXddNwPYtS3tR05zYmtly42Ct1+L0KgvXD-QVHwVGIewvB4AZ1DfPRTEovxvz6F91EUdxH2hZjSTA+d2MXTiYJ4y0+JYMtBPM4SOOIaDuLgyS+WwoU-XkeTfy7FQJyaBYVG6CjRjfZxgxUDo8ScJpOiRUD1gskSoDZByRCEKSBRw4U5OvTsbHmNodH0QxjA-AzJn6FwbxvQktXUVLnWzAtcAAdWkLK7U4PLmwKvz6hVRS-H0RQpo6Nx9EHSimJozwfwnG95hcNrwPdPAABkxFYPr2AG4FpJbQr-IQMbJn8Pxpr6SbozU79oUUHQWnHcK4SCFZcBECA4FkVjInIShqBoHzLzw2xaq6dSBh6PoBiGD9ekUuwEVRIZxymVTNvS1zOvg3dniQm4Idki6wwcLUmJ6dSUTRaNUVUHgpj6FohhpnU9DxlyrO2+tmAAMQoMhYGSZlfnJ876m6GKvDfJFZpIhM9CZ8USLZtwOc1bUWh5lihJdfnCal07hqvEjxRp9o6YJRnKOhxScXHfEUUTSNeeNyC3LE2ybh3Jl9zN-LfKvVHxVUxYFdero1coppHEUFbXCGIww2cZYzLSvmffc8TtxF3AxYl4OyfNsO8IRmK0SMbtNdeqYmZivwU-cKqM6z-VnO96l8-9sBpZGhUUSVKP3rokjfxR2qfyMfonCMBMwy96sOKH8O+lUHxbfse25VGKxXE7Oe-EAtpDNZ1eSE6nq-JkmWFQGTtl5C7slgix7XGemE3o+6Vr4Cz2mwDeeE7B4iUroFQvZ+xTnmqMJ6Qxf6on-l9Q2PctigKKo0PsrR2jJQRv0QYwxHYvW-L+PwHR9b-gNkEIAA */
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
              cond: "isDifficulty",
              actions: "setDifficulty",
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
                        target: "FinishingMove",
                        cond: "validMoveFromHuman",
                        actions: ["applyHumanMoveToPile", "acceptHumanMove"],
                      },
                      {
                        target: "AwaitingMove",
                        cond: "moveFromHuman",
                        actions: "declineHumanMove",
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
                  target: "ComputerMove",
                  cond: "matchesRemaining",
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
                        target: "FinishingMove",
                        cond: "validMoveFromComputer",
                        actions: [
                          "applyComputerMoveToPile",
                          "acceptComputerMove",
                        ],
                      },
                      {
                        target: "AwaitingMove",
                        cond: "moveFromComputer",
                        actions: "declineComputerMove",
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
                  target: "HumanMove",
                  cond: "matchesRemaining",
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
