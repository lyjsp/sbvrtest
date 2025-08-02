# Wordle Game (TypeScript)

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

## Running the Application

1. **Start the server:**

   ```bash
   npm run server
   ```

2. **In a new terminal, start the client:**

   ```bash
   npm run client
   ```

## Multiplayer

- You can open multiple terminal windows and run the client in each to play as different users (multiplayer).
- When prompted, enter a player name. Names can be duplicated; each session is tracked separately for each run of the app.
- All players play against the same answer. If all available turns are used, players must wait for the next game to start.

## How the Game Works

- Each player tries to guess the target word within a limited number of rounds.
- The program prints feedback for each letter in your guess:
  - `O` means **Hit** (letter is in the target word and in the correct spot)
  - `?` means **Present** (letter is in the target word, but not in the correct spot)
  - `_` means **Miss** (letter is not in the target word)
- All players receive live updates when others get hits or presents.

## Features & Enhancements

- **Live updates:** See when other players get hit/present letters in real time.
- **Scoreboard in terminal:** View number of wins, number of turns, and accuracy for each player.
- **Configurable game:** Change word list and max rounds via environment variables.
- **Auto countdown and restart:** When a player hits the answer, a countdown starts and a new game with a new word begins automatically for all players.

## Default Configuration

- The default word list is (number of letter for each word has to be consistent, otherwise error will be thrown when the server start):
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
