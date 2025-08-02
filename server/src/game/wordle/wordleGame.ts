import {LetterResult} from "../../../../common/src/game/enums";
import {GuessResult, WordleConfig} from "../../../../common/src/game/types";
import {AbstractWordleGame} from "./abstractWordleGame";
import {PlayerHistory} from "../playerHistory/playerHistory";
import {WordleValidator} from "./wordleValidator";

export class WordleGame extends AbstractWordleGame {
  protected readonly maxRounds: number;
  protected answer: string;

  constructor(config: WordleConfig) {
    super(config);
    this.answer = this.pickRandomAnswer();
  }

  /**
   * Pick a random answer from the word list.
   */
  protected pickRandomAnswer(): string {
    return this.wordList[Math.floor(Math.random() * this.wordList.length)];
  }

  public calculateResult(guess: string, answer: string): LetterResult[] {
    const result: LetterResult[] = Array(this.wordLength).fill(
      LetterResult.Miss
    );
    const answerArray = answer.split("");
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

    const results = this.calculateResult(normalizedGuess, this.answer);
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

    if (!playerHistory.hasRoundsLeft) {
      throw new Error("Player has no more rounds left.");
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
