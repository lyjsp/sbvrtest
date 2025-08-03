import {LetterResult} from "../../../../common/src/game/enums";

export class WordleUtil {
  static getNumberOfHitAndPresent(result: LetterResult[]): {
    hit: number;
    present: number;
  } {
    return result.reduce(
      (acc, outcome) => {
        if (outcome === LetterResult.Hit) {
          acc.hit++;
        } else if (outcome === LetterResult.Present) {
          acc.present++;
        }
        return acc;
      },
      {hit: 0, present: 0}
    );
  }
}
