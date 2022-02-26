import { interpret } from "xstate";
import {
  createGameManagerMachine,
  GameManagerDependencies,
} from "./game-manager-machine";

describe("Game Manager Actor", () => {
  let deps: GameManagerDependencies;

  beforeEach(() => {
    deps = {
      goto: jest.fn(),
      createHumanPlayer: jest.fn(),
      createComputerPlayer: jest.fn(),
    };
  });

  it("should start with medium difficulty and an empty stack of sticks", () => {
    const actor = interpret(createGameManagerMachine(deps)).start();

    expect(actor.state.context.difficulty).toBe("medium");
    expect(actor.state.context.matches).toHaveLength(13);
    for (const match of actor.state.context.matches) {
      expect(match).toBe("none");
    }
  });
});
