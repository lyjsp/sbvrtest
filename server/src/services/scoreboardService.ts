import {scoreboard} from "../game";

export class ScoreboardService {
  public getTopScores(limit: number = 5) {
    return scoreboard.getTopScores(limit);
  }

  public getUserScore(userId: string) {
    return scoreboard.getScoreboardByPlayer(userId);
  }
}
