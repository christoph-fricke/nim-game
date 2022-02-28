// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    proxyGameStop: "human.stop_game";
    saveGameState: "game.moves.request";
    updateMove: "human.toggle_match";
    clearMove: "game.moves.request" | "game.moves.decline";
    respondWithMove: "human.submit";
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
    validPositionAndMoveNotFull: "human.toggle_match";
    willEmptyMove: "human.toggle_match";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "AwaitingRequest"
    | "Playing"
    | "Playing.NonSelected"
    | "Playing.MoveSelected"
    | "Playing.Submit"
    | "AwaitingResponse"
    | { Playing?: "NonSelected" | "MoveSelected" | "Submit" };
  tags: never;
}
