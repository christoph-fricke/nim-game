// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.after(thinking)#SmartPlayer.Thinking": {
      type: "xstate.after(thinking)#SmartPlayer.Thinking";
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
      | "xstate.after(thinking)#SmartPlayer.Thinking";
    respondWithMove:
      | "game.moves.decline"
      | "xstate.after(thinking)#SmartPlayer.Thinking";
    saveGameState: "game.moves.request";
    updatePrevFree: "game.moves.accept";
  };
  eventsCausingServices: {};
  eventsCausingGuards: {};
  eventsCausingDelays: {
    thinking: "game.moves.request";
  };
  matchesStates: "Idle" | "SuggestingMove" | "Thinking";
  tags: never;
}
