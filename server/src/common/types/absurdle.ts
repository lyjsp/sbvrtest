import {LetterResult} from "../../../../common/src/game/enums";

export type AbsurdleCandidateResult = {
  candidate: string;
  result: LetterResult[];
  numberOfHit: number;
  numberOfPresent: number;
};
