import { useInterpret, useSelector } from "@xstate/react";
import { useMemo } from "react";
import { computerFactory } from "./computer-players";
import {
  changeDifficulty,
  createGameManagerMachine,
  GameDifficulty,
  GameManagerActor,
  GameManagerState,
  startGame,
} from "./game-manager";
import { humanFactory, HumanPlayerActor } from "./human-player";

function selectHuman(state: GameManagerState): HumanPlayerActor | null {
  // Type cast cannot be avoided through generic factories and context values
  // because it clashes with typing problems that currently exist with XState Typegen.
  return state.context.players.human as HumanPlayerActor | null;
}

function selectMainState(state: GameManagerState) {
  const screen = (() => {
    switch (true) {
      case state.hasTag("human_won"):
        return "human_won";
      case state.hasTag("human_lost"):
        return "human_lost";
      case state.hasTag("playing"):
        return "playing";
      case state.hasTag("main_menu"):
        return "main_menu";
      default:
        throw new Error("Failed to select a current screen.");
    }
  })();
  const difficulty = state.context.difficulty;

  // Casting prevents loss of the literal-type in return-type.
  return { screen: screen as typeof screen, difficulty };
}

export function useGame(): [GameManagerActor, HumanPlayerActor | null] {
  const gameManager = useInterpret(
    () =>
      createGameManagerMachine({
        spawnHumanPlayer: humanFactory,
        spawnComputerPlayer: computerFactory,
      }),
    { devTools: true }
  );

  const human = useSelector(gameManager, selectHuman);

  return [gameManager, human];
}

export function useMainState(game: GameManagerActor) {
  const state = useSelector(game, selectMainState);

  const events = useMemo(
    () => ({
      changeDifficulty: (diff: GameDifficulty) =>
        game.send(changeDifficulty(diff)),
      startGame: () => game.send(startGame()),
    }),
    [game]
  );

  return [state, events] as const;
}
