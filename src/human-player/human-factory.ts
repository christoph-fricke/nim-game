import type { PlayerMachineFactory, PlayerMachine } from "../game-manager";
import { createHumanPlayerMachine } from "./human-player-machine";

export const humanFactory: PlayerMachineFactory = (config) => {
	// Note: Typing more abstract StateMachines that will be implemented with more
	// details is nearly impossible in XState, given the complexity of its types.
	// Using `Behavior` might change that in the future but we are not there yet.
	// Therefore, the return type is casted to be compatible.
	return createHumanPlayerMachine(config) as unknown as PlayerMachine;
};
