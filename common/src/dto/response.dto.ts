import {GuessResult} from "../game/types";

export class ResponseDto {
  maxRounds: number;
  remainingRounds: number;
  guess: string;
  results: GuessResult[];
  gameOver: boolean;
  win: boolean;
  answer?: string; // Optional, only set when game is over
}
