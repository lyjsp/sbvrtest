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
export interface WordleBaseConfig {
  wordList: string[];
}

export interface WordleConfig extends WordleBaseConfig {
  maxRounds: number;
}

export type PlayerPoints = {
  hit: number;
  present: number;
};

export type PlayerEvent = {
  type: "points" | "win" | "countdown" | "restart";
  playerId?: string;
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
