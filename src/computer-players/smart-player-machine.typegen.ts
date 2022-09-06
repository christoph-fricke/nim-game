// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.after(2000)#SmartPlayer.Thinking": {
      type: "xstate.after(2000)#SmartPlayer.Thinking";
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
  eventsCausingActions: {
    calculateMove:
      | "game.moves.decline"
      | "xstate.after(2000)#SmartPlayer.Thinking";
    respondWithMove:
      | "game.moves.decline"
      | "xstate.after(2000)#SmartPlayer.Thinking";
    saveGameState: "game.moves.request";
    updatePrevFree: "game.moves.accept";
  };
  eventsCausingServices: {};
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates: "Idle" | "SuggestingMove" | "Thinking";
  tags: never;
}
