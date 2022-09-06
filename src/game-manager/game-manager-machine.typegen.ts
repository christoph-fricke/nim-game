// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
    "xstate.stop": { type: "xstate.stop" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    acceptComputerMove: "games.moves.play";
    acceptHumanMove: "games.moves.play";
    applyComputerMoveToPile: "games.moves.play";
    applyHumanMoveToPile: "games.moves.play";
    declineComputerMove: "games.moves.play";
    declineHumanMove: "games.moves.play";
    requestComputerMove: "done.state.GameManager.Playing.HumanMove";
    requestHumanMove:
      | "done.state.GameManager.Playing.ComputerMove"
      | "game.start";
    resetGame: "game.start";
    setDifficulty: "game.change_difficulty";
    spawnPlayers: "game.start";
    stopPlayers:
      | "done.state.GameManager.Playing.ComputerMove"
      | "done.state.GameManager.Playing.HumanMove"
      | "game.stop"
      | "games.moves.play"
      | "xstate.stop";
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    isDifficulty: "game.change_difficulty";
    matchesRemaining:
      | "done.state.GameManager.Playing.ComputerMove"
      | "done.state.GameManager.Playing.HumanMove";
    moveFromComputer: "games.moves.play";
    moveFromHuman: "games.moves.play";
    validMoveFromComputer: "games.moves.play";
    validMoveFromHuman: "games.moves.play";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "HumanLost"
    | "HumanWon"
    | "MainMenu"
    | "Playing"
    | "Playing.ComputerMove"
    | "Playing.ComputerMove.AwaitingMove"
    | "Playing.ComputerMove.FinishingMove"
    | "Playing.HumanMove"
    | "Playing.HumanMove.AwaitingMove"
    | "Playing.HumanMove.FinishingMove"
    | {
        Playing?:
          | "ComputerMove"
          | "HumanMove"
          | {
              ComputerMove?: "AwaitingMove" | "FinishingMove";
              HumanMove?: "AwaitingMove" | "FinishingMove";
            };
      };
  tags:
    | "computer_move"
    | "human_lost"
    | "human_move"
    | "human_won"
    | "main_menu"
    | "playing";
}
