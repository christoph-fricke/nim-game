import { createTestModel } from "@xstate/test";
import { GamePage } from "../game-page";
import { test, expect } from "../test";
import { createMainMenuMachine } from "./main-menu-machine";

test.describe("Main Menu", () => {
  const model = createTestModel(createMainMenuMachine());

  for (const path of model.getSimplePaths()) {
    test(path.description + "", async ({ page }) => {
      const game = new GamePage(page);
      await game.goto();

      await path.test({
        states: {
          MainMenu: async () => {
            await expect(game.gameHeader).toBeVisible();
          },
          MediumDifficulty: async () => {
            await expect(game.gameHeader).toBeVisible();
            await expect(game.difficulty).toHaveValue("medium");
          },
          ExtremeDifficulty: async () => {
            await expect(game.gameHeader).toBeVisible();
            await expect(game.difficulty).toHaveValue("extreme");
          },
          Playing: async () => {
            await expect(game.yourTurnText).toBeVisible();
            await expect(game.moveBtn).toBeDisabled();
          },
        },
        events: {
          "start game": async () => {
            await game.startBtn.click();
          },
          "leave game": async () => {
            await game.leaveBtn.click();
          },
          "change to medium": async () => {
            await game.selectDifficulty("medium");
          },
          "change to extreme": async () => {
            await game.selectDifficulty("extreme");
          },
        },
      });
    });
  }
});
