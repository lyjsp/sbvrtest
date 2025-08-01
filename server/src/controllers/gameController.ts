import {Request, Response} from "express";
import {GameService} from "../services/gameService";

export class GameController {
  private service: GameService;

  constructor(service: GameService) {
    this.service = service;
  }

  public guessHandler = (req: Request, res: Response) => {
    const userId = req.user?.id || "anonymous";
    const {player, guess} = req.body;

    try {
      const response = this.service.handleGuess(userId, player, guess);
      res.json(response);
    } catch (err: any) {
      res.status(400).json({error: err.message});
    }
  };

  public statusHandler = (req: Request, res: Response) => {
    const userId = req.user?.id || "anonymous";
    try {
      const response = this.service.getStatus(userId);
      res.json(response);
    } catch (err: any) {
      res.status(400).json({error: err.message});
    }
  };
}
