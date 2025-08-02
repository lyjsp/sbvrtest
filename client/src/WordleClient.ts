import {axiosInstance} from "./services/axios";
import {USER_ID_HEADER} from "../../common/src/constants";
import {GuessResult, PlayerScore} from "../../common/src/game/types";
import {PromptService} from "./services/PromptService";
import {PlayerService} from "./services/PlayerService";
import {WebSocketService} from "./services/WebSocketService";
import {ResponseDto} from "../../common/src/dto/response.dto";
import {MenuOption} from "./common/types/prompt";

const menuOptions: MenuOption[] = [
  {command: "1", description: "Play"},
  {command: "2", description: "Game status"},
  {command: "3", description: "See score board"},
  {command: "4", description: "See my score"},
  {command: "0", description: "Exit"},
];

export class WordleClient {
  private promptService;
  private playerService;
  private wsService;
  private playerName;
  private isPlaying;

  constructor() {
    this.promptService = new PromptService(menuOptions);
    this.playerService = new PlayerService();
    this.wsService = new WebSocketService();
    this.playerName = "";
    this.isPlaying = false;
    axiosInstance.defaults.headers.common[USER_ID_HEADER] =
      this.playerService.getPlayerId();
  }

  private async promptName(): Promise<string> {
    if (this.playerName) return this.playerName;
    const input = await this.promptService.prompt("Enter your player name:\n");
    if (!input) {
      console.log("Player name cannot be empty. Please try again.");
      return this.promptName();
    }
    this.playerName = input;
    return this.playerName;
  }

  private async promptGuess(numberOfLetters?: number): Promise<string | null> {
    const input = await this.promptService.prompt(
      `Enter your guess${
        numberOfLetters ? ` (${numberOfLetters} letters)` : ""
      }  :\n`,
      true
    );
    return input;
  }

  private async getGameStatus(): Promise<ResponseDto | undefined> {
    try {
      const res = await axiosInstance.get<ResponseDto>("/status");
      return res.data;
    } catch (err: any) {
      console.error(
        "Error fetching game status:",
        err?.response?.data?.error || err.message || err
      );
      return undefined;
    }
  }

  private async showGameStatus(): Promise<void> {
    const status = await this.getGameStatus();
    if (!status) {
      console.log("Failed to fetch game status.");
      return;
    }
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
  }

  private async playGame(): Promise<void> {
    const status = await this.getGameStatus();

    if (!status) {
      console.log("Failed to fetch game status.");
      return;
    }

    if (status.remainingRounds <= 0) {
      console.log("No remaining rounds. Please wait for next game.");
      this.isPlaying = false;
      return;
    }

    // Show previous game status if available on first enter
    if (!this.isPlaying && status.guessHistory.length > 0) {
      console.log("\n--- Previous Game Status ---");
      console.log(`Guess History:`);
      this.showGameResultDescription();
      this.showGameResults(status.guessHistory);
    }

    this.isPlaying = true;

    while (this.isPlaying) {
      const guess = await this.promptGuess(status.wordLength);

      if (guess === null) {
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

        // Display the game round status
        console.log(
          `Remaining Rounds: ${res.data.remainingRounds}/${res.data.maxRounds}`
        );

        // Show the guess results
        this.showGameResultDescription();
        this.showGameResults(res.data.guessHistory);

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

  private showGameResultDescription(): void {
    console.log(`
- O means Hit (letter is in the target word and in the correct spot)
- ? means Present (letter is in the target word, but not in the correct spot)
- _ means Miss (letter is not in the target word)
          `);
  }

  private showGameResults(guessHistory: GuessResult[]): void {
    console.log(`Your Guesses:`);
    guessHistory.forEach((item: any, idx: number) => {
      console.log(
        `  ${idx + 1}. "${item.guess}" => ${item.results.join(" ")}${
          item.isWon ? " (WIN)" : ""
        }`
      );
    });
  }

  private async showScoreBoard(): Promise<void> {
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

  private async showMyScore(): Promise<void> {
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

  private showGreeting(): void {
    console.log(`
Welcome ${this.playerName}!`);
  }

  private setupWebSocket(playerId: string, playerName: string): void {
    this.wsService.connect(
      `ws://localhost:8080?playerId=${playerId}&playerName=${playerName}`,
      {
        type: "handshake",
        playerId,
        playerName,
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

  public async start(): Promise<void> {
    await this.promptName();

    const playerId = this.playerService.getPlayerId();
    const playerName = this.playerName;
    this.setupWebSocket(playerId, playerName);

    this.showGreeting();

    await this.startMainMenu();
  }

  private async startMainMenu(): Promise<void> {
    while (true) {
      const choice = await this.promptService.showMenu();

      // Show header for the selected menu option
      const matchedChoice = menuOptions.find(
        (option) => option.command === choice
      );
      if (matchedChoice && matchedChoice.description) {
        console.log(`\n=== ${matchedChoice.description} ===`);
      }

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
        case "0":
          console.log("Goodbye!");
          this.promptService.close();
          process.exit(0);
        default:
          console.log("Invalid option. Please select 0-4.");
      }
    }
  }
}
