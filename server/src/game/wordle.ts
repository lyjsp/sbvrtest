import {LetterResult} from "../../../common/src/game/enums";
import {GuessResult, WordleConfig} from "../../../common/src/game/types";

export class WordleGame {
  private wordLength: number;
  private answer: string;
  private guesses: GuessResult[] = [];
  private readonly maxRounds: number;
  private readonly wordList: string[];

  constructor(config: WordleConfig) {
    this.wordList = config.wordList.map((w) => w.toLowerCase());
    this.validateWordList(this.wordList);
    this.maxRounds = config.maxRounds;
    // Randomly choose an answer from the list
    this.answer =
      this.wordList[Math.floor(Math.random() * this.wordList.length)];
    this.wordLength = this.getAnswer().length;
  }

  /**
   * Set a specific answer
   * @param answer the answer word to set
   */
  setAnswer(answer: string): void {
    this.answer = answer.toLowerCase();
  }

  /**
   * Attempt a guess
   * @param word guess answer
   * @returns GuessResults
   */
  guess(word: string): GuessResult {
    const normalizedGuess = word.toLowerCase();

    if (!new RegExp(`^[a-z]{${this.wordLength}}$`).test(normalizedGuess)) {
      throw new Error(
        `Guess must be exactly ${this.wordLength} English letters.`
      );
    }
    if (!this.wordList.includes(normalizedGuess)) {
      throw new Error("Guess must be in the allowed word list.");
    }
    if (this.isGameOver()) {
      throw new Error("Game is already over.");
    }

    const results = this.calculateResult(normalizedGuess);
    const guessResult: GuessResult = {guess: normalizedGuess, results};
    this.guesses.push(guessResult);
    return guessResult;
  }

  /**
   * Check if player won
   */
  isWin(): boolean {
    return this.guesses.some((g) =>
      g.results.every((r) => r === LetterResult.Hit)
    );
  }

  /**
   * Check if player lost
   */
  isLose(): boolean {
    return this.guesses.length >= this.maxRounds && !this.isWin();
  }

  /**
   * Check if the game is over
   */
  isGameOver(): boolean {
    return this.isWin() || this.isLose();
  }

  /**
   * Get the maximum number of rounds allowed
   */
  getMaxRounds(): number {
    return this.maxRounds;
  }

  /**
   * Get the number of remaining rounds
   */
  getRemainingRounds(): number {
    return this.maxRounds - this.guesses.length;
  }

  /**
   * Get the game history
   */
  getHistory(): GuessResult[] {
    return this.guesses;
  }

  /**
   * Reveal the answer
   */
  getAnswer(): string {
    return this.answer;
  }

  /**
   * Get the length of the answer word
   */
  getWordLength(): number {
    return this.wordLength;
  }

  /**
   * Restart the game with a new random answer
   */
  restartGame(): void {
    this.guesses = [];
    this.answer =
      this.wordList[Math.floor(Math.random() * this.wordList.length)];
  }

  /**
   * Validate that all words in the list have the same length and list is not empty
   */
  private validateWordList(wordList: string[]): void {
    if (wordList.length === 0) {
      throw new Error("Word list cannot be empty.");
    }
    const expectedLength = wordList[0].length;
    if (!wordList.every((w) => w.length === expectedLength)) {
      throw new Error("All words in word list must have the same length.");
    }
  }

  /**
   * Calculate the hit/present/miss for each letter
   */
  private calculateResult(guess: string): LetterResult[] {
    const result: LetterResult[] = Array(5).fill(LetterResult.Miss);
    const answerArray = this.answer.split("");
    const guessArray = guess.split("");

    // First pass: mark hits
    const usedAnswerIndices = new Set<number>();
    guessArray.forEach((ch, i) => {
      if (ch === answerArray[i]) {
        result[i] = LetterResult.Hit;
        usedAnswerIndices.add(i);
      }
    });

    // Second pass: mark presents
    guessArray.forEach((ch, i) => {
      if (result[i] === LetterResult.Hit) return;

      const idx = answerArray.findIndex(
        (ansCh, ansIdx) => ansCh === ch && !usedAnswerIndices.has(ansIdx)
      );

      if (idx !== -1) {
        result[i] = LetterResult.Present;
        usedAnswerIndices.add(idx);
      }
    });

    return result;
  }
}
