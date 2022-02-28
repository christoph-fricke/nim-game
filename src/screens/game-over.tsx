import { Button } from "../components/button";
import { Text } from "../components/text";
import { GameLayout } from "./game-layout";

export interface GameOverProps {
  won?: boolean;
  onPlayAgain(): void;
}

export function GameOver(props: GameOverProps): JSX.Element {
  return (
    <GameLayout>
      {props.won ? (
        <Text as="h2" tone="positive">
          You have Won!
        </Text>
      ) : (
        <Text as="h2" tone="negative">
          You have Lost!
        </Text>
      )}
      <Button onClick={props.onPlayAgain}>Play Again?</Button>
    </GameLayout>
  );
}
