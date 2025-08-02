import {WordleGame} from "./wordleGame";
import {LetterResult} from "../../../../common/src/game/enums";
import {WordleConfig} from "../../../../common/src/game/types";

describe("WordleGame", () => {
  const config: WordleConfig = {
    maxRounds: 6,
    wordList: ["APPLE", "PEACH", "MANGO", "GRAPE", "MELON", "LEMON", "BERRY"],
  };

  let game: WordleGame;

  beforeEach(() => {
    game = new WordleGame(config);
    game.setAnswer("APPLE");
  });

  describe("calculateResult", () => {
    it("should returns all hits for correct guess", () => {
      const result = game.calculateResult("APPLE", "APPLE");
      expect(result).toEqual([
        LetterResult.Hit,
        LetterResult.Hit,
        LetterResult.Hit,
        LetterResult.Hit,
        LetterResult.Hit,
      ]);
    });

    it("should returns all miss for completely wrong guess", () => {
      const result = game.calculateResult("MANGO", "BERRY");
      expect(result).toEqual([
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
      ]);
    });

    it("should returns present for correct letters in wrong positions", () => {
      const result = game.calculateResult("GRAPE", "APPLE");
      expect(result).toEqual([
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Present,
        LetterResult.Present,
        LetterResult.Hit,
      ]);
    });

    it("should handles matched letters correctly", () => {
      const result = game.calculateResult("MANGO", "APPLE");
      expect(result).toEqual([
        LetterResult.Miss,
        LetterResult.Present,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
      ]);
    });
  });

  describe("guess", () => {
    it("should returns correct GuessResult for a winning guess", () => {
      const guessResult = game.guess("user1", "APPLE");
      expect(guessResult.guess).toBe("APPLE");
      expect(guessResult.results).toEqual([
        LetterResult.Hit,
        LetterResult.Hit,
        LetterResult.Hit,
        LetterResult.Hit,
        LetterResult.Hit,
      ]);

      expect(guessResult.isWon).toBe(true);
      expect(game.getIsGameOver()).toBe(true);
      expect(game.getFirstWinnerId()).toBe("user1");
    });

    it("should returns correct GuessResult for a losing guess", () => {
      game.setAnswer("MANGO");
      const guessResult = game.guess("user2", "BERRY");
      expect(guessResult.guess).toBe("BERRY");
      expect(guessResult.results).toEqual([
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
      ]);
      expect(guessResult.isWon).toBe(false);
      expect(game.getIsGameOver()).toBe(false);
    });

    it("should stores guess in player history", () => {
      game.guess("user3", "MANGO");
      const history = (game as any).playerHistories.get("user3");
      expect(history.guesses.length).toBe(1);
      expect(history.guesses[0].guess).toBe("MANGO");
    });

    it("should throws error for invalid guess format or not in word list", () => {
      expect(() => game.guess("user4", "INVALID")).toThrow();
      expect(() => game.guess("user4", "12345")).toThrow();
      expect(() => game.guess("user4", "")).toThrow();
      expect(() => game.guess("user4", "U*^&&%^*")).toThrow();
    });

    it("should throws error if game is already over", () => {
      game.setAnswer("APPLE");
      game.setIsGameOver(true);
      expect(() => game.guess("user5", "APPLE")).toThrow();
    });

    it("should throw error if no remaining rounds left", () => {
      const userId = "user1";
      game.setAnswer(config.wordList[0]);
      const maxRounds = config.maxRounds;
      Array.from({length: maxRounds}).forEach(() => {
        game.guess(userId, config.wordList[1]);
      });
      const playerHistory = game.getPlayerHistory(userId);
      expect(playerHistory?.getGuessCount()).toBe(maxRounds);
      expect(playerHistory?.hasRoundsLeft).toBe(false);
      expect(() => game.guess(userId, config.wordList[0])).toThrow();
    });
  });

  describe("restartGame", () => {
    it("should clears player histories and resets game state", () => {
      game.guess("user1", "APPLE");
      game.restartGame();
      expect((game as any).playerHistories.size).toBe(0);
      expect(game.getIsGameOver()).toBe(false);
      expect(game.getGameOverAt()).toBeNull();
      expect(game.getFirstWinnerId()).toBeNull();
      expect(config.wordList).toContain(game.getAnswer());
    });
  });
});
