import {LetterResult} from "../../../common/src/game/enums";
import {
  GuessResult,
  WordleBaseConfig,
  WordleConfig,
} from "../../../common/src/game/types";
import {PlayerHistory} from "./playerHistory";
import {WordleValidator} from "./wordleValidator";

export abstract class AbstractWordleGame {
  protected readonly wordList: string[];
  protected readonly playerHistories: Map<string, PlayerHistory>;
  protected readonly wordLength: number;
  protected isGameOver: boolean;
  protected gameOverAt: Date | null;
  protected firstWinnerId: string | null;

  constructor(config: WordleBaseConfig) {
    this.wordList = config.wordList.map((w) => w.toUpperCase());
    this.validateWordList(this.wordList);
    this.wordLength = this.wordList[0].length;
    this.playerHistories = new Map<string, PlayerHistory>();
    this.isGameOver = false;
    this.gameOverAt = null;
    this.firstWinnerId = null;
  }

  /**
   * Attempt a guess
   * @param userId player id
   * @param word guess answer
   * @returns GuessResults
   */
  public abstract guess(userId: string, word: string): GuessResult;

  /**
   * Calculate the hit/present/miss for each letter.
   */
  public abstract calculateResult(guess: string): LetterResult[];

  public abstract restartGame(): void;

  /**
   * Validate that all words in the list have the same length and list is not empty
   */
  protected validateWordList(wordList: string[]): void {
    if (wordList.length === 0) {
      throw new Error("Word list cannot be empty.");
    }
    const expectedLength = wordList[0].length;
    if (!wordList.every((w) => w.length === expectedLength)) {
      throw new Error("All words in word list must have the same length.");
    }
  }

  /**
   * Mark the game as over and set the time.
   */
  public handleGameOver(): void {
    this.isGameOver = true;
    this.gameOverAt = new Date();
  }

  /**
   * Get the length of the answer word
   */
  public getWordLength(): number {
    return this.wordLength;
  }

  public getPlayerCurrentRound(userId: string): number {
    const playerHistory = this.getPlayerHistory(userId);
    return playerHistory ? playerHistory.getCurrentRound() : 1;
  }

  public getPlayerHistory(userId: string): PlayerHistory | undefined {
    return this.playerHistories.get(userId);
  }

  public getAllPlayerHistories(): Map<string, PlayerHistory> {
    return this.playerHistories;
  }

  public resetPlayerHistories(): void {
    this.playerHistories.forEach((history) => history.reset());
  }

  public setIsGameOver(value: boolean): void {
    this.isGameOver = value;
  }

  public getIsGameOver(): boolean {
    return this.isGameOver;
  }

  public setGameOverAt(date: Date | null): void {
    this.gameOverAt = date;
  }

  public getGameOverAt(): Date | null {
    return this.gameOverAt;
  }

  public setFirstWinnerId(userId: string | null): void {
    this.firstWinnerId = userId;
  }

  public getFirstWinnerId(): string | null {
    return this.firstWinnerId;
  }
}

export class WordleGame extends AbstractWordleGame {
  protected readonly maxRounds: number;
  protected answer: string;

  constructor(config: WordleConfig) {
    super(config);
    this.maxRounds = config.maxRounds;
    this.answer = this.pickRandomAnswer();
  }

  /**
   * Pick a random answer from the word list.
   */
  protected pickRandomAnswer(): string {
    return this.wordList[Math.floor(Math.random() * this.wordList.length)];
  }

  public calculateResult(guess: string): LetterResult[] {
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
        // Count unmatched letters in the answer
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
   * Restart the game with a new random answer.
   */
  restartGame(): void {
    this.playerHistories.clear();
    this.answer = this.pickRandomAnswer();
    this.isGameOver = false;
    this.gameOverAt = null;
    this.firstWinnerId = null;
  }
}
