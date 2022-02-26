import { ActorRefFrom, createMachine, t } from "xstate";
import {
  GameManagerEvent,
  GameMangerContext,
  getInitialContext,
} from "./game-manager-machine.model";
import type { PlayerMachineFactory } from "./player-model";

export type GameManagerActor = ActorRefFrom<typeof createGameManagerMachine>;

export interface GameManagerDependencies {
  /** Navigates the browser to a given `screen` by changing the URL. */
  goto(screen: "main_menu" | "playing" | "game_end"): void;
  createHumanPlayer: PlayerMachineFactory;
  createComputerPlayer: PlayerMachineFactory;
}

export function createGameManagerMachine(deps: GameManagerDependencies) {
  return createMachine(
    {
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
          entry: "showMainMenu",
          on: {
            "game.start": "Playing",
          },
        },
        Playing: {
          tags: "playing",
          entry: "showPlaying",
          initial: "HumanMove",
          invoke: [
            { id: "humanPlayer", src: "humanPlayer" },
            { id: "computerPlayer", src: "computerPlayer" },
          ],
          on: {
            "game.stop": "MainMenu",
          },
          states: {
            HumanMove: {
              initial: "RequestingMove",
              onDone: [
                { target: "ComputerMove", cond: "matchesRemaining" },
                { target: "#HumanLost" },
              ],
              states: {
                RequestingMove: {},
                AwaitingResponse: {},
                FinishingMove: { type: "final" },
              },
            },
            ComputerMove: {
              initial: "RequestingMove",
              onDone: [
                { target: "HumanMove", cond: "matchesRemaining" },
                { target: "#HumanWon" },
              ],
              states: {
                RequestingMove: {},
                AwaitingResponse: {},
                FinishingMove: { type: "final" },
              },
            },
          },
        },
        HumanWon: {
          tags: "game_end",
          entry: "showGameEnd",
          id: "HumanWon",
          on: {
            "game.start": "Playing",
          },
        },
        HumanLost: {
          tags: "game_end",
          entry: "showGameEnd",
          id: "HumanLost",
          on: {
            "game.start": "Playing",
          },
        },
      },
    },
    {
      guards: {
        matchesRemaining: (c) => c.matches.some((m) => m === "none"),
      },
      actions: {
        showMainMenu: () => deps.goto("main_menu"),
        showPlaying: () => deps.goto("playing"),
        showGameEnd: () => deps.goto("game_end"),
      },
      services: {
        humanPlayer: (c) =>
          deps.createHumanPlayer({
            secret: c.secrets.human,
            difficulty: c.difficulty,
          }),
        computerPlayer: (c) =>
          deps.createComputerPlayer({
            secret: c.secrets.computer,
            difficulty: c.difficulty,
          }),
      },
    }
  );
}
