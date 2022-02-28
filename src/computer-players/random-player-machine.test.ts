import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { AnyInterpreter, interpret } from "xstate";
import { SimulatedClock } from "xstate/lib/SimulatedClock";
import {
  acceptMove,
  declineMove,
  playMove,
  requestMove,
} from "../game-manager";
import { createPile } from "../nim";
import {
  createRandomPlayerMachine,
  RandomPlayerDependencies,
} from "./random-player-machine";

describe("Random Player Actor", () => {
  let deps: DeepMockProxy<RandomPlayerDependencies>;

  beforeEach(() => {
    deps = mockDeep<RandomPlayerDependencies>({
      secret: "comm-secret",
    });
    deps.getRandomTake.mockReturnValue(1);
  });

  it("should accept move requests when started", () => {
    const pile = createPile();
    const actor = interpret(createRandomPlayerMachine(deps)).start();

    expect(actor.state.can(requestMove(pile))).toBeTruthy();
  });

  it("should think for 2s before responding with a move", () => {
    const parent = mockDeep<AnyInterpreter>();
    const clock = new SimulatedClock();
    const actor = interpret(createRandomPlayerMachine(deps), {
      clock,
      parent,
    }).start();

    const pile = createPile();
    actor.send(requestMove(pile));

    clock.increment(1999);
    expect(parent.send).not.toBeCalled();

    clock.increment(1);
    expect(parent.send).toBeCalledTimes(1);
  });

  it("should response to the parent starting with the first free position", () => {
    const parent = mockDeep<AnyInterpreter>();
    const clock = new SimulatedClock();
    const actor = interpret(createRandomPlayerMachine(deps), {
      clock,
      parent,
    }).start();

    let pile = createPile();
    pile[0] = pile[1] = pile[3] = "player1";

    actor.send(requestMove(pile));
    clock.increment(2000);

    expect(deps.getRandomTake).toBeCalledTimes(1);
    expect(parent.send).toBeCalledWith(playMove(deps.secret, [2]));
  });

  it("should reply with a random amount of moves", () => {
    const parent = mockDeep<AnyInterpreter>();
    const clock = new SimulatedClock();
    let actor = interpret(createRandomPlayerMachine(deps), {
      clock,
      parent,
    }).start();

    let pile = createPile();

    // Should reply with 3 positions
    deps.getRandomTake.mockReturnValue(3);
    actor.send(requestMove(pile));
    clock.increment(2000);

    expect(deps.getRandomTake).toBeCalledTimes(1);
    expect(parent.send).toBeCalledWith(playMove(deps.secret, [0, 1, 2]));

    parent.send.mockClear();
    deps.getRandomTake.mockClear();
    pile[0] = pile[1] = pile[2] = "player1";
    actor.send(acceptMove(pile));

    // Should reply with 2 positions
    deps.getRandomTake.mockReturnValue(2);
    actor.send(requestMove(pile));
    clock.increment(2000);

    expect(deps.getRandomTake).toBeCalledTimes(1);
    expect(parent.send).toBeCalledWith(playMove(deps.secret, [3, 4]));
  });

  it("should not process new move requests until the first is accepted", () => {
    const parent = mockDeep<AnyInterpreter>();
    const clock = new SimulatedClock();
    const actor = interpret(createRandomPlayerMachine(deps), {
      clock,
      parent,
    }).start();

    let pile = createPile();

    actor.send(requestMove(pile));
    expect(actor.state.can(requestMove(pile))).toBeFalsy();

    clock.increment(2000);
    expect(actor.state.can(requestMove(pile))).toBeFalsy();

    pile[0] = "player1";
    actor.send(acceptMove(pile));
    expect(actor.state.can(requestMove(pile))).toBeTruthy();
  });

  it("should play a new move immediately if the first is declined", () => {
    const parent = mockDeep<AnyInterpreter>();
    const clock = new SimulatedClock();
    const actor = interpret(createRandomPlayerMachine(deps), {
      clock,
      parent,
    }).start();

    let pile = createPile();
    pile[0] = "player1";

    deps.getRandomTake.mockReturnValue(2);
    actor.send(requestMove(pile));
    clock.increment(2000);

    expect(parent.send).toBeCalledTimes(1);
    expect(parent.send).toBeCalledWith(playMove(deps.secret, [1, 2]));
    parent.send.mockClear();

    deps.getRandomTake.mockReturnValue(3);
    actor.send(declineMove());

    expect(parent.send).toBeCalledTimes(1);
    expect(parent.send).toBeCalledWith(playMove(deps.secret, [1, 2, 3]));
  });
});
