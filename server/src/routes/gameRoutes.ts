import {Router} from "express";
import {checkUserIdHeader} from "../middlewares/auth";
import {GameController} from "../controllers/gameController";
import {GameService} from "../services/gameService";

const gameController = new GameController(new GameService());
const router = Router();

router.post("/guess", checkUserIdHeader, gameController.guessHandler);
router.get("/status", checkUserIdHeader, gameController.statusHandler);

export default router;
