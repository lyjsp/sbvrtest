import {Router} from "express";
import {checkUserIdHeader} from "../middlewares/auth";
import {ScoreboardController} from "../controllers/scoreboardController";
import {ScoreboardService} from "../services/ScoreboardService";

const scoreboardController = new ScoreboardController(new ScoreboardService());
const router = Router();

router.get(
  "/scoreboard",
  checkUserIdHeader,
  scoreboardController.scoreboardHandler
);
router.get(
  "/user/score",
  checkUserIdHeader,
  scoreboardController.userScoreHandler
);

export default router;
