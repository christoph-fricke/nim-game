import { spawn } from "xstate";
import type { PlayerFactory } from "../game-manager";
import { createRandomPlayerMachine } from "./random-player-machine";
import { getRandomTake } from "./randomness";
import { createSmartPlayerMachine } from "./smart-player-machine";

export const computerFactory: PlayerFactory = (config) => {
  switch (config.difficulty) {
    case "medium":
      return spawn(
        createRandomPlayerMachine({
          secret: config.secret,
          getRandomTake,
        })
      );
    case "extreme":
      return spawn(createSmartPlayerMachine(config));
    default:
      throw new Error("Unknown game difficulty: " + config.difficulty);
  }
};
