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
  eventsCausingActions: {};
  eventsCausingServices: {};
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | "Main Menu"
    | "Main Menu.Extreme Difficulty"
    | "Main Menu.Hist"
    | "Main Menu.Medium Difficulty"
    | "Playing"
    | { "Main Menu"?: "Extreme Difficulty" | "Medium Difficulty" };
  tags: never;
}
