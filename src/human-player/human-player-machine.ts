import { createMachine, t } from "xstate";
import type { PlayerEvent } from "../game-manager";

export interface HumanPlayerDependencies {
	/** The `secret` is provided by the game manager to verify moves from this actor. */
	secret: string;
}

export function createHumanPlayerMachine(deps: HumanPlayerDependencies) {
	return createMachine({
		tsTypes: {} as import("./human-player-machine.typegen").Typegen0,
		schema: {
			context: t<{}>(),
			events: t<PlayerEvent>(),
		},
		id: "HumanPlayer",
	});
}
