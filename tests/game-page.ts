import type { Page } from "@playwright/test";
import type { Position } from "../src/nim";

export class GamePage {
  constructor(private readonly page: Page) {}

  public goto() {
    return this.page.goto("/");
  }

  /** Changes the implementation of `Math.random` to take matches deterministically. */
  public useSomeLuck(takes: number) {
    return this.page.evaluate((takes: number) => {
      Math.random = () => (takes - 0.5) / 3;
    }, takes);
  }

  /** Changes the thinking speed of computer players. */
  public downloadMoreCPU(thinkingDelay: number) {
    return this.page.evaluate((delay: number) => {
      window.thinkingDelay = delay;
    }, thinkingDelay);
  }

  readonly gameHeader = this.page.getByRole("heading", {
    level: 1,
    name: "Nim - The Game",
  });
  readonly difficulty = this.page.getByRole("combobox", {
    name: "Computer Difficulty:",
  });

  readonly startBtn = this.page.getByRole("button", { name: "Start Game" });
  readonly leaveBtn = this.page.getByRole("button", { name: "Leave" });
  readonly againBtn = this.page.getByRole("button", { name: "Play Again?" });
  readonly moveBtn = this.page.getByRole("button", { name: "Make Move" });

  readonly showInspectorBtn = this.page.getByRole("button", {
    name: "Show Inspector",
  });
  readonly hideInspectorBtn = this.page.getByRole("button", {
    name: "Hide Inspector",
  });

  readonly yourTurnText = this.page.getByText("Select up to Three Matches");
  readonly opponentTurnText = this.page.getByText("Waiting for Opponent");

  readonly wonText = this.page.getByRole("heading", {
    level: 2,
    name: "You have Won!",
  });
  readonly lostText = this.page.getByRole("heading", {
    level: 2,
    name: "You have Lost!",
  });

  public match(position: Position) {
    return this.page.getByRole("listitem", { name: `Match ${position + 1}` });
  }

  public selectDifficulty(difficulty: "medium" | "extreme") {
    return this.difficulty.selectOption(difficulty);
  }
}
