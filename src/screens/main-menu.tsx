import { Button } from "../components/button";
import type { GameDifficulty } from "../game-manager";
import { GameLayout } from "./game-layout";

export interface MainMenuProps {
  difficulty: GameDifficulty;
  onStart(): void;
  onDifficultyChange(difficulty: GameDifficulty): void;
}

export function MainMenu(props: MainMenuProps): JSX.Element {
  return (
    <GameLayout>
      <label htmlFor="difficulty">Difficulty</label>
      <select
        id="difficulty"
        name="difficulty"
        value={props.difficulty}
        onChange={(e) =>
          props.onDifficultyChange(e.currentTarget.value as GameDifficulty)
        }
      >
        <option value="medium">Medium</option>
        <option value="extreme">Extreme</option>
      </select>
      <Button onClick={props.onStart}>New Game</Button>
    </GameLayout>
  );
}
