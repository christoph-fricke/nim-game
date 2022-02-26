import { createMachine, t } from "xstate";
import type { PlayerEvent } from "../game-manager";

export interface RandomPlayerDependencies {
	/** The `secret` is provided by the game manager to verify moves from this actor. */
	secret: string;
}

export function createRandomPlayerMachine(deps: RandomPlayerDependencies) {
	return createMachine({
		tsTypes: {} as import("./random-player-machine.typegen").Typegen0,
		schema: {
			context: t<{}>(),
			events: t<PlayerEvent>(),
		},
		id: "RandomPlayer",
	});
}
