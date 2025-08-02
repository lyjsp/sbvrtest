import {LetterResult} from "../../../../common/src/game/enums";
import {GuessResult, WordleConfig} from "../../../../common/src/game/types";
import {AbstractPlayerHistory} from "../playerHistory/abstractPlayerHistory";
import {PlayerHistory} from "../playerHistory/playerHistory";

export abstract class AbstractWordleGame {
  protected readonly wordList: string[];
  protected readonly playerHistories: Map<string, AbstractPlayerHistory>;
  protected readonly wordLength: number;
  protected isGameOver: boolean;
  protected gameOverAt: Date | null;
  protected firstWinnerId: string | null;
  protected maxRounds: number;

  constructor(config: WordleConfig) {
    this.wordList = config.wordList.map((w) => w.toUpperCase());
    this.validateWordList(this.wordList);
    this.wordLength = this.wordList[0].length;
    this.playerHistories = new Map<string, PlayerHistory>();
    this.isGameOver = false;
    this.gameOverAt = null;
    this.firstWinnerId = null;
    this.maxRounds = config.maxRounds;
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
  public abstract calculateResult(
    guess: string,
    answer: string
  ): LetterResult[];

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

  public getPlayerHistory(userId: string): AbstractPlayerHistory | undefined {
    return this.playerHistories.get(userId);
  }

  public getAllPlayerHistories(): Map<string, AbstractPlayerHistory> {
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

  public getMaxRounds(): number {
    return this.maxRounds;
  }
}
