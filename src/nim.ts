// General game domain that is known to every player

export type Player = "player1" | "player2";

/**
 * A match in a {@link Pile} is modelled as either "free to take" or
 * "already taken by playerX".
 */
export type Match = "free" | Player;

/**
 * In a {@link Pile} of 13 {@link Match}es, each match has a position that is
 * equal to its array index.
 */
export type Position = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** A move consists of the indices a {@link Player} wants to take from the {@link Pile}. */
export type Move =
  | [Position]
  | [Position, Position]
  | [Position, Position, Position];

export type AllowedMoveLength = 1 | 2 | 3;
export const minAllowed: AllowedMoveLength = 1;
export const maxAllowed: AllowedMoveLength = 3;

/** A pile is modelled as an array of {@link Match}es. */
export type Pile = [
  Match,
  Match,
  Match,
  Match,
  Match,
  Match,
  Match,
  Match,
  Match,
  Match,
  Match,
  Match,
  Match
];

/** Creates a full pile where every match is free to take. */
export function createPile(): Pile {
  return [
    "free",
    "free",
    "free",
    "free",
    "free",
    "free",
    "free",
    "free",
    "free",
    "free",
    "free",
    "free",
    "free",
  ];
}

/** Returns `true` if the given amount is within the allowed "take per move" amount. */
export function canTake(amount: number): amount is AllowedMoveLength {
  return amount >= minAllowed && amount <= maxAllowed;
}

/** Return `true` if all matches have been taken from a given pile. */
export function isEmpty(pile: Pile): boolean {
  return pile.every((match) => match !== "free");
}

/** Returns all positions in a pile where the match is free to take. */
export function getFreePositions(pile: Pile): Position[] {
  return pile.reduce<Position[]>((free, match, pos) => {
    if (match === "free") free.push(pos as Position);
    return free;
  }, []);
}

/** Helper to avoid type castings when creating a move. */
export function createMove(pos: Position[]): Move {
  if (!canTake(pos.length))
    throw new Error("Provided positions are not within allowed length.");

  let move: Move = [pos[0]!];
  if (typeof pos[1] !== "undefined") move.push(pos[1]);
  if (typeof pos[2] !== "undefined") move.push(pos[2]);

  return move;
}

/** Verifies that a move has a valid length and affects only free matches.  */
export function validateMove(pile: Pile, move: Move): boolean {
  if (!canTake(move.length)) return false;

  return move.every((pos) => pile[pos] === "free");
}

/** Creates a new pile based on the played move **without validating the move**. */
export function applyMove(pile: Pile, move: Move, player: Player): Pile {
  return pile.map((match, pos) =>
    move.includes(pos as Position) ? player : match
  ) as unknown as Pile;
}
