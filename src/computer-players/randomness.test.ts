import { getRandomTake } from "./randomness";

describe("getRandomTake", () => {
  afterEach(() => {
    jest.spyOn(Math, "random").mockRestore();
  });

  it("should return 1 if Math.random is between 0 and 1/3", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);
    expect(getRandomTake()).toBe(1);

    jest.spyOn(Math, "random").mockReturnValue(0.15151);
    expect(getRandomTake()).toBe(1);

    jest.spyOn(Math, "random").mockReturnValue(0.33333);
    expect(getRandomTake()).toBe(1);
  });

  it("should return 2 if Math.random is between 1/3 and 2/3", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.33334);
    expect(getRandomTake()).toBe(2);

    jest.spyOn(Math, "random").mockReturnValue(0.45454);
    expect(getRandomTake()).toBe(2);

    jest.spyOn(Math, "random").mockReturnValue(0.66666);
    expect(getRandomTake()).toBe(2);
  });

  it("should return 2 if Math.random is between 2/3 and 1", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.66667);
    expect(getRandomTake()).toBe(3);

    jest.spyOn(Math, "random").mockReturnValue(0.75757);
    expect(getRandomTake()).toBe(3);

    jest.spyOn(Math, "random").mockReturnValue(0.99999);
    expect(getRandomTake()).toBe(3);
  });
});
