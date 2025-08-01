import {WordleGame} from "./wordle";
import {Scoreboard} from "./scoreboard";
import {ConfigService} from "../services/configService";

const configService = ConfigService.getInstance();

const maxRounds = Number(configService.get("WORDLE_MAX_ROUNDS")) || 6;
const wordList = configService.get("WORDLE_WORD_LIST")
  ? configService
      .get("WORDLE_WORD_LIST")
      .split(",")
      .map((word: string) => word.trim().toUpperCase())
  : [
      "HELLO",
      "WORLD",
      "QUITE",
      "FANCY",
      "FRESH",
      "PANIC",
      "CRAZY",
      "BUGGY",
      "SCARE",
    ];

export const scoreboard = new Scoreboard();
export const game = new WordleGame({
  maxRounds,
  wordList,
});
