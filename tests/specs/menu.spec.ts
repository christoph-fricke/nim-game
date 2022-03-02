import { createPile, Match, Position } from "../../src/nim";
import { GamePage } from "../game-page";
import { expect, test } from "../test";

test.describe.parallel("Given the user opens the game", () => {
  test("When the inspector is toggled, Stately opens in a new tab", async ({
    page,
  }) => {
    const game = new GamePage(page);

    await game.goto();
    await expect(game.showInspectorBtn).toBeEnabled();
    await expect(game.hideInspectorBtn).toBeHidden();

    await Promise.all([
      page.waitForEvent(
        "popup",
        (page) => page.url() === "https://stately.ai/viz?inspect"
      ),
      game.showInspectorBtn.click(),
    ]);

    await expect(game.hideInspectorBtn).toBeEnabled();
    await expect(game.showInspectorBtn).toBeHidden();

    // "Show Inspector" state is persisted between reloads
    await page.reload();
    await expect(game.hideInspectorBtn).toBeEnabled();
    await expect(game.showInspectorBtn).toBeHidden();

    await game.hideInspectorBtn.click();
  });

  test("Then the user can select between two difficulties", async ({
    page,
  }) => {
    const game = new GamePage(page);

    await game.goto();

    await expect(game.difficulty).toHaveValue("medium");
    await game.selectDifficulty("extreme");
    await expect(game.difficulty).toHaveValue("extreme");
    await game.selectDifficulty("medium");
    await expect(game.difficulty).toHaveValue("medium");
  });
});

test.describe.parallel("Given the user plays a game", () => {
  test("When 'leave' is clicked, the game is exited instantly", async ({
    page,
  }) => {
    const game = new GamePage(page);

    await game.goto();

    await expect(game.gameHeader).toBeVisible();
    await game.startBtn.click();

    await expect(game.startBtn).toBeHidden();
    await expect(game.moveBtn).toBeDisabled();
    await expect(game.gameHeader).toBeVisible();

    await expect(game.showInspectorBtn).toBeEnabled();
    await expect(game.hideInspectorBtn).toBeHidden();

    await game.leaveBtn.click();
    await expect(game.startBtn).toBeVisible();
  });

  test("When a user selects matches, the move becomes enabled or disabled", async ({
    page,
  }) => {
    const game = new GamePage(page);

    await game.goto();
    await game.startBtn.click();

    await expect(game.moveBtn).toBeDisabled();

    await game.match(5).click();
    await expect(game.moveBtn).toBeEnabled();

    await game.match(5).click();
    await expect(game.moveBtn).toBeDisabled();
  });

  test("When a user selects matches, no more than 3 matches can be selected at once", async ({
    page,
  }) => {
    const game = new GamePage(page);

    await game.goto();
    await game.startBtn.click();

    await game.match(5).click();
    await game.match(2).click();
    await game.match(4).click();

    await expect(game.match(0)).toBeDisabled();
    await expect(game.match(6)).toBeDisabled();
    await expect(game.match(12)).toBeDisabled();

    // Other can be clicked after selected once are deselected
    await game.match(2).click();
    await game.match(5).click();
    await game.match(0).click();
    await game.match(6).click();
  });

  test("When a user selects and makes a move, the match state changes", async ({
    page,
  }) => {
    let expectedState = createPile() as (Match | "selected")[];
    let expectMatchState = () =>
      Promise.all(
        expectedState.map((match, i) =>
          game.expectState(game.match(i as Position), match)
        )
      );

    const game = new GamePage(page);

    await game.goto();
    await game.useSomeLuck(3);
    await game.startBtn.click();

    await expectMatchState();

    await game.match(5).click();
    await game.match(2).click();
    await game.match(4).click();

    expectedState[5] = expectedState[2] = expectedState[4] = "selected";
    await expectMatchState();

    await game.moveBtn.click();

    expectedState[5] = expectedState[2] = expectedState[4] = "player1";
    // Computer should take the first 3 free matches
    expectedState[0] = expectedState[1] = expectedState[3] = "player2";
    await expectMatchState();
  });
});
