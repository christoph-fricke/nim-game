import type { ActorRef } from "xstate";
import { createEvent, EventFrom } from "xsystem";
import type { GameDifficulty } from ".";
import type { Pile } from "../nim";

// Base events that players should handle to successfully communicate with the
// game manager.

export type PlayerActor = ActorRef<PlayerEvent, unknown>;

/**
 * A factory will be called by the game manager actor and should use XState's
 * spawn **action** to spawn players with a child-parent relationship.
 */
export type PlayerFactory = (config: {
  secret: string;
  difficulty: GameDifficulty;
}) => PlayerActor;

export type PlayerEvent =
  | EventFrom<typeof requestMove>
  | EventFrom<typeof declineMove>
  | EventFrom<typeof acceptMove>;

export const requestMove = createEvent("game.moves.request", (pile: Pile) => ({
  pile,
}));

export const declineMove = createEvent("game.moves.decline");
export const acceptMove = createEvent("game.moves.accept", (pile: Pile) => ({
  pile,
}));
