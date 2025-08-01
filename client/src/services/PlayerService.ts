import {randomUUID} from "crypto";

export class PlayerService {
  private playerId: string;

  constructor() {
    this.playerId = this.loadOrCreatePlayerId();
  }

  private loadOrCreatePlayerId(): string {
    if (this.getPlayerId()) {
      return this.getPlayerId();
    } else {
      const id = randomUUID();
      this.setPlayerId(id);
      return id;
    }
  }

  getPlayerId() {
    return this.playerId;
  }

  setPlayerId(id: string) {
    this.playerId = id;
  }
}
