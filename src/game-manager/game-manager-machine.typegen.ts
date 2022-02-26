// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    showMainMenu: "game.stop";
    showPlaying: "game.start";
    showGameEnd:
      | "done.state.GameManager.Playing.ComputerMove"
      | "done.state.GameManager.Playing.HumanMove";
  };
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
    "done.invoke.humanPlayer": {
      type: "done.invoke.humanPlayer";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.humanPlayer": {
      type: "error.platform.humanPlayer";
      data: unknown;
    };
    "done.invoke.computerPlayer": {
      type: "done.invoke.computerPlayer";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.computerPlayer": {
      type: "error.platform.computerPlayer";
      data: unknown;
    };
  };
  invokeSrcNameMap: {
    humanPlayer: "done.invoke.humanPlayer";
    computerPlayer: "done.invoke.computerPlayer";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    humanPlayer: "game.start";
    computerPlayer: "game.start";
  };
  eventsCausingGuards: {
    matchesRemaining:
      | "done.state.GameManager.Playing.HumanMove"
      | "done.state.GameManager.Playing.ComputerMove";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "MainMenu"
    | "Playing"
    | "Playing.HumanMove"
    | "Playing.HumanMove.RequestingMove"
    | "Playing.HumanMove.AwaitingResponse"
    | "Playing.HumanMove.FinishingMove"
    | "Playing.ComputerMove"
    | "Playing.ComputerMove.RequestingMove"
    | "Playing.ComputerMove.AwaitingResponse"
    | "Playing.ComputerMove.FinishingMove"
    | "HumanWon"
    | "HumanLost"
    | {
        Playing?:
          | "HumanMove"
          | "ComputerMove"
          | {
              HumanMove?:
                | "RequestingMove"
                | "AwaitingResponse"
                | "FinishingMove";
              ComputerMove?:
                | "RequestingMove"
                | "AwaitingResponse"
                | "FinishingMove";
            };
      };
  tags: "main_menu" | "playing" | "game_end";
}
