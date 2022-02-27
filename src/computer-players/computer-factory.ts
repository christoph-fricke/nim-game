import type { PlayerMachineFactory, PlayerMachine } from "../game-manager";
import { createRandomPlayerMachine } from "./random-player-machine";
import { getRandomTake } from "./randomness";
import { createSmartPlayerMachine } from "./smart-player-machine";

export const computerFactory: PlayerMachineFactory = (config) => {
  // Note: Typing more abstract StateMachines that will be implemented with more
  // details is nearly impossible in XState, given the complexity of its types.
  // Using `Behavior` might change that in the future but we are not there yet.
  // Therefore, the return types are casted to be compatible.
  switch (config.difficulty) {
    case "medium":
      return createRandomPlayerMachine({
        secret: config.secret,
        getRandomTake,
      }) as unknown as PlayerMachine;
    case "extreme":
      return createSmartPlayerMachine(config) as unknown as PlayerMachine;
    default:
      throw new Error("Unknown game difficulty: " + config.difficulty);
  }
};
