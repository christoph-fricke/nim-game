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

  readonly gameHeader = this.page.locator('h1 >> text="Nim - The Game"');
  readonly difficulty = this.page.locator(
    '*css=label >> text="Computer Difficulty:"'
  );

  readonly startBtn = this.page.locator('button >> text="Start Game"');
  readonly leaveBtn = this.page.locator('button >> text="Leave"');
  readonly againBtn = this.page.locator('button >> text="Play Again?"');
  readonly moveBtn = this.page.locator('button >> text="Make Move"');

  readonly showInspectorBtn = this.page.locator(
    "button >> text=Show Inspector"
  );
  readonly hideInspectorBtn = this.page.locator(
    "button >> text=Hide Inspector"
  );

  readonly yourTurnText = this.page.locator(
    'text="Select up to Three Matches"'
  );
  readonly opponentTurnText = this.page.locator('text="Waiting for Opponent"');

  readonly wonText = this.page.locator(
    'h2[data-tone="positive"] >> text="You have Won!"'
  );
  readonly lostText = this.page.locator(
    'h2[data-tone="negative"] >> text="You have Lost!"'
  );

  public match(position: Position) {
    return this.page.locator(
      `button[role="listitem"][aria-label="Match ${position + 1}"]`
    );
  }

  public selectDifficulty(difficulty: "medium" | "extreme") {
    return this.difficulty.selectOption(difficulty);
  }
}
