import {WordleGame} from "./wordle";
import {LetterResult} from "../../../common/src/game/enums";

describe("WordleGame", () => {
  const wordList = ["apple", "grape", "mango", "peach", "lemon", "melon"];
  const config = {maxRounds: 6, wordList};

  it("should throw if wordList is empty", () => {
    expect(() => new WordleGame({maxRounds: 6, wordList: []})).toThrow();
  });

  it("should throw if wordList has different lengths", () => {
    expect(
      () => new WordleGame({maxRounds: 6, wordList: ["apple", "grapes"]})
    ).toThrow();
  });

  it("should accept valid guesses and return correct results", () => {
    const game = new WordleGame(config);
    const answer = game.getAnswer();
    const guess = answer;
    const result = game.guess(guess);
    expect(result.guess).toBe(guess);
    expect(result.results.every((r) => r === LetterResult.Hit)).toBe(true);
    expect(game.isWin()).toBe(true);
  });

  it("should reject guesses not in wordList", () => {
    const game = new WordleGame(config);
    expect(() => game.guess("zzzzz")).toThrow();
  });

  it("should reject guesses of wrong length", () => {
    const game = new WordleGame(config);
    expect(() => game.guess("app")).toThrow();
    expect(() => game.guess("apples")).toThrow();
  });

  it("should lose after maxRounds incorrect guesses", () => {
    const game = new WordleGame(config);

    // Mock the answer to ensure incorrect guesses
    game.setAnswer("wrong");

    for (let i = 0; i < config.maxRounds; i++) {
      try {
        game.guess(wordList[0]);
      } catch {}
    }
    expect(game.isLose()).toBe(true);
    expect(game.isGameOver()).toBe(true);
  });

  it("should reject guess if max rounds exceeded", () => {
    const game = new WordleGame(config);
    const maxRounds = game.getMaxRounds();

    // Mock the answer to ensure incorrect guesses
    game.setAnswer("wrong");

    for (let i = 0; i < maxRounds; i++) {
      try {
        game.guess(wordList[0]);
      } catch {}
    }
    // Try one more guess after max rounds
    expect(() => game.guess(wordList[0])).toThrow();
  });

  it("should restart the game correctly", () => {
    const game = new WordleGame(config);
    game.guess("apple");
    expect(game.getHistory().length).toBe(1);
    expect(game.getRemainingRounds()).toBe(5);
    game.restartGame();
    expect(game.getHistory().length).toBe(0);
    expect(game.getRemainingRounds()).toBe(6);
  });
});
