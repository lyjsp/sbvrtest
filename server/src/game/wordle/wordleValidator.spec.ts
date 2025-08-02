import {PlayerHistory} from "../playerHistory/playerHistory";
import {WordleValidator} from "./wordleValidator";

describe("WordleValidator", () => {
  describe("validateGuessFormat", () => {
    it("does not throw for valid guess", () => {
      expect(() =>
        WordleValidator.validateGuessFormat("APPLE", 5)
      ).not.toThrow();
    });

    it("throws for guess with wrong length", () => {
      expect(() => WordleValidator.validateGuessFormat("APP", 5)).toThrow();
    });

    it("throws for guess with non-uppercase letters", () => {
      expect(() => WordleValidator.validateGuessFormat("apple", 5)).toThrow();
    });

    it("throws for guess with non A-Z letter characters", () => {
      expect(() => WordleValidator.validateGuessFormat("APPL3", 5)).toThrow();
    });
  });

  describe("validateGuessInWordList", () => {
    const wordList = ["APPLE", "BANJO", "CRANE"];
    it("does not throw for guess in word list", () => {
      expect(() =>
        WordleValidator.validateGuessInWordList("APPLE", wordList)
      ).not.toThrow();
    });

    it("throws for guess not in word list", () => {
      expect(() =>
        WordleValidator.validateGuessInWordList("MANGO", wordList)
      ).toThrow();
    });
  });

  describe("validateGameNotOver", () => {
    it("does not throw if game is not over", () => {
      expect(() => WordleValidator.validateGameNotOver(false)).not.toThrow();
    });

    it("throws if game is over", () => {
      expect(() => WordleValidator.validateGameNotOver(true)).toThrow();
    });
  });
});
