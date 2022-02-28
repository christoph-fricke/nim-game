import { useInterpret, useSelector } from "@xstate/react";
import * as styles from "./app.module.css";
import { computerFactory } from "./computer-players";
import { createGameManagerMachine, startGame, stopGame } from "./game-manager";
// import { humanFactory } from "./human-player";

export function App() {
  const gameManager = useInterpret(
    () =>
      createGameManagerMachine({
        spawnHumanPlayer: computerFactory,
        spawnComputerPlayer: computerFactory,
      }),
    {
      devTools: process.env.NODE_ENV === "development",
    }
  );

  const screen = useSelector(gameManager, (state) => {
    switch (true) {
      case state.hasTag("human_won"):
        return "human_won";
      case state.hasTag("human_lost"):
        return "human_lost";
      case state.hasTag("playing"):
        return "playing";
      default:
        return "main_menu";
    }
  });

  if (screen === "main_menu") {
    return (
      <>
        <h1 className={styles.heading}>Nim Game</h1>
        <button
          className={styles.button}
          onClick={() => gameManager.send(startGame())}
        >
          Start Game
        </button>
      </>
    );
  }

  if (screen === "human_won") {
    return (
      <>
        <h1 className={styles.heading}>You Won</h1>
        <button
          className={styles.button}
          onClick={() => gameManager.send(startGame())}
        >
          Start Game
        </button>
      </>
    );
  }

  if (screen === "human_lost") {
    return (
      <>
        <h1 className={styles.heading}>You Lost</h1>
        <button
          className={styles.button}
          onClick={() => gameManager.send(startGame())}
        >
          Start Game
        </button>
      </>
    );
  }

  return (
    <>
      <h1 className={styles.heading}>Playing</h1>
      <button
        className={styles.button}
        onClick={() => gameManager.send(stopGame())}
      >
        Stop Game
      </button>
    </>
  );
}
