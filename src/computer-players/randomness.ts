import { AllowedMoveLength, canTake, maxAllowed, minAllowed } from "../nim";

// Random components are extracted from the actors and provided as dependencies
// to ensure deterministic actor tests without mocking `Math.random`.

/** Returns a random number between {@link minAllowed} and {@link maxAllowed} both inclusive. */
export function getRandomTake(): AllowedMoveLength {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
  const take = Math.floor(
    Math.random() * (maxAllowed - minAllowed + 1) + minAllowed
  );

  if (!canTake(take))
    throw new Error(
      "Random take generator did not generate a number between 1 and 3"
    );

  return take;
}
