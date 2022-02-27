import type { StateMachine } from "xstate";
import { createEvent, EventFrom } from "xsystem";
import type { GameDifficulty } from ".";
import type { Pile } from "../nim";

// Basic events and factories that players must provide to successfully
// communicate with the game-manager.

export type PlayerMachine = StateMachine<any, any, PlayerEvent, any>;
export type PlayerMachineFactory = (config: {
  secret: string;
  difficulty: GameDifficulty;
}) => PlayerMachine;

export type PlayerEvent =
  | EventFrom<typeof requestMove>
  | EventFrom<typeof declineMove>
  | EventFrom<typeof acceptMove>;

export const requestMove = createEvent("game.moves.request", (pile: Pile) => ({
  pile,
}));

export const declineMove = createEvent("game.moves.decline");
export const acceptMove = createEvent("game.moves.accept");
