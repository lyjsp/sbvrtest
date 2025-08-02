import {LetterResult} from "../../../common/src/game/enums";
import {GuessResult} from "../../../common/src/game/types";

export class PlayerHistory {
  private readonly maxRounds: number;
  private guesses: GuessResult[] = [];

  constructor(maxRounds: number) {
    this.maxRounds = maxRounds;
  }

  addGuess(result: GuessResult) {
    this.guesses.push(result);
  }

  getGuessResults(): GuessResult[] {
    return this.guesses;
  }

  getLastGuess(): GuessResult | undefined {
    return this.guesses[this.guesses.length - 1];
  }

  getGuessCount(): number {
    return this.guesses.length;
  }

  hasGuesses(): boolean {
    return this.guesses.length > 0;
  }

  reset() {
    this.guesses = [];
  }

  /**
   * Check if player won
   */
  isWon(): boolean {
    return this.guesses.some((g) =>
      g.results.every((r) => r === LetterResult.Hit)
    );
  }

  isLost(): boolean {
    return this.guesses.length >= this.maxRounds && !this.isWon();
  }

  /**
   * Get the number of remaining rounds
   */
  getRemainingRounds(): number {
    return this.maxRounds - this.guesses.length;
  }

  getCurrentRound(): number {
    return this.guesses.length + 1;
  }
}
