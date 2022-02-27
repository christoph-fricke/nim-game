import {
  applyMove,
  canTake,
  createMove,
  createPile,
  getFreePositions,
  isEmpty,
  Match,
  maxAllowed,
  minAllowed,
  Pile,
  validateMove,
} from "./nim";

function buildPile(match: Match): Pile {
  return new Array<Match>(13).fill(match) as Pile;
}

describe("min/max takes", () => {
  it("should require at least one match", () => {
    expect(minAllowed).toBe(1);
  });

  it("should require at most three matches", () => {
    expect(maxAllowed).toBe(3);
  });
});

describe("createPile", () => {
  it("should create a full pile", () => {
    const pile = createPile();

    expect(pile).toHaveLength(13);
    for (const match of pile) expect(match).toBe("free");
  });
});

describe("canTake", () => {
  it("should only return true for numbers between 1 and 3", () => {
    expect(canTake(0)).toBeFalsy();

    expect(canTake(1)).toBeTruthy();
    expect(canTake(2)).toBeTruthy();
    expect(canTake(3)).toBeTruthy();

    expect(canTake(4)).toBeFalsy();
    expect(canTake(5)).toBeFalsy();
  });
});

describe("isEmpty", () => {
  it("should return false for a new pile", () => {
    const pile = createPile();
    expect(isEmpty(pile)).toBeFalsy();
  });

  it("should return false for a pile with one free match", () => {
    const pile = buildPile("player2");
    pile[7] = "free";

    expect(isEmpty(pile)).toBeFalsy();
  });

  it("should return true for a pile with no free matches", () => {
    const pile = buildPile("player1");

    expect(isEmpty(pile)).toBeTruthy();
  });
});

describe("getFreePositions", () => {
  it("should return all positions for a full pile", () => {
    const pile = buildPile("free");

    const free = getFreePositions(pile);

    expect(free).toHaveLength(pile.length);
    for (let i = 0; i < pile.length; i++) expect(free).toContain(i);
  });

  it("should return no positions for an empty pile", () => {
    const pile = buildPile("player1");

    const free = getFreePositions(pile);

    expect(free).toHaveLength(0);
  });

  it("should return positions of all free matches", () => {
    const pile = buildPile("player1");
    pile[2] = "free";
    pile[3] = "free";
    pile[6] = "free";
    pile[9] = "free";
    pile[11] = "free";

    const free = getFreePositions(pile);

    expect(free).toStrictEqual([2, 3, 6, 9, 11]);
  });
});

describe("createMove", () => {
  it("should throw an error when an invalid amount of positions is received", () => {
    const tooFew = () => createMove([]);
    const tooMany = () => createMove([2, 4, 6, 7]);

    expect(tooFew).toThrowError();
    expect(tooMany).toThrowError();
  });

  it("should return a move array based on the received positions", () => {
    expect(createMove([2])).toStrictEqual([2]);
    expect(createMove([5, 7, 2])).toStrictEqual([5, 7, 2]);
    expect(createMove([11, 4])).toStrictEqual([11, 4]);
  });
});

describe("validateMove", () => {
  it("should return false if the move takes non-free positions", () => {
    let pile = buildPile("player2");
    expect(validateMove(pile, [2, 5, 12])).toBeFalsy();

    pile = buildPile("free");
    pile[5] = "player1";
    expect(validateMove(pile, [1, 5, 11])).toBeFalsy();
  });

  it("should be true if the move only takes free positions", () => {
    let pile = buildPile("free");
    expect(validateMove(pile, [3, 8])).toBeTruthy();

    pile = buildPile("free");
    pile[4] = "player1";
    pile[9] = "player2";
    expect(validateMove(pile, [3, 10])).toBeTruthy();
  });
});

describe("applyMove", () => {
  it("should return a new pile", () => {
    const pile = buildPile("free");
    const newPile = applyMove(pile, [0, 1, 2], "player1");

    expect(newPile).not.toBe(pile);
  });

  it("should assign the given player to the provided positions", () => {
    const pile = buildPile("free");

    let newPile = applyMove(pile, [0, 5, 6], "player1");
    expect(newPile[0]).toBe("player1");
    expect(newPile[5]).toBe("player1");
    expect(newPile[6]).toBe("player1");

    newPile = applyMove(pile, [8, 4, 12], "player2");
    expect(newPile[8]).toBe("player2");
    expect(newPile[4]).toBe("player2");
    expect(newPile[12]).toBe("player2");
  });

  it("should not affect other positions", () => {
    const pile = buildPile("free");

    const newPile = applyMove(pile, [0, 1], "player1");
    const unchanged = newPile.slice(2);
    expect(unchanged).toHaveLength(11);
    for (const match of unchanged) expect(match).toBe("free");
  });
});
