import { createMachine, t } from "xstate";
import type { PlayerEvent } from "../game-manager";

export interface SmartPlayerDependencies {
	/** The `secret` is provided by the game manager to verify moves from this actor. */
	secret: string;
}

export function createSmartPlayerMachine(deps: SmartPlayerDependencies) {
	return createMachine({
		tsTypes: {} as import("./smart-player-machine.typegen").Typegen0,
		schema: {
			context: t<{}>(),
			events: t<PlayerEvent>(),
		},
		id: "SmartPlayer",
	});
}
