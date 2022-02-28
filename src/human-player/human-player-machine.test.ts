import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { AnyInterpreter, interpret } from "xstate";
import {
  stopGame,
  playMove,
  requestMove,
  acceptMove,
  declineMove,
} from "../game-manager";
import { createPile } from "../nim";
import {
  createHumanPlayerMachine,
  HumanPlayerDependencies,
} from "./human-player-machine";
import {
  stopGame as humanStop,
  submitMove,
  toggleMatch,
} from "./human-player-machine.model";

describe("Human Player Actor", () => {
  let deps: DeepMockProxy<HumanPlayerDependencies>;

  beforeEach(() => {
    deps = mockDeep<HumanPlayerDependencies>({
      secret: "comm-secret",
    });
  });

  it("should forward game stop events to its parent", () => {
    const parent = mockDeep<AnyInterpreter>();
    const actor = interpret(createHumanPlayerMachine(deps), { parent }).start();

    actor.send(humanStop());

    expect(parent.send).toHaveBeenCalledWith(stopGame());
  });

  it("should ignore toggle events when no move is requested", () => {
    const parent = mockDeep<AnyInterpreter>();
    const actor = interpret(createHumanPlayerMachine(deps), { parent }).start();

    expect(actor.state.can(toggleMatch(4))).toBeFalsy();
  });

  it("should save the game state for display", () => {
    const parent = mockDeep<AnyInterpreter>();
    const actor = interpret(createHumanPlayerMachine(deps), { parent }).start();

    const pile = createPile();
    pile[5] = "player1";
    pile[6] = "player2";

    actor.send(requestMove(pile));

    expect(actor.state.context.pile).toStrictEqual(pile);
  });

  it("should send its move to the parent when submitted and a match is toggled", () => {
    const parent = mockDeep<AnyInterpreter>();
    const actor = interpret(createHumanPlayerMachine(deps), { parent }).start();

    const pile = createPile();

    actor.send(requestMove(pile));
    expect(actor.state.can(submitMove())).toBeFalsy();

    actor.send(toggleMatch(4));
    expect(actor.state.can(submitMove())).toBeTruthy();

    actor.send(toggleMatch(12));
    actor.send(submitMove());

    expect(parent.send).toBeCalledTimes(1);
    expect(parent.send).toBeCalledWith(playMove(deps.secret, [4, 12]));
  });

  it("should ignore toggle events when 3 matches are selected", () => {
    const parent = mockDeep<AnyInterpreter>();
    const actor = interpret(createHumanPlayerMachine(deps), { parent }).start();

    const pile = createPile();
    actor.send(requestMove(pile));

    actor.send(toggleMatch(0));
    actor.send(toggleMatch(1));
    actor.send(toggleMatch(2));
    actor.send(toggleMatch(3));
    expect(actor.state.context.nextMove).toStrictEqual([0, 1, 2]);

    actor.send(submitMove());
    expect(parent.send).toBeCalledWith(playMove(deps.secret, [0, 1, 2]));
  });

  it("should ignore toggle events for taken matches", () => {
    const parent = mockDeep<AnyInterpreter>();
    const actor = interpret(createHumanPlayerMachine(deps), { parent }).start();

    let pile = createPile();
    pile[0] = "player1";
    pile[1] = "player2";
    actor.send(requestMove(pile));

    expect(actor.state.can(toggleMatch(0))).toBeFalsy();
    expect(actor.state.can(toggleMatch(1))).toBeFalsy();
  });

  it("should add or remove free matches to the next move", () => {
    const parent = mockDeep<AnyInterpreter>();
    const actor = interpret(createHumanPlayerMachine(deps), { parent }).start();

    let pile = createPile();
    pile[0] = "player1";
    pile[1] = "player2";
    actor.send(requestMove(pile));

    actor.send(toggleMatch(2));
    expect(actor.state.context.nextMove).toStrictEqual([2]);

    actor.send(toggleMatch(3));
    expect(actor.state.context.nextMove).toStrictEqual([2, 3]);

    actor.send(toggleMatch(2));
    expect(actor.state.context.nextMove).toStrictEqual([3]);

    actor.send(toggleMatch(0));
    expect(actor.state.context.nextMove).toStrictEqual([3]);

    actor.send(toggleMatch(2));
    expect(actor.state.context.nextMove).toStrictEqual([3, 2]);
  });

  it("should ignore further events until a move is accepted", () => {
    const parent = mockDeep<AnyInterpreter>();
    const actor = interpret(createHumanPlayerMachine(deps), { parent }).start();

    let pile = createPile();
    actor.send(requestMove(pile));
    actor.send(toggleMatch(2));
    actor.send(submitMove());
    pile[2] = "player1";

    expect(actor.state.can(toggleMatch(4))).toBeFalsy();
    expect(actor.state.can(submitMove())).toBeFalsy();
    expect(actor.state.can(requestMove(pile))).toBeFalsy();

    actor.send(acceptMove(pile));

    expect(actor.state.can(toggleMatch(4))).toBeFalsy();
    expect(actor.state.can(submitMove())).toBeFalsy();
    expect(actor.state.can(requestMove(pile))).toBeTruthy();
  });

  it("should accept toggle events immediately after a move is declined", () => {
    const parent = mockDeep<AnyInterpreter>();
    const actor = interpret(createHumanPlayerMachine(deps), { parent }).start();

    const pile = createPile();
    actor.send(requestMove(pile));
    actor.send(toggleMatch(2));
    actor.send(submitMove());

    expect(actor.state.can(toggleMatch(4))).toBeFalsy();
    expect(actor.state.can(submitMove())).toBeFalsy();
    expect(actor.state.can(requestMove(pile))).toBeFalsy();

    actor.send(declineMove());

    expect(actor.state.context.nextMove).toStrictEqual([]);

    expect(actor.state.can(toggleMatch(4))).toBeTruthy();
    expect(actor.state.can(submitMove())).toBeFalsy();
    expect(actor.state.can(requestMove(pile))).toBeFalsy();
  });

  it("should reset its move between two move requests", () => {
    const parent = mockDeep<AnyInterpreter>();
    const actor = interpret(createHumanPlayerMachine(deps), { parent }).start();

    let pile = createPile();
    actor.send(requestMove(pile));

    actor.send(toggleMatch(2));
    expect(actor.state.context.nextMove).toStrictEqual([2]);

    actor.send(submitMove());
    pile[2] = "player1";
    actor.send(acceptMove(pile));
    actor.send(requestMove(pile));

    expect(actor.state.context.nextMove).toStrictEqual([]);
  });
});
