import express from "express";
import bodyParser from "body-parser";
import {createServer} from "http";
import {initWebSocketServer} from "./websocket";
import gameRoutes from "./routes/gameRoutes";
import scoreboardRoutes from "./routes/scoreboardRoutes";

const app = express();
const server = createServer(app);

export const wsServer = initWebSocketServer(server);

app.use(bodyParser.json());
app.use(gameRoutes);
app.use(scoreboardRoutes);

const PORT = 8080;
server.listen(PORT, () => console.log(`Wordle server running on port ${PORT}`));
