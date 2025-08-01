import * as readline from "readline";

export class PromptService {
  private rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (input) => resolve(input.trim()));
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
