import {Heap} from "heap-js";
import {PlayerScore} from "../../../common/src/game/types";

export class Scoreboard {
  private scoreMap: Map<string, PlayerScore> = new Map();

  getOrInitiatePlayer(playerId: string, playerName: string): PlayerScore {
    if (!this.scoreMap.has(playerId)) {
      this.scoreMap.set(playerId, {
        id: playerId,
        name: playerName,
        score: 0,
        rounds: 0,
        accuracy: 0,
      });
    }
    return this.scoreMap.get(playerId)!;
  }

  addScore(playerId: string, playerName: string): void {
    const existing = this.getOrInitiatePlayer(playerId, playerName);
    existing.score += 1;
    existing.accuracy = this.calculateAccuracy(existing.score, existing.rounds);
  }

  addRound(playerId: string, playerName: string): void {
    const existing = this.getOrInitiatePlayer(playerId, playerName);
    existing.rounds += 1;
    existing.accuracy = this.calculateAccuracy(existing.score, existing.rounds);
  }

  getScoreboardByPlayer(playerId: string): PlayerScore | undefined {
    return this.scoreMap.get(playerId);
  }

  getTopScores(limit: number = 10): PlayerScore[] {
    // Use a min-heap: lowest score at the top
    const heap = new Heap<PlayerScore>((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      return a.name.localeCompare(b.name);
    });

    for (const playerScore of this.scoreMap.values()) {
      heap.push(playerScore);
      // If heap exceeds limit, remove the lowest score
      if (heap.size() > limit) {
        heap.pop();
      }
    }

    // Sort descending for display
    return heap.toArray().sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Calculate accuracy as a percentage.
   */
  calculateAccuracy(totalScore: number, totalRounds: number): number {
    if (totalRounds === 0) return 0;
    return Math.round((totalScore / totalRounds) * 100);
  }

  reset(): void {
    this.scoreMap.clear();
  }
}
