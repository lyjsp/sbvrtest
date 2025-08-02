import {LetterResult} from "../../../../common/src/game/enums";
import {GuessResult} from "../../../../common/src/game/types";

export abstract class AbstractPlayerHistory {
  protected guesses: GuessResult[] = [];
  private readonly maxRounds: number;

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

  getCurrentRound(): number {
    return this.guesses.length + 1;
  }

  getRemainingRounds(): number {
    return this.maxRounds - this.getGuessCount();
  }

  get hasRoundsLeft(): boolean {
    return this.getRemainingRounds() > 0;
  }
}
