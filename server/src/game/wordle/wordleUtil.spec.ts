import {WordleUtil} from "./wordleUtil";
import {LetterResult} from "../../../../common/src/game/enums";

describe("WordleUtil.getNumberOfHitAndPresent", () => {
  it("should return 0 hits and 0 presents for empty array", () => {
    expect(WordleUtil.getNumberOfHitAndPresent([])).toEqual({
      hit: 0,
      present: 0,
    });
  });

  it("should count only hits", () => {
    const input = [LetterResult.Hit, LetterResult.Hit, LetterResult.Hit];
    expect(WordleUtil.getNumberOfHitAndPresent(input)).toEqual({
      hit: 3,
      present: 0,
    });
  });

  it("should count only presents", () => {
    const input = [LetterResult.Present, LetterResult.Present];
    expect(WordleUtil.getNumberOfHitAndPresent(input)).toEqual({
      hit: 0,
      present: 2,
    });
  });

  it("should count both hits and presents", () => {
    const input = [
      LetterResult.Hit,
      LetterResult.Present,
      LetterResult.Hit,
      LetterResult.Present,
      LetterResult.Present,
    ];
    expect(WordleUtil.getNumberOfHitAndPresent(input)).toEqual({
      hit: 2,
      present: 3,
    });
  });

  it("should ignore other values", () => {
    const input = [
      LetterResult.Hit,
      LetterResult.Present,
      LetterResult.Miss,
      LetterResult.Miss,
    ];
    expect(WordleUtil.getNumberOfHitAndPresent(input)).toEqual({
      hit: 1,
      present: 1,
    });
  });
});
