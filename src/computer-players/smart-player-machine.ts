import { assign, createMachine, sendParent, t } from "xstate";
import { PlayerEvent, playMove } from "../game-manager";
import type { Move, Position } from "../nim";
import {
  canTake,
  createMove,
  createPile,
  getFreePositions,
  maxAllowed,
} from "../nim";

interface SmartPlayerContext {
  prevFreeCount: number;
  freePositions: Position[];
  nextMove: Move;
}

function getInitialContext(): SmartPlayerContext {
  const freePos = getFreePositions(createPile());
  return {
    freePositions: freePos,
    prevFreeCount: freePos.length,
    nextMove: createMove([0]),
  };
}

export interface SmartPlayerDependencies {
  /** The `secret` is provided by the game manager to verify moves from this actor. */
  secret: string;
  thinkingDelay: number;
}

export function createSmartPlayerMachine(deps: SmartPlayerDependencies) {
  /** @xstate-layout N4IgpgJg5mDOIC5QGUC2BDATgFwAoBt0BPMTAOgEkJ8wBiKdVMM1AewDc4zMwBHAVzjZEoAA6tYAS2yTWAOxEgAHogCMAVgAcZTetW7VAFgAMATgBsmzQCYA7ABoQRRNeumyh0182Xzt24ZGAL5BjmhYeIQk5AAqABaScgDWiVC0SrDY6NjM6ABmOZgAFNgJyakAlLThOATEpGTxiSlyUIriUjLyiioIhubmZKoaqqZ65vqm1gDM5o7OCNPDZNaeFpoWxsPmxuYhYRi1UQ3I-FAwmakAshx0DEwst7Bk6ADGr2CiwkggHdKyCh+vWm02sQxmql8-V01lU8zU1kGS38qmM6lcxkM012+xANUi9XIp3OQmut3ojGYbE4zwgYFe+ESYHaEn+3SBiFsmLIxhm01sAyMxls01M8IQRnUOlUKJlGishgCIVCIDkrDp8B++Lq0Uo1GZPz+XUBoF6ASGAsMsKMpiMVrmThcWJ5xldxk003UlltItx2uOsTKLTahtZxp6iFm7lMmJMthjrgFYsdCFW0xdbo9Xo2MumfsOBN1xIuMlaN04LM6AIjCHMoo8-M85kCmkVnnFo3ca3Wm22OJV-sJlbZJuUiHUxgtzetnjtiPF6kMZGRIp8U2GelsyqCQA */
  return createMachine(
    {
      context: getInitialContext(),
      tsTypes: {} as import("./smart-player-machine.typegen").Typegen0,
      schema: { context: t<SmartPlayerContext>(), events: t<PlayerEvent>() },
      predictableActionArguments: true,
      id: "SmartPlayer",
      initial: "Idle",
      states: {
        Idle: {
          on: {
            "game.moves.request": {
              actions: "saveGameState",
              target: "Thinking",
            },
          },
        },
        Thinking: {
          after: {
            thinking: {
              target: "SuggestingMove",
            },
          },
        },
        SuggestingMove: {
          entry: ["calculateMove", "respondWithMove"],
          on: {
            "game.moves.accept": {
              actions: "updatePrevFree",
              target: "Idle",
            },
            "game.moves.decline": {
              target: "SuggestingMove",
              internal: false,
            },
          },
        },
      },
    },
    {
      delays: {
        thinking: () => deps.thinkingDelay,
      },
      actions: {
        saveGameState: assign((_, e) => ({
          freePositions: getFreePositions(e.pile),
        })),
        updatePrevFree: assign({
          prevFreeCount: (_, e) => getFreePositions(e.pile).length,
        }),
        calculateMove: assign({
          nextMove: (c) => getNextMove(c.freePositions, c.prevFreeCount),
        }),
        respondWithMove: sendParent((c) => playMove(deps.secret, c.nextMove)),
      },
    }
  );
}

/**
 * Given a pile contains 13 matches and a player can take 3 matches at most, the
 * smart player realized that it always wins as long as 4 matches are removed
 * after every move combo. This further assumes that it is not the starting player.
 */
const wanted = maxAllowed + 1;

function getNextMove(free: Position[], prevFreeCount: number): Move {
  // This assumes that the given pile always contains fewer matches than the previous.
  const removedByOpponent = prevFreeCount - free.length;
  const take = wanted - removedByOpponent;

  if (canTake(take)) return createMove(free.slice(0, take));

  console.warn(
    "Oh no. The logic of the smart player did not work out. A win is no longer guaranteed.",
    `\nPreviously Free: ${prevFreeCount}`,
    `\nCurrently Free:  ${free.length}`
  );
  // Fallback to grab as much as possible.
  return createMove(free.slice(0, maxAllowed));
}
