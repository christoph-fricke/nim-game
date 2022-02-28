// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    saveGameState: "game.moves.request";
    calculateMove:
      | "xstate.after(2000)#RandomPlayer.Thinking"
      | "game.moves.decline";
    respondWithMove:
      | "xstate.after(2000)#RandomPlayer.Thinking"
      | "game.moves.decline";
  };
  internalEvents: {
    "xstate.after(2000)#RandomPlayer.Thinking": {
      type: "xstate.after(2000)#RandomPlayer.Thinking";
    };
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
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates: "Idle" | "Thinking" | "SuggestingMove";
  tags: never;
}
