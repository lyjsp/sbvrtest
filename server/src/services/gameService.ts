import {ResponseDto} from "../../../common/src/dto/response.dto";
import {
  LetterResult,
  WebsocketMessageType,
} from "../../../common/src/game/enums";
import {GuessResult} from "../../../common/src/game/types";
import {game, scoreboard} from "../game";
import {wsInstance} from "../websocket";

export class GameService {
  /**
   * Get the current status for a player.
   */
  public getStatus(userId: string): ResponseDto {
    const playerHistory = game.getPlayerHistory(userId);

    if (playerHistory) {
      return {
        guess: "",
        results: undefined,
        guessHistory: playerHistory.getGuessResults(),
        maxRounds: game.getMaxRounds(),
        currentRound: playerHistory.getCurrentRound(),
        remainingRounds: playerHistory.getRemainingRounds(),
        gameOver: game.getIsGameOver(),
        win: playerHistory.isWon(),
        wordLength: game.getWordLength(),
        ...(game.getIsGameOver() && {answer: game.getAnswer()}),
      };
    } else {
      return {
        guess: "",
        results: undefined,
        guessHistory: [],
        maxRounds: game.getMaxRounds(),
        currentRound: 1,
        remainingRounds: game.getMaxRounds(),
        gameOver: game.getIsGameOver(),
        win: false,
        wordLength: game.getWordLength(),
        ...(game.getIsGameOver() && {answer: game.getAnswer()}),
      };
    }
  }

  public handleGuess(
    userId: string,
    player: string,
    guess: string
  ): ResponseDto {
    this.validateGameState(guess);
    this.validatePlayerRounds(userId);
    const result = game.guess(userId, guess);
    this.updateScoreboard(userId, player);
    this.broadcastPoints(userId, player, result);

    if (result.isWon) {
      this.handleWin(userId, player, guess);
    }

    return this.buildResponse(userId, result);
  }

  private validateGameState(guess: string): void {
    if (game.getIsGameOver()) {
      throw new Error("Game is already over.");
    }
    if (!guess || typeof guess !== "string") {
      throw new Error("Guess must be a string.");
    }
  }

  private validatePlayerRounds(userId: string): void {
    const userHistory = game.getPlayerHistory(userId);
    const playerRemainingRounds = userHistory
      ? userHistory.getRemainingRounds()
      : game.getMaxRounds();
    if (playerRemainingRounds <= 0) {
      throw new Error("You have no remaining rounds left.");
    }
  }

  private updateScoreboard(userId: string, player: string): void {
    scoreboard.addRound(userId, player);
  }

  private broadcastPoints(
    userId: string,
    player: string,
    result: GuessResult
  ): void {
    const hit = result.results.filter((r) => r === LetterResult.Hit).length;
    const present = result.results.filter(
      (r) => r === LetterResult.Present
    ).length;
    if (hit > 0 || present > 0) {
      wsInstance?.broadcast({
        type: WebsocketMessageType.Points,
        playerId: userId,
        player,
        points: {hit, present},
      });
    }
  }

  private handleWin(userId: string, player: string, guess: string): void {
    scoreboard.addScore(userId, player);
    wsInstance?.broadcast({
      type: WebsocketMessageType.Win,
      playerId: userId,
      player,
      guess,
      answer: game.getAnswer(),
    });
    wsInstance?.startRestartCountdown(game);
  }

  private buildResponse(userId: string, result: GuessResult): ResponseDto {
    const playerHistory = game.getPlayerHistory(userId);
    if (!playerHistory) {
      throw new Error("Player history not found.");
    }
    return {
      guess: result.guess,
      results: result.results,
      guessHistory: playerHistory.getGuessResults(),
      currentRound: playerHistory.getCurrentRound(),
      maxRounds: game.getMaxRounds(),
      remainingRounds: playerHistory.getRemainingRounds(),
      gameOver: game.getIsGameOver(),
      win: playerHistory.isWon(),
      wordLength: game.getWordLength(),
      ...(game.getIsGameOver() && {answer: game.getAnswer()}),
    };
  }
}
