import {
  mockDeep,
  DeepMockProxy,
  MockProxy,
  mock,
  mockFn,
} from "jest-mock-extended";
import { interpret } from "xstate";
import { acceptMove, declineMove, PlayerActor } from "./player-model";
import { createPile } from "../nim";
import {
  createGameManagerMachine,
  GameManagerDependencies,
} from "./game-manager-machine";
import {
  startGame,
  stopGame,
  playMove,
  changeDifficulty,
} from "./game-manager-machine.model";
import { requestMove } from ".";

describe("Game Manager Actor", () => {
  let human: MockProxy<PlayerActor>;
  let computer: MockProxy<PlayerActor>;
  let deps: DeepMockProxy<GameManagerDependencies>;

  beforeEach(() => {
    human = mock<PlayerActor>();
    computer = mock<PlayerActor>();
    deps = mockDeep<GameManagerDependencies>({
      spawnHumanPlayer: mockFn().mockReturnValue(human),
      spawnComputerPlayer: mockFn().mockReturnValue(computer),
    });
  });

  it("should start with medium difficulty and an full pile of sticks", () => {
    const actor = interpret(createGameManagerMachine(deps)).start();

    expect(actor.state.context.difficulty).toBe("medium");
    expect(actor.state.context.pile).toStrictEqual(createPile());
  });

  it("should start in the game menu and allow difficulty changes", () => {
    const actor = interpret(createGameManagerMachine(deps)).start();

    expect(actor.state.hasTag("main_menu")).toBeTruthy();
    expect(actor.state.can(startGame())).toBeTruthy();

    actor.send(changeDifficulty("extreme"));
    expect(actor.state.context.difficulty).toBe("extreme");
  });

  it("should start the player actors when a game is started", () => {
    const actor = interpret(createGameManagerMachine(deps)).start();
    const secrets = actor.state.context.secrets;

    actor.send(startGame());

    expect(deps.spawnHumanPlayer).toBeCalledTimes(1);
    expect(deps.spawnHumanPlayer).toBeCalledWith({
      secret: secrets.human,
      difficulty: "medium",
    });
    expect(deps.spawnComputerPlayer).toBeCalledTimes(1);
    expect(deps.spawnComputerPlayer).toBeCalledWith({
      secret: secrets.computer,
      difficulty: "medium",
    });
  });

  it("should let the human start the first move", () => {
    const actor = interpret(createGameManagerMachine(deps)).start();
    let expectedState = createPile();

    actor.send(startGame());

    expect(human.send).toBeCalledTimes(1);
    expect(human.send).toBeCalledWith(requestMove(expectedState));
  });

  it("should request a computer move after the human", () => {
    const actor = interpret(createGameManagerMachine(deps)).start();
    const secrets = actor.state.context.secrets;
    let expectedState = createPile();

    actor.send(startGame());
    actor.send(playMove(secrets.human, [0]));
    expectedState[0] = "player1";

    expect(computer.send).toBeCalledTimes(1);
    expect(computer.send).toBeCalledWith(requestMove(expectedState));
  });

  it("should ignore moves from players who are not in turn", () => {
    const actor = interpret(createGameManagerMachine(deps)).start();
    const secrets = actor.state.context.secrets;
    let expectedState = createPile();

    actor.send(startGame());
    expect(actor.state.can(playMove(secrets.computer, [0]))).toBeFalsy();
    expect(actor.state.can(playMove(secrets.human, [0]))).toBeTruthy();

    actor.send(playMove(secrets.human, [0]));
    expectedState[0] = "player1";
    expect(actor.state.can(playMove(secrets.computer, [1]))).toBeTruthy();
    expect(actor.state.can(playMove(secrets.human, [1]))).toBeFalsy();

    expect(human.send).toBeCalledTimes(2);
    expect(human.send).lastCalledWith(acceptMove(expectedState));
    expect(computer.send).toBeCalledTimes(1);
    expect(computer.send).toBeCalledWith(requestMove(expectedState));
  });

  it("should decline moves when the match is already taken", () => {
    const actor = interpret(createGameManagerMachine(deps)).start();
    const secrets = actor.state.context.secrets;

    // Prepare game
    actor.send(startGame());
    actor.send(playMove(secrets.human, [0]));

    // Decline computer
    actor.send(playMove(secrets.computer, [0]));
    expect(computer.send).lastCalledWith(declineMove());
    actor.send(playMove(secrets.computer, [1]));

    // Decline human
    actor.send(playMove(secrets.human, [1]));
    expect(human.send).lastCalledWith(declineMove());
  });

  it("should be possible to stop and start a new game during a game", () => {
    const actor = interpret(createGameManagerMachine(deps)).start();
    const secrets = actor.state.context.secrets;
    let expectedState = createPile();

    actor.send(startGame());
    expect(actor.state.hasTag("playing")).toBeTruthy();

    actor.send(playMove(secrets.human, [0]));
    expectedState[0] = "player1";
    expect(actor.state.context.pile).toStrictEqual(expectedState);

    actor.send(stopGame());
    expect(actor.state.hasTag("main_menu")).toBeTruthy();
    expect(human.stop).toBeCalledTimes(1);
    expect(computer.stop).toBeCalledTimes(1);

    actor.send(startGame());
    expect(actor.state.hasTag("playing")).toBeTruthy();
    expect(actor.state.context.pile).toStrictEqual(createPile());
  });

  it("should be possible to start a new game after the human wins", () => {
    const actor = interpret(createGameManagerMachine(deps)).start();
    const secrets = actor.state.context.secrets;
    let expectedState = createPile();

    actor.send(startGame());
    actor.send(playMove(secrets.human, [0, 1, 2]));
    actor.send(playMove(secrets.computer, [12, 11, 10]));
    expectedState[0] = expectedState[1] = expectedState[2] = "player1";
    expectedState[12] = expectedState[11] = expectedState[10] = "player2";

    actor.send(playMove(secrets.human, [3, 4, 5]));
    actor.send(playMove(secrets.computer, [9, 8]));
    expectedState[3] = expectedState[4] = expectedState[5] = "player1";
    expectedState[9] = expectedState[8] = "player2";

    actor.send(playMove(secrets.human, [6]));
    actor.send(playMove(secrets.computer, [7]));

    expectedState[6] = "player1";
    expect(human.send).lastCalledWith(acceptMove(expectedState));
    expectedState[7] = "player2";
    expect(computer.send).lastCalledWith(acceptMove(expectedState));

    expect(actor.state.hasTag("human_won")).toBeTruthy();
    expect(human.stop).toBeCalledTimes(1);
    expect(computer.stop).toBeCalledTimes(1);

    actor.send(startGame());
    expect(actor.state.hasTag("main_menu")).toBeTruthy();
  });

  it("should be possible to start a new game after the human looses", () => {
    const actor = interpret(createGameManagerMachine(deps)).start();
    const secrets = actor.state.context.secrets;
    let expectedState = createPile();

    actor.send(startGame());
    actor.send(playMove(secrets.human, [0, 1, 2]));
    actor.send(playMove(secrets.computer, [12, 11, 10]));
    expectedState[0] = expectedState[1] = expectedState[2] = "player1";
    expectedState[12] = expectedState[11] = expectedState[10] = "player2";

    actor.send(playMove(secrets.human, [3, 4, 5]));
    actor.send(playMove(secrets.computer, [9, 8, 7]));
    expectedState[3] = expectedState[4] = expectedState[5] = "player1";
    expectedState[9] = expectedState[8] = expectedState[7] = "player2";

    actor.send(playMove(secrets.human, [6]));

    expect(computer.send).lastCalledWith(acceptMove(expectedState));
    expectedState[6] = "player1";
    expect(human.send).lastCalledWith(acceptMove(expectedState));

    expect(actor.state.hasTag("human_lost")).toBeTruthy();
    expect(human.stop).toBeCalledTimes(1);
    expect(computer.stop).toBeCalledTimes(1);

    actor.send(startGame());
    expect(actor.state.hasTag("main_menu")).toBeTruthy();
  });
});
