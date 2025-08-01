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

## Notes

- Run all commands from the project root directory as workspace is pre-configured.

## Multiplayer

- You can open multiple terminal windows and run the client in each to play as different users (multiplayer).
- When prompted, enter a player name. Names can be duplicated; each session is tracked separately for each run of the app.
- All players play against the same answer. If all available turns are used, players must wait for the next game to start.

## How to Read the Output

The program will print different letters based on your input:

- `O` means **Hit** (letter is in the target word and in the correct spot)
- `?` means **Present** (letter is in the target word, but not in the correct spot)
- `_` means **Miss** (letter is not in the target word)

## Features & Enhancements

- **Live updates:** See when other players get hit/present letters in real time.
- **Scoreboard in terminal:** View number of wins, number of turns, and accuracy for each player.
