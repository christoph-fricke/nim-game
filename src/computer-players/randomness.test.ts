import { getRandomTake } from "./randomness";

// TODO: Fix mock restoring...
describe("getRandomTake", () => {
  const spy = jest.spyOn(Math, "random");

  afterAll(() => {
    spy.mockRestore();
  });

  it("should return 1 if Math.random is between 0 and 1/3", () => {
    spy.mockReturnValue(0);
    expect(getRandomTake()).toBe(1);

    spy.mockReturnValue(0.15151);
    expect(getRandomTake()).toBe(1);

    spy.mockReturnValue(0.33333);
    expect(getRandomTake()).toBe(1);
  });

  it("should return 2 if Math.random is between 1/3 and 2/3", () => {
    spy.mockReturnValue(0.33334);
    expect(getRandomTake()).toBe(2);

    spy.mockReturnValue(0.45454);
    expect(getRandomTake()).toBe(2);

    spy.mockReturnValue(0.66666);
    expect(getRandomTake()).toBe(2);
  });

  it("should return 2 if Math.random is between 2/3 and 1", () => {
    spy.mockReturnValue(0.66667);
    expect(getRandomTake()).toBe(3);

    spy.mockReturnValue(0.75757);
    expect(getRandomTake()).toBe(3);

    spy.mockReturnValue(0.99999);
    expect(getRandomTake()).toBe(3);
  });

  it("should throw for invalid position counts", () => {
    // Cant'be returned by Math.random. Should just test the error handling.
    spy.mockReturnValue(1);

    expect(getRandomTake).toThrowError(
      "Random take generator did not generate a number between 1 and 3"
    );
  });
});
