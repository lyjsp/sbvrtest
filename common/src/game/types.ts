import {LetterResult} from "./enums";

/**
 * Result for a full guess
 */
export interface GuessResult {
  isWon: boolean;
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

export type PlayerPoints = {
  hit: number;
  present: number;
};

export type PlayerEvent = {
  type: "points" | "win" | "countdown" | "restart";
  player?: string;
  points?: PlayerPoints;
  guess?: string;
  answer?: string;
  countdown?: number;
};

export type PlayerScore = {
  id: string;
  name: string;
  score: number;
  rounds: number;
  accuracy: number;
};
