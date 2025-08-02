import {AbsurdleGame} from "./absurdleGame";
import {LetterResult} from "../../../../common/src/game/enums";
import {WordleConfig, GuessResult} from "../../../../common/src/game/types";
import {AbsurdlePlayerHistory} from "../playerHistory/absurdlePlayerHistory";
import {AbsurdleCandidateResult} from "../../common/types/absurdle";

const mockWordList = ["APPLE", "BANJO", "CRANE"];
const config: WordleConfig = {
  maxRounds: 6,
  wordList: mockWordList,
};

describe("AbsurdleGame", () => {
  let game: AbsurdleGame;

  beforeEach(() => {
    game = new AbsurdleGame(config);
    game.resetPlayerHistories();
    game.setIsGameOver(false);
    game.setGameOverAt(null);
    game.setFirstWinnerId(null);
  });

  describe("calculateResult", () => {
    it("returns all Miss when no letters match", () => {
      const result = game.calculateResult("AAAAA", "CCCCC");
      expect(result).toEqual([
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
      ]);
    });

    it("returns all Hit when guess matches answer", () => {
      const result = game.calculateResult("APPLE", "APPLE");
      expect(result).toEqual([
        LetterResult.Hit,
        LetterResult.Hit,
        LetterResult.Hit,
        LetterResult.Hit,
        LetterResult.Hit,
      ]);
    });

    it("returns Present for correct letters in wrong positions", () => {
      const result = game.calculateResult("AAAAZ", "ZBBBB");
      expect(result).toEqual([
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Present, // Z is present
      ]);
    });
  });

  describe("guess", () => {
    it("creates player history and returns GuessResult", () => {
      const result = game.guess("user1", "APPLE");
      expect(result.guess).toBe("APPLE");
      expect(Array.isArray(result.results)).toBe(true);
      expect(typeof result.isWon).toBe("boolean");
    });

    it("throws error if player has no rounds left", () => {
      // @ts-ignore
      game.playerHistories.set("user2", {
        hasRoundsLeft: false,
        getCandidateWords: jest.fn(() => mockWordList),
      });
      expect(() => game.guess("user2", "APPLE")).toThrow(
        "Player has no more rounds left."
      );
    });

    it("throws error if no candidates left after guess", () => {
      // @ts-ignore
      game.playerHistories.set("user3", {
        hasRoundsLeft: true,
        getCandidateWords: jest.fn(() => []),
        setCandidateWords: jest.fn(),
        addGuess: jest.fn(),
      });
      expect(() => game.guess("user3", "APPLE")).toThrow(
        "No candidates left after guess."
      );
    });

    it("sets firstWinnerId and calls handleGameOver when a player won", () => {
      const spy = jest.spyOn(game, "handleGameOver");
      game["playerHistories"].set(
        "winner",
        new AbsurdlePlayerHistory(config.maxRounds, ["APPLE"]) // Only one candidate to ensure win
      );
      const result = game.guess("winner", "APPLE");
      expect(result.isWon).toBe(true);
      expect(game.getFirstWinnerId()).toBe("winner");
      expect(spy).toHaveBeenCalled();
    });

    it("should pass below losing example", () => {
      game = new AbsurdleGame({
        maxRounds: 6,
        wordList: [
          "HELLO",
          "WORLD",
          "QUITE",
          "FANCY",
          "FRESH",
          "PANIC",
          "CRAZY",
          "BUGGY",
        ],
      });
      const userId = "user1";

      // First input with HELLO
      // Expect remaining candidates: [FANCY, PANIC, CRAZY, BUGGY]
      // Expect output result to be [Miss, Miss, Miss, Miss, Miss]
      const result1 = game.guess(userId, "HELLO");
      expect(
        (
          game.getPlayerHistory(userId) as AbsurdlePlayerHistory
        )?.getCandidateWords()
      ).toEqual(["FANCY", "PANIC", "CRAZY", "BUGGY"]);
      expect(result1.results).toEqual([
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
      ]);
      expect(result1.isWon).toBe(false);

      // Second input with WORLD
      // Expect remaining candidates: [FANCY, PANIC, BUGGY]
      // Expect output result to be [Miss, Miss, Miss, Miss, Miss]
      const result2 = game.guess(userId, "WORLD");
      expect(
        (
          game.getPlayerHistory(userId) as AbsurdlePlayerHistory
        )?.getCandidateWords()
      ).toEqual(["FANCY", "PANIC", "BUGGY"]);
      expect(result2.results).toEqual([
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
      ]);
      expect(result2.isWon).toBe(false);

      // Third input with FRESH
      // Expect remaining candidates: [PANIC, BUGGY]
      // Expect output result to be [Miss, Miss, Miss, Miss, Miss]
      const result3 = game.guess(userId, "FRESH");
      expect(
        (
          game.getPlayerHistory(userId) as AbsurdlePlayerHistory
        )?.getCandidateWords()
      ).toEqual(["PANIC", "BUGGY"]);
      expect(result3.results).toEqual([
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
      ]);
      expect(result3.isWon).toBe(false);

      // Fourth input with CRAZY,
      // Expect remaining candidates: [PANIC]
      // Expect output result to be [Present, Miss, Present, Miss, Miss]
      const result4 = game.guess(userId, "CRAZY");
      expect(
        (
          game.getPlayerHistory(userId) as AbsurdlePlayerHistory
        )?.getCandidateWords()
      ).toEqual(["PANIC"]);
      expect(result4.results).toEqual([
        LetterResult.Present,
        LetterResult.Miss,
        LetterResult.Present,
        LetterResult.Miss,
        LetterResult.Miss,
      ]);
      expect(result4.isWon).toBe(false);

      // Fifth input with QUITE
      // Expect remaining candidates: [PANIC]
      // Expect output result to be [Miss, Miss, Present, Miss, Miss]
      const result5 = game.guess(userId, "QUITE");
      expect(
        (
          game.getPlayerHistory(userId) as AbsurdlePlayerHistory
        )?.getCandidateWords()
      ).toEqual(["PANIC"]);
      expect(result5.results).toEqual([
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Present,
        LetterResult.Miss,
        LetterResult.Miss,
      ]);
      expect(result5.isWon).toBe(false);

      // Sixth input with FANCY
      // Expect remaining candidates: [PANIC]
      // Expect output result to be [Miss, Hit, Hit, Present, Miss]
      const result6 = game.guess(userId, "FANCY");
      expect(
        (
          game.getPlayerHistory(userId) as AbsurdlePlayerHistory
        )?.getCandidateWords()
      ).toEqual(["PANIC"]);
      expect(result6.results).toEqual([
        LetterResult.Miss,
        LetterResult.Hit,
        LetterResult.Hit,
        LetterResult.Present,
        LetterResult.Miss,
      ]);
      expect(result6.isWon).toBe(false);
    });

    it("should pass below winning example", () => {
      game = new AbsurdleGame({
        maxRounds: 6,
        wordList: [
          "HELLO",
          "WORLD",
          "QUITE",
          "FANCY",
          "FRESH",
          "PANIC",
          "CRAZY",
          "BUGGY",
          "SCARE",
        ],
      });
      const userId = "user1";

      // First input with BUGGY
      // Expect remaining candidates: [HELLO, WORLD, FRESH, PANIC, SCARE]
      // Expect output result to be [Miss, Miss, Miss, Miss, Miss]
      const result1 = game.guess(userId, "BUGGY");
      expect(
        (
          game.getPlayerHistory(userId) as AbsurdlePlayerHistory
        )?.getCandidateWords()
      ).toEqual(["HELLO", "WORLD", "FRESH", "PANIC", "SCARE"]);
      expect(result1.results).toEqual([
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
      ]);
      expect(result1.isWon).toBe(false);

      // Second input with SCARE
      // Expect remaining candidates: either [HELLO] or [WORLD]
      // Expect output result to be [Miss, Miss, Miss, Present, Miss]
      const result2 = game.guess(userId, "SCARE");
      expect(
        (
          game.getPlayerHistory(userId) as AbsurdlePlayerHistory
        )?.getCandidateWords()?.[0]
      ).toEqual(expect.stringMatching(/HELLO|WORLD/));
      expect(result2.results).toEqual([
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Miss,
        LetterResult.Present,
        LetterResult.Miss,
      ]);
      expect(result2.isWon).toBe(false);

      // Third input with WORLD
      // Expect remaining candidates: either [HELLO] or [WORLD]
      // Expect output result to be [Hit, Hit, Hit, Hit, Hit]

      // Mock method pickRandomCandidateResult to ensure the selected candidate is WORLD
      jest
        .spyOn(AbsurdleGame.prototype as any, "pickRandomCandidateResult")
        .mockImplementation((...args: unknown[]) => {
          const result = args[0] as AbsurdleCandidateResult[];
          const matchedResult = result.find(
            (item) => item.candidate === "WORLD"
          );
          if (matchedResult) {
            return matchedResult;
          }
          // Fallback to the first candidate if WORLD is not found
          return result[0];
        });

      const result3 = game.guess(userId, "WORLD");
      expect(
        (
          game.getPlayerHistory(userId) as AbsurdlePlayerHistory
        )?.getCandidateWords()
      ).toEqual(["WORLD"]);
      expect(result3.results).toEqual([
        LetterResult.Hit,
        LetterResult.Hit,
        LetterResult.Hit,
        LetterResult.Hit,
        LetterResult.Hit,
      ]);
      expect(result3.isWon).toBe(true);
    });
  });

  describe("getRemainingCandidates", () => {
    it("returns candidates with lowest hit and present", () => {
      const playerHistory = new AbsurdlePlayerHistory(config.maxRounds, [
        "APPLE",
        "BANJO",
        "CRANE",
      ]);
      const candidates = game.getRemainingCandidates(
        "APPLE",
        playerHistory as any
      );
      expect(Array.isArray(candidates)).toBe(true);
      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0]).toHaveProperty("candidate");
      expect(candidates[0]).toHaveProperty("result");
      expect(candidates[0]).toHaveProperty("numberOfHit");
    });
  });

  describe("restartGame", () => {
    it("clears player histories and resets game state", () => {
      // @ts-ignore
      game.playerHistories.set("user", {});
      game.setIsGameOver(true);
      game.setGameOverAt(new Date());
      game.setFirstWinnerId("user");
      game.restartGame();
      expect(game.getAllPlayerHistories().size).toBe(0);
      expect(game.getIsGameOver()).toBe(false);
      expect(game.getGameOverAt()).toBeNull();
      expect(game.getFirstWinnerId()).toBeNull();
    });
  });
});
