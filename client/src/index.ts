import * as readline from "readline";
import {axiosInstance} from "./services/axios";
import {ResponseDto} from "@common/dto/response.dto";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function checkStatus(): Promise<ResponseDto> {
  try {
    const res = await axiosInstance.get("/status");
    console.log("Game Status:", res.data);
    return res.data;
  } catch (err: any) {
    console.error(
      "Error fetching game status:",
      err?.response?.data?.error || err.message || err
    );
    throw err;
  }
}

function promptGuess(): Promise<string> {
  return new Promise((resolve) => {
    rl.question("Enter your guess (or type 'exit' to quit): ", (input) => {
      resolve(input.trim());
    });
  });
}

async function play() {
  let gameOver = false;
  const {gameOver: previousGameOver} = await checkStatus();
  if (previousGameOver) {
    console.log("Game is already over. Restarting...");
    await axiosInstance.put("/restart");
  } else {
    console.log("Game is in progress. You can continue guessing.");
  }
  while (!gameOver) {
    const guess = await promptGuess();

    if (guess.toLowerCase() === "exit" || guess.toLowerCase() === "quit") {
      console.log("Exiting game. Goodbye!");
      rl.close();
      process.exit(0);
    }

    if (!guess) {
      console.log("Please enter a non-empty guess.");
      continue;
    }

    try {
      const res = await axiosInstance.post("/guess", {guess});
      console.log("Guess:", guess, "=>", res.data);
      if (res.data.gameOver) {
        gameOver = true;
        rl.close();
        console.log(`Game Over! You ${res.data.win ? "won" : "lost"}!`);
      }
    } catch (err: any) {
      console.error(err?.response?.data?.error || err.message || err);
    }
  }
}

play();
