import * as readline from "readline";
import {MenuOption} from "../common/types/prompt";

export class PromptService {
  private allowEsc: boolean = false;
  private escCancelled = false;
  private escHandler?: () => void;
  private readonly menuOptions: MenuOption[];

  private rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  constructor(menuOptions: MenuOption[]) {
    this.menuOptions = menuOptions;
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
        console.log("\nPrompt cancelled by ESC. Returning to menu.");
        this.allowEsc = false;
        this.escCancelled = true;
        // Simulate pressing Enter to go back to the menu
        this.rl.write(null, {name: "return"});
        resolve(null);
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

  async showMenu(): Promise<string | null> {
    const menuPromptMessage = `
=== Wordle Menu ===
Select an option:
${this.menuOptions
  .map((option) => `${option.command}. ${option.description}`)
  .join("\n")}
Type your choice and press Enter.
    `;
    const choice = await this.prompt(menuPromptMessage);
    return choice;
  }
}
