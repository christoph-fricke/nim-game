import type { StateMachine } from "xstate";
import { createEvent, EventFrom } from "xsystem";
import type { GameDifficulty } from ".";
import type { MatchState } from "./game-manager-machine.model";

// Basic events and factories that players must provide to successfully
// communicate with the game-manager.

export type PlayerMachine = StateMachine<any, any, PlayerEvent, any>;
export type PlayerMachineFactory = (config: {
	secret: string;
	difficulty: GameDifficulty;
}) => PlayerMachine;

export type PlayerEvent = EventFrom<typeof requestMove>;

export const requestMove = createEvent(
	"game.moves.request",
	(matches: MatchState[]) => ({ matches })
);
