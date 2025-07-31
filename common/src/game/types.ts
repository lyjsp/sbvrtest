import {LetterResult} from "./enums";

/**
 * Result for a full guess
 */
export interface GuessResult {
  guess: string;
  results: LetterResult[];
}

/**
 * Game configuration
 */
export interface WordleConfig {
  maxRounds: number;
  wordList: string[];
}
