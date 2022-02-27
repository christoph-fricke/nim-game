// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    setDifficulty: "game.change_difficulty";
    applyHumanMoveToPile: "games.moves.play";
    acceptHumanMove: "games.moves.play";
    declineHumanMove: "games.moves.play";
    applyComputerMoveToPile: "games.moves.play";
    acceptComputerMove: "games.moves.play";
    declineComputerMove: "games.moves.play";
    stopPlayers: "xstate.init";
    resetGame: "game.start";
    spawnPlayers: "game.start";
    requestHumanMove: "done.state.GameManager.Playing.ComputerMove";
    requestComputerMove: "done.state.GameManager.Playing.HumanMove";
  };
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    matchesRemaining:
      | "done.state.GameManager.Playing.HumanMove"
      | "done.state.GameManager.Playing.ComputerMove";
    validMoveFromHuman: "games.moves.play";
    moveFromHuman: "games.moves.play";
    validMoveFromComputer: "games.moves.play";
    moveFromComputer: "games.moves.play";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "MainMenu"
    | "Playing"
    | "Playing.HumanMove"
    | "Playing.HumanMove.AwaitingMove"
    | "Playing.HumanMove.FinishingMove"
    | "Playing.ComputerMove"
    | "Playing.ComputerMove.AwaitingMove"
    | "Playing.ComputerMove.FinishingMove"
    | "HumanWon"
    | "HumanLost"
    | {
        Playing?:
          | "HumanMove"
          | "ComputerMove"
          | {
              HumanMove?: "AwaitingMove" | "FinishingMove";
              ComputerMove?: "AwaitingMove" | "FinishingMove";
            };
      };
  tags:
    | "main_menu"
    | "playing"
    | "human_move"
    | "computer_move"
    | "game_end"
    | "human_won"
    | "human_lost";
}
