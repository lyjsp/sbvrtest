# Server/Client wordle with host cheating that supports multiple-player (TypeScript)

<img width="410" height="439" alt="absurdle-screenshot" src="https://github.com/user-attachments/assets/25fc2480-1927-4867-b52d-b2c2a0f45b75" />

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the server:**

   ```bash
   npm run server
   ```

3. **Start the client in a new terminal:**

   ```bash
   npm run client
   ```

## Test

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the tests:**

   ```bash
   npm run test
   ```

## Multiplayer

- Open multiple terminal windows and run the client in each to play as different users.
- When prompted, enter a player name. Names can be duplicated; each session is tracked separately for each run of the app.
- Each client session is independent; closing and restarting the client generates a new user ID, even with the same name.
- All players play against the same list of words. If all available turns are used, players must wait for the next game to start.
- Game will restart in 10 seconds whenever a player wins (currently there is no way to restart manually)

## How the Game Works

- Each player tries to guess the target word within a limited number of rounds.
- The program prints feedback for each letter in your guess:
  - `O` means **Hit** (letter is in the target word and in the correct spot)
  - `?` means **Present** (letter is in the target word, but not in the correct spot)
  - `_` means **Miss** (letter is not in the target word)
- All players receive live updates when others get hits or presents.
- The server actively avoids letting players win by changing the possible answer to the least hit/present after each guess, making it as difficult as possible.
- To win, a player must narrow down the possible answers so that only one valid word remains, forcing the server to accept it as the answer.
- The answer for each player may be different based on their guesses.
- The fastest player to get the answer wins the game.

## Features & Enhancements

- **Live updates:** See when other players get hit/present letters in real time.
- **Scoreboard in terminal:** View number of wins, number of turns, and accuracy for each player.
- **Configurable game:** Change word list and max rounds via environment variables.
- **Auto countdown and restart:** When a player hits the answer, a countdown starts and a new game with a new word begins automatically for all players.
- **Host cheating logic:** The server does not select an answer at the start, but adapts the answer to make winning as hard as possible.

## Default Configuration

- The default word list is (all words must have the same length, otherwise an error will be thrown when the server starts):
  ```
  HELLO, WORLD, QUITE, FANCY, FRESH, PANIC, CRAZY, BUGGY, SCARE
  ```
- The default max round is: `6`
- To modify these values, set `WORDLE_WORD_LIST` and `WORDLE_MAX_ROUNDS` in `/server/.env`. Example:
  ```
  WORDLE_MAX_ROUNDS=8
  WORDLE_WORD_LIST=MANGO,APPLE,GRAPE,PEACH,LEMON,MELON
  ```

## Notes

- Run all commands from the project root directory as workspace is pre-configured.
- Each client session is independent; you can test multiplayer by running multiple clients.
- Restarting the client generates a new user ID, even if you use the same user name.
