import * as readline from "readline";

export class PromptService {
  private allowEsc: boolean = false;
  private escCancelled = false;
  private escHandler?: () => void;

  private rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  constructor() {
    this.listenForEsc();
  }

  private listenForEsc() {
    process.stdin.on("data", (data) => {
      if (!this.allowEsc) return;
      if (data.length === 1 && data[0] === 27 /* ESC */) {
        if (this.escHandler) {
          this.escHandler();
        }
      }
    });
  }

  /**
   * Prompt the user for input with an optional ESC key handler.
   * @param question The question to prompt the user with.
   * @param allowEsc Whether to allow ESC key to cancel the prompt.
   * @returns A promise that resolves with the user's input or null if cancelled.
   */
  prompt(question: string, allowEsc = false): Promise<string | null> {
    this.allowEsc = allowEsc;
    this.escCancelled = false;

    if (!!this.allowEsc) {
      console.log("(Press ESC to return to menu.)");
    }

    return new Promise((resolve) => {
      this.escHandler = () => {
        console.log("\nPrompt cancelled by ESC.");
        this.allowEsc = false;
        this.escCancelled = true;
        this.showMenu();
      };
      this.rl.question(question, (input) => {
        this.escHandler = undefined;
        this.allowEsc = false;
        if (this.escCancelled) {
          resolve(null);
        } else {
          resolve(input.trim());
        }
      });
    });
  }

  close() {
    this.rl.close();
  }

  showMenu() {
    console.log("\n=== Wordle Menu ===");
    console.log("1. Play");
    console.log("2. Game status");
    console.log("3. See score board");
    console.log("4. See my score");
    console.log("5. See my current game results");
    console.log("0. Exit");
  }
}
