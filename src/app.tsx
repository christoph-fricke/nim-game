import { useInterpret, useSelector } from "@xstate/react";
import * as styles from "./app.module.css";
import { computerFactory } from "./computer-players";
import { createGameManagerMachine, startGame, stopGame } from "./game-manager";
import { humanFactory } from "./human-player";

export function App() {
  const gameManager = useInterpret(
    () =>
      createGameManagerMachine({
        goto: () => {}, //TODO: Implement routing
        createHumanPlayer: humanFactory,
        createComputerPlayer: computerFactory,
      }),
    {
      devTools: process.env.NODE_ENV === "development",
    }
  );

  const isMainMenu = useSelector(gameManager, (state) =>
    state.hasTag("main_menu")
  );

  if (isMainMenu) {
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
