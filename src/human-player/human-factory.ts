import { spawn } from "xstate";
import type { PlayerFactory } from "../game-manager";
import { createHumanPlayerMachine } from "./human-player-machine";

export const humanFactory: PlayerFactory = (config) => {
  return spawn(createHumanPlayerMachine(config));
};
