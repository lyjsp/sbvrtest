import {IncomingMessage, Server} from "http";
import {WebSocketServer, WebSocket} from "ws";
import {parse} from "url";
import {PlayerEvent} from "../../common/src/game/types";
import {WebsocketMessageType} from "../../common/src/game/enums";
import {AbstractWordleGame} from "./game/wordle/abstractWordleGame";

export class WordleWebSocketServer {
  private wsServer: WebSocketServer;
  private restartTimeout: NodeJS.Timeout | null = null;
  private countdown: number = 0;

  constructor(server: Server) {
    this.wsServer = new WebSocketServer({noServer: true});
    this.setupUpgrade(server);
    this.setupConnection();
  }

  private authenticate(request: IncomingMessage): boolean {
    const {playerId} = parse(request.url!, true).query;
    return !!playerId;
  }

  private setupUpgrade(server: Server) {
    server.on("upgrade", (request, socket, head) => {
      const authed = this.authenticate(request);

      if (!authed) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      this.wsServer.handleUpgrade(request, socket, head, (connection) => {
        this.wsServer.emit("connection", connection, request);
      });
    });
  }

  private setupConnection() {
    this.wsServer.on(
      "connection",
      (connection: WebSocket, request: IncomingMessage) => {
        const {playerId, playerName} = parse(request.url!, true).query;
        console.log(
          `WebSocket connection established${
            playerId ? ` for playerId: ${playerId}` : ""
          } ${playerName ? `with playerName: ${playerName}` : ""}`
        );

        connection.on("close", () => {
          console.log(
            `WebSocket connection closed${
              playerId ? ` for playerId: ${playerId}` : ""
            } ${playerName ? `with playerName: ${playerName}` : ""}`
          );
        });
      }
    );
  }

  public broadcast(event: PlayerEvent) {
    const msg = JSON.stringify(event);
    this.wsServer.clients.forEach((client) => {
      if (client.readyState === 1) client.send(msg);
    });
  }

  public startRestartCountdown(game: AbstractWordleGame) {
    this.countdown = 10;
    this.broadcast({
      type: WebsocketMessageType.Countdown,
      countdown: this.countdown,
    });
    this.restartTimeout = setInterval(() => {
      this.countdown--;
      this.broadcast({
        type: WebsocketMessageType.Countdown,
        countdown: this.countdown,
      });
      if (this.countdown <= 0) {
        clearInterval(this.restartTimeout!);
        this.restartTimeout = null;
        game.restartGame();
        this.broadcast({type: WebsocketMessageType.Restart});
      }
    }, 1000);
  }
}

export let wsInstance: WordleWebSocketServer | null = null;

export function initWebSocketServer(server: Server): WordleWebSocketServer {
  if (!wsInstance) {
    wsInstance = new WordleWebSocketServer(server);
  }
  return wsInstance;
}
