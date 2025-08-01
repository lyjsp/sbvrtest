import {Request, Response} from "express";
import {ScoreboardService} from "../services/ScoreboardService";

export class ScoreboardController {
  private service: ScoreboardService;

  constructor(service: ScoreboardService) {
    this.service = service;
  }

  public scoreboardHandler = (_req: Request, res: Response) => {
    const scores = this.service.getTopScores(5);
    res.json(scores);
  };

  public userScoreHandler = (req: Request, res: Response) => {
    const userId = req.user?.id || "anonymous";
    const scores = this.service.getUserScore(userId);
    if (!scores)
      return res.status(404).json({error: "No scores found for this player."});
    res.json(scores);
  };
}
