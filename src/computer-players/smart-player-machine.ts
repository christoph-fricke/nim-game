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
  /** @xstate-layout N4IgpgJg5mDOIC5QGUC2BDATgFwAoBt0BPMTAOgEkJ8wBiKdVMM1AewDc4zMwBHAVzjYA2gAYAuolAAHVrACW2eawB2UkAA9EARgCsADjIAWAGwBOAMz6z1s9qNGLAGhBFEAJm1myAdl0-9d1F9XRNrbR8LAF8olzQsPEIScgAVAAt5FQBrTKhaDVhsdGxmdAAzEswACmwM7NyASlp4nAJiUjJ0zJyVKDFJJBBZBSVVdS0EI30LMm1RPwt3M1F3dx9zIxc3BHdHMlEDg+nQ8MiYuIxWpI7kfigYQtyAWQ46BiYWV9gydABjX7A0hEEnUw0UyjUgwmRlCZBCCyWKzWGy2Om0hjmegs9hMom02lxJnOIBaiXa5Fu9yEz1e9EYzDYnG+EDAv3wmTA-VBcnBYyhiHM3nc1lEBjs+iMPiMZlRCHs2jIFkcPnRZlx+MJMViIBUrBZ8EGpLayUo1DA3JGEPGiCls3WRk89jsDncJlluxmhyOFhOdjO2qN11SdR6UAtvMhoAmFnMZGWDnmy1W6xlrg8ey9wR9YT90QDlzJJspDyUvRenHDo0jmgFRgVFhsjgb6Ml0tlXm8Bysfk8eIJoiJ+YSxtIlat-J2JjtJgd+Ol9gdbrTO28mN02NMfcJRi1USAA */
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
              target: "Thinking",
              actions: "saveGameState",
            },
          },
        },
        Thinking: {
          after: {
            thinking: {
              target: "#SmartPlayer.SuggestingMove",
              actions: [],
              internal: false,
            },
          },
        },
        SuggestingMove: {
          entry: ["calculateMove", "respondWithMove"],
          on: {
            "game.moves.accept": {
              target: "Idle",
              actions: "updatePrevFree",
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
