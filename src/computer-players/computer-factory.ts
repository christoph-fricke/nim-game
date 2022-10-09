import { spawn } from "xstate";
import type { PlayerFactory } from "../game-manager";
import { createRandomPlayerMachine } from "./random-player-machine";
import { getRandomTake } from "./randomness";
import { createSmartPlayerMachine } from "./smart-player-machine";

declare global {
  var thinkingDelay: number | undefined;
}

export const computerFactory: PlayerFactory = (config) => {
  switch (config.difficulty) {
    case "medium":
      return spawn(
        createRandomPlayerMachine({
          secret: config.secret,
          thinkingDelay: globalThis.thinkingDelay ?? 2000,
          getRandomTake,
        })
      );
    case "extreme":
      return spawn(
        createSmartPlayerMachine({
          secret: config.secret,
          thinkingDelay: globalThis.thinkingDelay ?? 2000,
        })
      );
    default:
      throw new Error("Unknown game difficulty: " + config.difficulty);
  }
};
