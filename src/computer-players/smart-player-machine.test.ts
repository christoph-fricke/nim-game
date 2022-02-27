import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { AnyInterpreter, interpret } from "xstate";
import { SimulatedClock } from "xstate/lib/SimulatedClock";
import { playMove, requestMove } from "../game-manager";
import { acceptMove, declineMove } from "../game-manager/player-model";
import { createPile, Pile } from "../nim";
import {
  createSmartPlayerMachine,
  SmartPlayerDependencies,
} from "./smart-player-machine";

/**
 * The smart makes the assumption that the the pile always contains less free
 * positions than the previous. To test with this assumption by default, the initial
 * pile has the first position already taken.
 */
function buildPile() {
  const pile = createPile();
  pile[0] = "player1";
  return pile;
}

describe("Random Player Actor", () => {
  let deps: DeepMockProxy<SmartPlayerDependencies>;

  beforeEach(() => {
    deps = mockDeep<SmartPlayerDependencies>({
      secret: "comm-secret",
    });
  });

  it("should accept move requests when started", () => {
    const pile = createPile();
    const actor = interpret(createSmartPlayerMachine(deps)).start();

    expect(actor.state.can(requestMove(pile))).toBeTruthy();
  });

  it("should think for 2s before responding with a move", () => {
    const parent = mockDeep<AnyInterpreter>();
    const clock = new SimulatedClock();
    const actor = interpret(createSmartPlayerMachine(deps), {
      clock,
      parent,
    }).start();

    const pile = buildPile();
    actor.send(requestMove(pile));

    clock.increment(1999);
    expect(parent.send).not.toBeCalled();

    clock.increment(1);
    expect(parent.send).toBeCalledTimes(1);
  });

  it("should response to the parent starting with the first free position", () => {
    const parent = mockDeep<AnyInterpreter>();
    const clock = new SimulatedClock();
    const actor = interpret(createSmartPlayerMachine(deps), {
      clock,
      parent,
    }).start();

    const pile = buildPile();

    actor.send(requestMove(pile));
    clock.increment(2000);

    expect(parent.send).toBeCalledWith(playMove(deps.secret, [1, 2, 3]));
  });

  it("should always respond with n positions to add up to max+1 matches after a move combo", () => {
    const parent = mockDeep<AnyInterpreter>();
    const clock = new SimulatedClock();
    const actor = interpret(createSmartPlayerMachine(deps), {
      clock,
      parent,
    }).start();

    // 1 match taken
    let pile = createPile();
    pile[12] = "player1";

    actor.send(requestMove(pile));
    clock.increment(2000);
    expect(parent.send).toBeCalledWith(playMove(deps.secret, [0, 1, 2]));

    parent.send.mockClear();
    actor.send(acceptMove());

    // Its + 2 matches taken
    pile[0] = "player2";
    pile[1] = "player2";
    pile[2] = "player2";
    pile[11] = "player1";
    pile[10] = "player1";

    actor.send(requestMove(pile));
    clock.increment(2000);
    expect(parent.send).toBeCalledWith(playMove(deps.secret, [3, 4]));

    parent.send.mockClear();
    actor.send(acceptMove());

    // Its + 3 matches taken
    pile[3] = "player2";
    pile[4] = "player2";
    pile[9] = "player1";
    pile[8] = "player1";
    pile[7] = "player1";

    actor.send(requestMove(pile));
    clock.increment(2000);
    expect(parent.send).toBeCalledWith(playMove(deps.secret, [5]));
  });

  it("should not process new move requests until the first is accepted", () => {
    const parent = mockDeep<AnyInterpreter>();
    const clock = new SimulatedClock();
    const actor = interpret(createSmartPlayerMachine(deps), {
      clock,
      parent,
    }).start();

    const pile = buildPile();

    actor.send(requestMove(pile));
    expect(actor.state.can(requestMove(pile))).toBeFalsy();

    clock.increment(2000);
    expect(actor.state.can(requestMove(pile))).toBeFalsy();

    actor.send(acceptMove());
    expect(actor.state.can(requestMove(pile))).toBeTruthy();
  });

  it("should play the move again immediately if the first is declined", () => {
    const parent = mockDeep<AnyInterpreter>();
    const clock = new SimulatedClock();
    const actor = interpret(createSmartPlayerMachine(deps), {
      clock,
      parent,
    }).start();

    const pile = buildPile();

    actor.send(requestMove(pile));
    clock.increment(2000);

    expect(parent.send).toBeCalledTimes(1);
    expect(parent.send).toBeCalledWith(playMove(deps.secret, [1, 2, 3]));
    parent.send.mockClear();

    actor.send(declineMove());

    expect(parent.send).toBeCalledTimes(1);
    expect(parent.send).toBeCalledWith(playMove(deps.secret, [1, 2, 3]));
  });

  it("should fallback to take as many as possible if the assumptions are not met", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    const parent = mockDeep<AnyInterpreter>();
    const clock = new SimulatedClock();
    const actor = interpret(createSmartPlayerMachine(deps), {
      clock,
      parent,
    }).start();

    let pile = createPile();

    actor.send(requestMove(pile));
    clock.increment(2000);

    expect(consoleSpy).toBeCalledTimes(1);
    expect(parent.send).toBeCalledTimes(1);
    expect(parent.send).toBeCalledWith(playMove(deps.secret, [0, 1, 2]));

    consoleSpy.mockClear();
    parent.send.mockClear();
    actor.send(acceptMove());

    // Should cause problems if opponent takes more than max sticks as well.
    pile = pile.map(() => "player1") as Pile;
    pile[12] = "free";

    actor.send(requestMove(pile));
    clock.increment(2000);

    expect(consoleSpy).toBeCalledTimes(1);
    expect(parent.send).toBeCalledTimes(1);
    expect(parent.send).toBeCalledWith(playMove(deps.secret, [12]));
  });
});
