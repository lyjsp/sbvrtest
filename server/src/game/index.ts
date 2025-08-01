import {WordleGame} from "./wordle";
import {Scoreboard} from "./scoreboard";

export const scoreboard = new Scoreboard();
export const game = new WordleGame({
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
