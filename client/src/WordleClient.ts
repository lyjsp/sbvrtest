import {axiosInstance} from "./services/axios";
import {USER_ID_HEADER} from "../../common/src/constants";
import {PlayerScore} from "../../common/src/game/types";
import {PromptService} from "./services/PromptService";
import {PlayerService} from "./services/PlayerService";
import {WebSocketService} from "./services/WebSocketService";
import {ResponseDto} from "../../common/src/dto/response.dto";

export class WordleClient {
  private promptService = new PromptService();
  private playerService = new PlayerService();
  private wsService = new WebSocketService();
  private playerName = "";
  private isPlaying = false;

  constructor() {
    axiosInstance.defaults.headers.common[USER_ID_HEADER] =
      this.playerService.getPlayerId();
  }

  private async promptName(): Promise<string> {
    if (this.playerName) return this.playerName;
    this.playerName = await this.promptService.prompt(
      "Enter your player name:\n"
    );
    return this.playerName;
  }

  private async promptGuess(): Promise<string> {
    return this.promptService.prompt(
      "Enter your guess (or type 'exit' or 'quit' to quit):\n"
    );
  }

  private async getGameStatus() {
    try {
      const res = await axiosInstance.get("/status");
      return res.data;
    } catch (err: any) {
      console.error(
        "Error fetching game status:",
        err?.response?.data?.error || err.message || err
      );
    }
  }

  private async showGameStatus() {
    try {
      const status: ResponseDto = await this.getGameStatus();
      console.log("\n--- Game Status ---");
      console.log(`Guess History:`);
      status.guessHistory.forEach((history, i) => {
        console.log(
          `${i + 1}. Guess: ${history.guess}, Results: ${history.results.join(
            ", "
          )}`
        );
      });
      console.log(`Max Rounds: ${status.maxRounds}`);
      console.log(`Remaining Rounds: ${status.remainingRounds}`);
    } catch (err: any) {
      console.error(
        "Error showing game status:",
        err?.response?.data?.error || err.message || err
      );
    }
  }

  private async playGame() {
    const status = await this.getGameStatus();

    if (status.remainingRounds <= 0) {
      console.log("No remaining rounds. Please wait for next game.");
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;

    while (this.isPlaying) {
      const guess = await this.promptGuess();
      if (guess.toLowerCase() === "exit" || guess.toLowerCase() === "quit") {
        this.isPlaying = false;
        break;
      }
      if (!guess) {
        console.log("Please enter a non-empty guess.");
        continue;
      }
      try {
        const res = await axiosInstance.post("/guess", {
          player: this.playerName,
          guess,
        });

        // Enhanced log for player
        console.log(
          `Remaining Rounds: ${res.data.remainingRounds}/${res.data.maxRounds}`
        );
        console.log(`
- O means Hit (letter is in the target word and in the correct spot)
- ? means Present (letter is in the target word, but not in the correct spot)
- _ means Miss (letter is not in the target word)
          `);
        console.log(`Your Guesses:`);
        res.data.guessHistory.forEach((item: any, idx: number) => {
          console.log(
            `  ${idx + 1}. "${item.guess}" => ${item.results.join(" ")}${
              item.isWon ? " (WIN)" : ""
            }`
          );
        });
        if (res.data.gameOver) {
          console.log(`Game Over! You ${res.data.win ? "won" : "lost"}!`);
        }

        if (res.data.remainingRounds <= 0) {
          console.log(`Game Over! You ${res.data.win ? "won" : "lost"}!`);
          this.isPlaying = false;
        }
      } catch (err: any) {
        console.error(err?.response?.data?.error || err.message || err);
      }
    }
  }

  private async showScoreBoard() {
    try {
      const res = await axiosInstance.get("/scoreboard");
      const result: PlayerScore[] = res.data;
      if (res.data) {
        console.log("\n--- Score Board (Top 5) ---");
        result.forEach((item) => {
          console.log(
            `${item.name}: ${item.score} point(s) - ${item.rounds} round(s) played - Accuracy: ${item.accuracy}%`
          );
        });
      } else {
        console.log("No score board available.");
      }
    } catch (err: any) {
      console.error(
        "Error fetching score board:",
        err?.response?.data?.error || err.message || err
      );
    }
  }

  private async showMyScore() {
    try {
      const res = await axiosInstance.get("/user/score");
      const result: PlayerScore = res.data;
      if (res.data) {
        console.log("\n--- My Score ---");
        console.log(
          `Your score: ${result.score} point(s) - ${result.rounds} round(s) played - Accuracy: ${result.accuracy}%`
        );
      } else {
        console.log("No score available.");
      }
    } catch (err: any) {
      console.error(
        "Error fetching my score:",
        err?.response?.data?.error || err.message || err
      );
    }
  }

  private async showMyResults() {
    try {
      const res = await axiosInstance.get("/status");
      console.log("res", res);
      if (res.data.players) {
        const result = res.data.players.find(
          (p: any) => p.name === this.playerName
        );
        if (result) {
          console.log("\n--- My Game Results ---");
          console.log(`Guesses: ${result.guesses.join(", ")}`);
          if (result.win) {
            console.log("You are the WINNER!");
          }
        } else {
          console.log("You have not played yet.");
        }
      }
    } catch (err: any) {
      console.error(
        "Error fetching results:",
        err?.response?.data?.error || err.message || err
      );
    }
  }

  private setupWebSocket() {
    this.wsService.connect(
      `ws://localhost:8080?playerId=${this.playerService.getPlayerId()}&playerName=${
        this.playerName
      }`,
      {
        type: "handshake",
        playerId: this.playerService.getPlayerId(),
        playerName: this.playerName,
      },
      {
        onPoints: (msg) => {
          if (
            msg.playerId !== this.playerService.getPlayerId() &&
            this.isPlaying
          ) {
            console.log(
              `Player ${msg.player} got ${msg.points.present} present and ${msg.points.hit} hit.\n`
            );
          }
        },
        onWin: (msg) => {
          if (
            msg.playerId === this.playerService.getPlayerId() &&
            this.isPlaying
          ) {
            console.log(`🎉 You win! The answer was "${msg.answer}".\n`);
          } else {
            console.log(
              `🎉 Player ${msg.player} wins with "${msg.guess}"! The answer was "${msg.answer}".\n`
            );
          }
        },
        onCountdown: (msg) => {
          if (msg.countdown > 0 && this.isPlaying) {
            console.log(`Game restarts in ${msg.countdown} seconds...\n`);
          }
        },
        onRestart: () => {
          if (this.isPlaying) {
            console.log("Game restarted! You can guess again.\n");
            this.playGame();
          } else {
            console.log("Game restarted! You can start a new game.\n");
            this.isPlaying = false;
          }
        },
        onClose: () => {
          console.log("Disconnected from server.\n");
          this.promptService.close();
          process.exit(0);
        },
      }
    );
  }

  public async start() {
    await this.promptName();
    this.setupWebSocket();

    while (true) {
      this.promptService.showMenu();
      const choice = await this.promptService.prompt("Select an option:\n");
      switch (choice) {
        case "1":
          await this.playGame();
          break;
        case "2":
          await this.showGameStatus();
          break;
        case "3":
          await this.showScoreBoard();
          break;
        case "4":
          await this.showMyScore();
          break;
        case "5":
          await this.showMyResults();
          break;
        case "0":
          console.log("Goodbye!");
          this.promptService.close();
          process.exit(0);
        default:
          console.log("Invalid option. Please select 0-5.");
      }
    }
  }
}
