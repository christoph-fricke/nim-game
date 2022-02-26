import { createEvent, EventFrom } from "xsystem";

export type GameDifficulty = "medium" | "extreme";
export type MatchState = "none" | "human" | "computer";

export interface GameMangerContext {
  matches: MatchState[];
  difficulty: GameDifficulty;
  secrets: {
    human: "you_are_human";
    computer: "you_are_computer";
  };
}

export function getInitialContext(): GameMangerContext {
  return {
    difficulty: "medium",
    matches: new Array<MatchState>(13).fill("none"),
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
  /**
   * @param take The indices of matches a player wants to take in the
   * previously provided `matches` array.
   */
  (secret: string, take: number[]) => ({
    secret,
    take,
  })
);
