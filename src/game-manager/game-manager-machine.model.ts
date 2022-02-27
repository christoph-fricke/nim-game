import { createEvent, EventFrom } from "xsystem";
import { createPile, Move, Pile } from "../nim";
import type { PlayerActor } from "./player-model";

export type GameDifficulty = "medium" | "extreme";

export interface GameMangerContext {
  pile: Pile;
  difficulty: GameDifficulty;
  players: {
    human: PlayerActor;
    computer: PlayerActor;
  };
  secrets: {
    human: "you_are_human";
    computer: "you_are_computer";
  };
}

export function getInitialContext(): GameMangerContext {
  return {
    difficulty: "medium",
    pile: createPile(),
    players: {
      human: {} as PlayerActor,
      computer: {} as PlayerActor,
    },
    secrets: {
      human: "you_are_human",
      computer: "you_are_computer",
    },
  };
}

export type GameManagerEvent =
  | EventFrom<typeof startGame>
  | EventFrom<typeof stopGame>
  | EventFrom<typeof changeDifficulty>
  | EventFrom<typeof playMove>;

export const startGame = createEvent("game.start");
export const stopGame = createEvent("game.stop");

export const changeDifficulty = createEvent(
  "game.change_difficulty",
  (difficulty: GameDifficulty) => ({ difficulty })
);

export const playMove = createEvent(
  "games.moves.play",
  (secret: string, move: Move) => ({
    secret,
    move,
  })
);
