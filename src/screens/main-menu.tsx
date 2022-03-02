import { Button } from "../components/button";
import { Option, Select } from "../components/select";
import { Text } from "../components/text";
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
      <Text as="p">
        This is an implementation of the game <em>Nim</em> with React and
        XState.
        <br />
        Click <em>Show Inspector</em> in the bottom right to visualize the logic
        that powers the user interface.
      </Text>
      <Text as="p">
        This is the Misère variant of Nim. Whoever takes the last of 13 matches
        loses.
      </Text>
      <Select
        id="difficulty"
        label="Computer Difficulty:"
        value={props.difficulty}
        onChange={(e) => props.onDifficultyChange(e.currentTarget.value)}
      >
        <Option value="medium">Medium</Option>
        <Option value="extreme">Extreme</Option>
      </Select>
      <Button onClick={props.onStart}>Start Game</Button>
    </GameLayout>
  );
}
