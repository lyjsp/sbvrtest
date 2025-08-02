import {LetterResult} from "../game/enums";
import {GuessResult} from "../game/types";

export class ResponseDto {
  wordLength: number;
  maxRounds: number;
  remainingRounds: number;
  guess: string;
  results?: LetterResult[];
  guessHistory: GuessResult[];
  gameOver: boolean;
  win: boolean;
  answer?: string; // Optional, only set when game is over
}
