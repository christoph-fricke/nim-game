import { GamePage } from "../game-page";
import { expect, test } from "../test";

test.describe.parallel("Given a computer at medium difficulty", () => {
  test("When the computer takes the last match, a win screen is shown", async ({
    page,
  }) => {
    test.slow(
      true,
      "Plays against computers which require 2s each turn to think."
    );
    const game = new GamePage(page);

    await game.goto();
    await game.useSomeLuck(3);
    await game.startBtn.click();

    await game.match(0).click();
    await game.match(1).click();
    await game.match(2).click();
    await game.moveBtn.click();

    // Computer takes 3 - 5

    await game.match(6).click();
    await game.match(7).click();
    await game.moveBtn.click();

    // Computer takes 8 - 10

    await game.match(11).click();
    await game.moveBtn.click();

    // Computer takes 12

    await expect(game.wonText).toBeVisible();
    await game.againBtn.click();
    await expect(game.startBtn).toBeEnabled();
  });

  test("When the user takes the last match, a loose screen is shown", async ({
    page,
  }) => {
    test.slow(
      true,
      "Plays against computers which require 2s each turn to think."
    );
    const game = new GamePage(page);

    await game.goto();

    await expect(game.difficulty).toHaveValue("medium");
    await game.useSomeLuck(3);
    await game.startBtn.click();

    await game.match(0).click();
    await game.match(1).click();
    await game.match(2).click();
    await game.moveBtn.click();

    // Computer takes 3 - 5

    await game.match(6).click();
    await game.match(7).click();
    await game.match(8).click();
    await game.moveBtn.click();

    // Computer takes 9 - 11

    await game.match(12).click();
    await game.moveBtn.click();

    await expect(game.lostText).toBeVisible();
    await game.againBtn.click();
    await expect(game.startBtn).toBeEnabled();
  });
});

test.describe.parallel("Given a computer at extreme difficulty", () => {
  test("When the user makes a move, the computer counters the move", async ({
    page,
  }) => {
    test.slow(
      true,
      "Plays against computers which require 2s each turn to think."
    );
    const game = new GamePage(page);

    await game.goto();
    await game.selectDifficulty("extreme");

    await game.startBtn.click();

    await game.match(0).click();
    await game.match(1).click();
    await game.match(2).click();
    await game.moveBtn.click();

    // Computer adds 1 => takes 3

    await game.match(4).click();
    await game.match(5).click();
    await game.moveBtn.click();

    // Computer adds 2 => takes 6 - 7

    await game.match(8).click();
    await game.moveBtn.click();

    // Computer adds 3 => takes 9 - 11

    await game.match(12).click();
    await game.moveBtn.click();

    await expect(game.lostText).toBeVisible();
    await game.againBtn.click();
    await expect(game.startBtn).toBeEnabled();
  });
});
