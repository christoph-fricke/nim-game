import { MainMenu } from "./screens/main-menu";
import { useGame, useMainState } from "./use-game";
import { GameOver } from "./screens/game-over";
import { Playing } from "./screens/playing";

export function Game() {
  const [gameManager, human] = useGame();
  const [gameState, events] = useMainState(gameManager);

  switch (gameState.screen) {
    case "main_menu":
      return (
        <MainMenu
          difficulty={gameState.difficulty}
          onDifficultyChange={events.changeDifficulty}
          onStart={events.startGame}
        />
      );
    case "human_won":
      return <GameOver won={true} onPlayAgain={events.startGame} />;
    case "human_lost":
      return <GameOver won={false} onPlayAgain={events.startGame} />;
    case "playing":
      return <Playing human={human!} />;
    default:
      return null;
  }
}
