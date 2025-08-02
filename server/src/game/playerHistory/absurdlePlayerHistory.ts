import {AbstractPlayerHistory} from "./abstractPlayerHistory";

export class AbsurdlePlayerHistory extends AbstractPlayerHistory {
  private candidateWords: string[];
  private matchedGuess: string | null;

  constructor(maxRound: number, candidateWords: string[]) {
    super(maxRound);
    this.candidateWords = candidateWords;
    this.matchedGuess = null;
  }

  getCandidateWords(): string[] {
    return this.candidateWords;
  }

  setCandidateWords(words: string[]) {
    this.candidateWords = words;
  }

  setMatchedGuess(guess: string) {
    this.matchedGuess = guess;
  }

  getMatchedGuess(): string | null {
    return this.matchedGuess;
  }
}
