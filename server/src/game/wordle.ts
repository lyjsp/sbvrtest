import {LetterResult} from "../../../common/src/game/enums";
import {GuessResult, WordleConfig} from "../../../common/src/game/types";
import {PlayerHistory} from "./playerHistory";
import {WordleValidator} from "./wordleValidator";

export class WordleGame {
  private readonly maxRounds: number;
  private readonly wordList: string[];
  private readonly playerHistories: Map<string, PlayerHistory>;
  private wordLength: number;
  private answer: string;
  private isGameOver;
  private gameOverAt: Date | null;
  private firstWinnerId: string | null;

  constructor(config: WordleConfig) {
    this.maxRounds = config.maxRounds;
    this.wordList = config.wordList.map((w) => w.toUpperCase());
    this.validateWordList(this.wordList);
    this.answer = this.pickRandomAnswer();
    this.wordLength = this.answer.length;
    this.playerHistories = new Map<string, PlayerHistory>();
    this.isGameOver = false;
    this.gameOverAt = null;
    this.firstWinnerId = null;
  }

  /**
   * Set a specific answer
   * @param answer the answer word to set
   */
  setAnswer(answer: string): void {
    this.answer = answer.toUpperCase();
  }

  /**
   * Attempt a guess
   * @param userId player id
   * @param word guess answer
   * @returns GuessResults
   */
  guess(userId: string, word: string): GuessResult {
    const normalizedGuess = word.toUpperCase();

    WordleValidator.validateGuessFormat(normalizedGuess, this.wordLength);
    WordleValidator.validateGuessInWordList(normalizedGuess, this.wordList);
    WordleValidator.validateGameNotOver(this.isGameOver);

    const results = this.calculateResult(normalizedGuess);
    const guessResult: GuessResult = {
      guess: normalizedGuess,
      results,
      isWon: results.every((r) => r === LetterResult.Hit),
    };

    // Store guess in player's history
    let playerHistory = this.playerHistories.get(userId);
    if (!playerHistory) {
      playerHistory = new PlayerHistory(this.maxRounds);
      this.playerHistories.set(userId, playerHistory);
    }
    playerHistory.addGuess(guessResult);

    // Set game over if player has won
    if (guessResult.isWon) {
      this.firstWinnerId = this.firstWinnerId || userId;
      this.handleGameOver();
    }

    return guessResult;
  }

  /**
   * Mark the game as over and set the time.
   */
  private handleGameOver(): void {
    this.isGameOver = true;
    this.gameOverAt = new Date();
  }

  getPlayerHistory(userId: string): PlayerHistory | undefined {
    return this.playerHistories.get(userId);
  }

  getAllPlayerHistories(): Map<string, PlayerHistory> {
    return this.playerHistories;
  }

  resetPlayerHistories(): void {
    this.playerHistories.forEach((history) => history.reset());
  }

  setIsGameOver(value: boolean): void {
    this.isGameOver = value;
  }

  getIsGameOver(): boolean {
    return this.isGameOver;
  }

  setGameOverAt(date: Date | null): void {
    this.gameOverAt = date;
  }

  getGameOverAt(): Date | null {
    return this.gameOverAt;
  }

  /**
   * Get the maximum number of rounds allowed
   */
  getMaxRounds(): number {
    return this.maxRounds;
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
   * Get the first winner's userId, or null if no winner yet.
   */
  getFirstWinnerId(): string | null {
    return this.firstWinnerId;
  }

  /**
   * Restart the game with a new random answer.
   */
  restartGame(): void {
    this.playerHistories.clear();
    this.answer = this.pickRandomAnswer();
    this.wordLength = this.answer.length;
    this.isGameOver = false;
    this.gameOverAt = null;
    this.firstWinnerId = null;
  }

  /**
   * Pick a random answer from the word list.
   */
  private pickRandomAnswer(): string {
    return this.wordList[Math.floor(Math.random() * this.wordList.length)];
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
   * Calculate the hit/present/miss for each letter.
   */
  private calculateResult(guess: string): LetterResult[] {
    const result: LetterResult[] = Array(this.wordLength).fill(
      LetterResult.Miss
    );
    const answerArray = this.answer.split("");
    const guessArray = guess.split("");

    // First pass: mark hits and count non-hit letters in answer
    const answerLetterCounts: Record<string, number> = {};

    for (let i = 0; i < this.wordLength; i++) {
      if (guessArray[i] === answerArray[i]) {
        result[i] = LetterResult.Hit;
      } else {
        answerLetterCounts[answerArray[i]] =
          (answerLetterCounts[answerArray[i]] || 0) + 1;
      }
    }

    // Second pass: mark presents for letters that are in the answer but not hits
    for (let i = 0; i < this.wordLength; i++) {
      if (result[i] === LetterResult.Hit) continue;
      const guessLetter = guessArray[i];
      if (answerLetterCounts[guessLetter]) {
        result[i] = LetterResult.Present;
        answerLetterCounts[guessLetter]--; // Avoids double counting letters that are already hits
      }
    }

    return result;
  }
}
