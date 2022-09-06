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
  return createMachine(
    {
      predictableActionArguments: true,
      tsTypes: {} as import("./game-manager-machine.typegen").Typegen0,
      schema: {
        context: t<GameMangerContext>(),
        events: t<GameManagerEvent>(),
      },
      id: "GameManager",
      context: getInitialContext(),
      initial: "MainMenu",
      states: {
        MainMenu: {
          tags: "main_menu",
          on: {
            "game.start": "Playing",
            "game.change_difficulty": {
              internal: true,
              cond: "isDifficulty",
              actions: "setDifficulty",
            },
          },
        },
        Playing: {
          tags: "playing",
          entry: ["resetGame", "spawnPlayers"],
          exit: "stopPlayers",
          initial: "HumanMove",
          on: {
            "game.stop": "MainMenu",
          },
          states: {
            HumanMove: {
              tags: "human_move",
              initial: "AwaitingMove",
              entry: "requestHumanMove",
              onDone: [
                { target: "ComputerMove", cond: "matchesRemaining" },
                { target: "#HumanLost" },
              ],
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
                      },
                    ],
                  },
                },
                FinishingMove: { type: "final" },
              },
            },
            ComputerMove: {
              tags: "computer_move",
              initial: "AwaitingMove",
              entry: "requestComputerMove",
              onDone: [
                { target: "HumanMove", cond: "matchesRemaining" },
                { target: "#HumanWon" },
              ],
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
                      },
                    ],
                  },
                },
                FinishingMove: { type: "final" },
              },
            },
          },
        },
        HumanWon: {
          tags: ["human_won"],
          id: "HumanWon",
          on: {
            "game.start": "MainMenu",
          },
        },
        HumanLost: {
          tags: ["human_lost"],
          id: "HumanLost",
          on: {
            "game.start": "MainMenu",
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
