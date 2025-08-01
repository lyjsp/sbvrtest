import WebSocket from "ws";
import {WebsocketMessageType} from "../../../common/src/game/enums";

export type WebSocketHandlers = {
  onPoints?: (msg: any) => void;
  onWin?: (msg: any) => void;
  onCountdown?: (msg: any) => void;
  onRestart?: () => void;
  onClose?: () => void;
};

export class WebSocketService {
  private ws?: WebSocket;

  connect(url: string, handshake: object, handlers: WebSocketHandlers) {
    this.ws = new WebSocket(url);
    this.ws.on("open", () => {
      this.ws!.send(JSON.stringify(handshake));
    });
    this.ws.on("message", (data) => {
      const msg = JSON.parse(data.toString());
      switch (msg.type) {
        case WebsocketMessageType.Points:
          handlers.onPoints?.(msg);
          break;
        case WebsocketMessageType.Win:
          handlers.onWin?.(msg);
          break;
        case WebsocketMessageType.Countdown:
          handlers.onCountdown?.(msg);
          break;
        case WebsocketMessageType.Restart:
          handlers.onRestart?.();
          break;
        default:
          break;
      }
    });
    this.ws.on("close", () => {
      handlers.onClose?.();
    });
  }

  close() {
    this.ws?.close();
  }
}
