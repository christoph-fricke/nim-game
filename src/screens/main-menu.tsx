import { Button } from "../components/button";
import { Option, Select } from "../components/select";
import type { GameDifficulty } from "../game-manager";
import { GameLayout } from "./game-layout";

export interface MainMenuProps {
  difficulty: GameDifficulty;
  onStart(): void;
  onDifficultyChange(difficulty: string): void;
}

export function MainMenu(props: MainMenuProps): JSX.Element {
  return (
    <GameLayout>
      <Select
        id="difficulty"
        label="Computer Difficulty:"
        value={props.difficulty}
        onChange={(e) => props.onDifficultyChange(e.currentTarget.value)}
      >
        <Option value="medium">Medium</Option>
        <Option value="extreme">Extreme</Option>
      </Select>
      <Button onClick={props.onStart}>New Game</Button>
    </GameLayout>
  );
}
