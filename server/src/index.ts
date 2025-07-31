import express from "express";
import bodyParser from "body-parser";
import {WordleGame} from "./game/wordle";
import {ResponseDto} from "../../common/src/dto/response.dto";

const app = express();
app.use(bodyParser.json());

const game = new WordleGame({
  maxRounds: 6,
  wordList: ["apple", "grape", "mango", "peach", "melon"],
});

app.post("/guess", (req, res) => {
  const {guess} = req.body;

  // Input validation
  if (!guess || typeof guess !== "string") {
    return res.status(400).json({error: "Guess must be a string."});
  }

  try {
    const result = game.guess(guess);

    const response: ResponseDto = {
      guess: result.guess,
      results: game.getHistory(),
      maxRounds: game.getMaxRounds(),
      remainingRounds: game.getRemainingRounds(),
      gameOver: game.isGameOver(),
      win: game.isWin(),
      ...(game.isGameOver() && {answer: game.getAnswer()}), // reveal answer on game over
    };

    res.json(response);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
});

app.put("/restart", (_req, res) => {
  game.restartGame();
  res.json({message: "Game restarted!"});
});

app.get("/status", (_req, res) => {
  const response: ResponseDto = {
    guess: "",
    results: game.getHistory(),
    maxRounds: game.getMaxRounds(),
    remainingRounds: game.getRemainingRounds(),
    gameOver: game.isGameOver(),
    win: game.isWin(),
    ...(game.isGameOver() && {answer: game.getAnswer()}), // reveal answer on game over
  };
  res.json(response);
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Wordle server running on port ${PORT}`));
