export class WordleValidator {
  static validateGuessFormat(guess: string, wordLength: number): void {
    if (!new RegExp(`^[A-Z]{${wordLength}}$`).test(guess)) {
      throw new Error(`Guess must be exactly ${wordLength} English letters.`);
    }
  }

  static validateGuessInWordList(guess: string, wordList: string[]): void {
    if (!wordList.includes(guess)) {
      throw new Error("Guess must be in the allowed word list.");
    }
  }

  static validateGameNotOver(isGameOver: boolean): void {
    if (isGameOver) {
      throw new Error("Game is already over.");
    }
  }
}
