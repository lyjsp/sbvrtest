import {LetterResult} from "../../../../common/src/game/enums";
import {WordleConfig, GuessResult} from "../../../../common/src/game/types";
import {AbsurdleCandidateResult} from "../../common/types/absurdle";
import {AbstractWordleGame} from "./abstractWordleGame";
import {AbsurdlePlayerHistory} from "../playerHistory/absurdlePlayerHistory";
import {WordleValidator} from "./wordleValidator";
import {WordleUtil} from "./wordleUtil";

export class AbsurdleGame extends AbstractWordleGame {
  protected playerHistories: Map<string, AbsurdlePlayerHistory>;

  constructor(config: WordleConfig) {
    super(config);
  }

  public guess(userId: string, word: string): GuessResult {
    const normalizedGuess = word.toUpperCase();

    WordleValidator.validateGuessFormat(normalizedGuess, this.wordLength);
    WordleValidator.validateGuessInWordList(normalizedGuess, this.wordList);
    WordleValidator.validateGameNotOver(this.isGameOver);

    let playerHistory = this.getOrCreatePlayerHistory(userId);

    this.ensurePlayerHasRoundsLeft(playerHistory);

    let results = Array(this.wordLength).fill(LetterResult.Miss);

    if (this.isSingleCandidate(playerHistory)) {
      results = this.getSingleCandidateResult(normalizedGuess, playerHistory);
    } else {
      results = this.getMultiCandidateResult(normalizedGuess, playerHistory);
    }

    const guessResult: GuessResult = {
      guess: normalizedGuess,
      results,
      isWon: results.every((r) => r === LetterResult.Hit),
    };

    playerHistory.addGuess(guessResult);

    if (guessResult.isWon) {
      this.firstWinnerId = this.firstWinnerId || userId;
      this.handleGameOver();
    }

    return guessResult;
  }

  /**
   * Calculate the result for a guess against a specific answer.
   */
  public calculateResult(guess: string, answer: string): LetterResult[] {
    const result: LetterResult[] = Array(this.wordLength).fill(
      LetterResult.Miss
    );
    const answerArray = answer.split("");
    const guessArray = guess.split("");
    const answerLetterCounts: Record<string, number> = {};

    for (let i = 0; i < this.wordLength; i++) {
      if (guessArray[i] === answerArray[i]) {
        result[i] = LetterResult.Hit;
      } else {
        answerLetterCounts[answerArray[i]] =
          (answerLetterCounts[answerArray[i]] || 0) + 1;
      }
    }

    for (let i = 0; i < this.wordLength; i++) {
      if (result[i] === LetterResult.Hit) continue;
      const guessLetter = guessArray[i];
      if (answerLetterCounts[guessLetter]) {
        result[i] = LetterResult.Present;
        answerLetterCounts[guessLetter]--;
      }
    }

    return result;
  }

  /**
   * Get the remaining candidate words for a given guess.
   * The list of candidates after each round should meet the criteria:
   * - They should have lowest score in the finished round
   * - Remaining candidates should match the result of previous rounds.
   * - If all remaining words has some score, the program will select 1 as the answer
   * The scoring rule will be:
   * 1. More Hit will have higher scores.
   * 2. If the number of Hit is the same, more Present will have higher score.
   * @param guess The guessed word.
   * @param playerHistory The player's history.
   * @returns An array of remaining candidate words.
   */
  public getRemainingCandidates(
    guess: string,
    playerHistory: AbsurdlePlayerHistory
  ): {candidate: string; result: LetterResult[]; numberOfHit: number}[] {
    // Get current candidates
    const candidates = playerHistory.getCandidateWords();

    // Step 1: Group candidates by number of hits
    const hitGroups = this.groupByHit(candidates, guess);

    // Step 2: Find candidates with the lowest number of hits
    const lowestHit = Math.min(...hitGroups.keys());
    const bestHitCandidates = hitGroups.get(lowestHit)?.candidates || [];

    // Step 3a: If there is only 1 candidate return it
    if (bestHitCandidates.length === 1) {
      return bestHitCandidates;
    }
    const candidatesWithoutPresent = bestHitCandidates.filter(
      (c) => c.numberOfPresent === 0
    );

    // Step 3b: If there are candidates without any present letters, filter and return them
    if (candidatesWithoutPresent.length > 0) {
      return candidatesWithoutPresent;
    }

    // Step 4: Group by number of presents
    const presentGroups = this.groupByPresent(bestHitCandidates);

    // Step 5: Find candidates with the lowest number of presents
    const lowestPresent = Math.min(...presentGroups.keys());
    const bestPresentCandidates =
      presentGroups.get(lowestPresent)?.candidates || [];

    // Step 6: If there are multiple candidates, return all of them, pick only one (as they cannot coexist)
    if (bestPresentCandidates.length > 1) {
      return [this.pickRandomCandidateResult(bestPresentCandidates)];
    }

    // Step 7: Return candidates
    return bestPresentCandidates;
  }

  public restartGame(): void {
    this.playerHistories.clear();
    this.isGameOver = false;
    this.gameOverAt = null;
    this.firstWinnerId = null;
  }

  private getOrCreatePlayerHistory(userId: string): AbsurdlePlayerHistory {
    let playerHistory = this.playerHistories.get(userId);
    if (!playerHistory) {
      playerHistory = new AbsurdlePlayerHistory(this.maxRounds, this.wordList);
      this.playerHistories.set(userId, playerHistory);
    }
    return playerHistory;
  }

  private ensurePlayerHasRoundsLeft(playerHistory: AbsurdlePlayerHistory) {
    if (!playerHistory.hasRoundsLeft) {
      throw new Error("Player has no more rounds left.");
    }
  }

  private isSingleCandidate(playerHistory: AbsurdlePlayerHistory): boolean {
    return playerHistory.getCandidateWords().length === 1;
  }

  private getSingleCandidateResult(
    normalizedGuess: string,
    playerHistory: AbsurdlePlayerHistory
  ): LetterResult[] {
    const candidate = playerHistory.getCandidateWords()[0];
    return this.calculateResult(normalizedGuess, candidate);
  }

  private getMultiCandidateResult(
    normalizedGuess: string,
    playerHistory: AbsurdlePlayerHistory
  ): LetterResult[] {
    const remainingCandidates = this.getRemainingCandidates(
      normalizedGuess,
      playerHistory
    );

    if (remainingCandidates.length === 0) {
      throw new Error("No candidates left after guess.");
    }

    playerHistory.setCandidateWords(
      remainingCandidates.map((c) => c.candidate)
    );
    return remainingCandidates[0].result;
  }

  private groupByHit(
    candidates: string[],
    guess: string
  ): Map<number, {candidates: AbsurdleCandidateResult[]}> {
    const map = new Map<number, {candidates: AbsurdleCandidateResult[]}>();
    candidates.forEach((candidate) => {
      const result = this.calculateResult(guess, candidate);
      const {hit: numberOfHit, present: numberOfPresent} =
        WordleUtil.getNumberOfHitAndPresent(result);

      if (!map.has(numberOfHit)) {
        map.set(numberOfHit, {candidates: []});
      }
      map.get(numberOfHit)!.candidates.push({
        candidate,
        result,
        numberOfHit,
        numberOfPresent,
      });
    });
    return map;
  }

  private groupByPresent(
    candidates: AbsurdleCandidateResult[]
  ): Map<number, {candidates: AbsurdleCandidateResult[]}> {
    const map = new Map<number, {candidates: AbsurdleCandidateResult[]}>();
    candidates.forEach((candidate) => {
      if (!map.has(candidate.numberOfPresent)) {
        map.set(candidate.numberOfPresent, {candidates: []});
      }
      map.get(candidate.numberOfPresent)!.candidates.push(candidate);
    });
    return map;
  }

  private pickRandomCandidateResult(
    result: AbsurdleCandidateResult[]
  ): AbsurdleCandidateResult {
    if (result.length === 0) {
      throw new Error("No candidates available to pick from.");
    }
    const randomIndex = Math.floor(Math.random() * result.length);
    return result[randomIndex];
  }
}
