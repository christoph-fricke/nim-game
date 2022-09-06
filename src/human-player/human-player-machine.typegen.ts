// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
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
  eventsCausingActions: {
    clearMove:
      | "game.moves.accept"
      | "game.moves.decline"
      | "game.moves.request"
      | "human.toggle_match";
    proxyGameStop: "human.stop_game";
    respondWithMove: "human.submit";
    saveGameState: "game.moves.accept" | "game.moves.request";
    updateMove: "human.toggle_match";
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    validPositionAndMoveNotFull: "human.toggle_match";
    willEmptyMove: "human.toggle_match";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "AwaitingRequest"
    | "AwaitingResponse"
    | "Playing"
    | "Playing.MoveSelected"
    | "Playing.NonSelected"
    | "Playing.Submit"
    | { Playing?: "MoveSelected" | "NonSelected" | "Submit" };
  tags: "waiting";
}
