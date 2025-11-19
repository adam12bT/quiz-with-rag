# WebSocket Protocol Documentation

This document describes the WebSocket message format for communication between the React frontend and the Node.js WebSocket bridge.

## Connection

**WebSocket URL**: `ws://localhost:8080`

## Message Formats

### Client → Server (Frontend sends to Bridge)

#### 1. Join Game
```
join:<username>
```
Example: `join:Alice`

#### 2. Start Quiz (Admin only)
```
start
```

#### 3. Submit Answer
```
answer:<questionId>:<choice>
```
Example: `answer:1:B`
- `questionId`: The ID of the current question
- `choice`: The selected answer (A, B, C, or D)

#### 4. Kick Player (Admin only)
```
kick:<playerName>
```
Example: `kick:Bob`
- `playerName`: The username of the player to remove from the game

---

### Server → Client (Bridge sends to Frontend)

#### 1. Players List Update
```
players:<player1>,<player2>,<player3>
```
Example: `players:Alice,Bob,Charlie`

#### 2. Question Data
```
question:<id>|<number>|<text>|<optionA>|<optionB>|<optionC>|<optionD>|<correct>
```
Example: `question:1|1|What is 2+2?|2|3|4|5|C`
- `id`: Question ID
- `number`: Question number (for display)
- `text`: Question text
- `optionA`, `optionB`, `optionC`, `optionD`: Answer options
- `correct`: Correct answer (A, B, C, or D)

#### 3. Leaderboard Update
```
leaderboard:<player1>:<score1>|<player2>:<score2>|<player3>:<score3>
```
Example: `leaderboard:Alice:100|Bob:80|Charlie:60`

#### 4. Broadcast Messages
```
broadcast:<message>
```
Examples:
- `broadcast:Quiz started!`
- `broadcast:Quiz ended`
- `broadcast:Player joined`

Special broadcast messages:
- Messages containing "started" or "quiz" trigger quiz start
- Messages containing "ended" or "finished" trigger end screen

---

## Game Flow

1. **Login Phase**
   - **Create Game**: User enters only username, app auto-generates 4-digit PIN
   - **Join Game**: User enters username and existing game PIN
   - Frontend sends: `join:<username>`
   - Backend responds: `players:<updatedList>`

2. **Lobby Phase**
   - **Admin Lobby** (game creator):
     - Shows player management interface
     - Can kick players with trash icon
     - Can start quiz anytime (no minimum player requirement enforced)
     - Game code displayed prominently with copy functionality
   - **Regular Lobby** (joined players):
     - Shows waiting message for admin to start
     - Displays all connected players
   - Admin clicks "Start Quiz"
   - Frontend sends: `start`
   - Backend responds: `broadcast:Quiz started!`

3. **Quiz Phase**
   - Backend sends: `question:<data>`
   - Frontend displays question with 20-second timer
   - Player selects answer
   - Frontend sends: `answer:<questionId>:<choice>`
   - Backend processes and sends next question or leaderboard

4. **Leaderboard Phase**
   - Backend sends: `leaderboard:<data>`
   - Frontend displays current standings
   - After brief pause, backend sends next question or end message

5. **End Phase**
   - Backend sends: `broadcast:Quiz ended`
   - Frontend displays final leaderboard
   - Players can choose to play again or exit

---

## Implementation Notes

- The WebSocket connection automatically reconnects if disconnected
- All messages are plain text strings
- The frontend handles message parsing and routing to appropriate components
- The 20-second timer is handled client-side per question
- Connection status is displayed while connecting
