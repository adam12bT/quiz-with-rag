#!/usr/bin/env python3
import socket
import threading
import time

HOST = '0.0.0.0'
PORT = 8888
QUESTION_TIMEOUT = 20  # seconds
QUESTIONS_FILE = "../questions.txt"  # path to questions


def load_questions(path):
    questions = []
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                parts = line.split("|")
                if len(parts) != 7:
                    continue
                qid, text, a, b, c, d, correct = parts
                questions.append({
                    "id": qid,
                    "text": text,
                    "options": [a, b, c, d],
                    "correct": correct.strip().upper()
                })
    except FileNotFoundError:
        print(f"⚠️ File not found: {path}")
    return questions


class UDPQuizServer:
    def __init__(self, host, port):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.bind((host, port))

        # ✅ Use username as key instead of address
        self.clients = {}      # username -> addr
        self.scores = {}       # username -> points
        self.questions = load_questions(QUESTIONS_FILE)
        self.recent_answers = {}  # addr -> (qid, choice)
        self.quiz_started = False

    def send(self, addr, msg):
        self.sock.sendto(msg.encode("utf-8"), addr)

    def broadcast(self, msg, exclude_user=None):
        """Send message to all clients, except one username if needed."""
        for username, addr in self.clients.items():
            if username == exclude_user:
                continue
            try:
                self.send(addr, msg)
            except Exception as e:
                print(f"[ERROR] Failed to send to {username} ({addr}): {e}")

    def send_player_list(self):
        """Send updated player list to all players."""
        if not self.clients:
            return
        all_players = ",".join(self.clients.keys())
        for addr in self.clients.values():
            self.send(addr, f"players:{all_players}")
        print(f"[INFO] Sent player list to all: {all_players}")

    def listen(self):
        while True:
            data, addr = self.sock.recvfrom(4096)
            msg = data.decode("utf-8").strip()
            print(f"[RECV] {addr} -> {msg}")

            if msg.startswith("join:"):
                username = msg.split(":", 1)[1].strip()

                # ✅ Add new player only if username not already used
                if username not in self.clients:
                    self.clients[username] = addr
                    self.scores.setdefault(username, 0)
                    print(f"[INFO] {username} joined the game.")

                    # Send player list once to all
                    self.send_player_list()

                    # Notify everyone that someone joined
                    self.broadcast(f"broadcast:{username} joined the game", exclude_user=username)

                    print(f"[INFO] Current players: {', '.join(self.clients.keys())}")
                else:
                    # If username already exists, tell the client it's taken
                    self.send(addr, "error:Username already taken")

            elif msg == "start":
                print("🟢 Admin started the quiz.")
                self.broadcast("start")  # send start message to all clients
                self.quiz_started = True


            elif msg.startswith("answer:"):
                parts = msg.split(":")
                if len(parts) >= 4:
                    username = parts[1]
                    qid = parts[2]
                    choice = parts[3].strip().upper()
                    self.recent_answers[username] = (qid, choice)

            elif msg == "players":
                all_players = ",".join(self.clients.keys())
                self.send(addr, f"players:{all_players}")

    def game_loop(self):
        print("Waiting for players and admin to start the quiz...")
        while not self.quiz_started:
            time.sleep(1)

        print("Starting quiz in 3 seconds...")
        time.sleep(3)

        if not self.questions:
            print("⚠️ No questions found. Ending quiz.")
            return

        for q in self.questions:
            self.recent_answers = {}
            qmsg = f"question:{q['id']}:{q['text']}|{'|'.join(q['options'])}"
            self.broadcast(qmsg)
            print(f"[QUESTION] {q['text']}")
            start = time.time()
            answered_players = set()

            while time.time() - start < QUESTION_TIMEOUT:
                for username, (qid, choice) in list(self.recent_answers.items()):
                    if username in answered_players:
                        continue  # already processed this player's answer

                    if qid == q["id"]:
                        answered_players.add(username)
                        if choice == q["correct"]:
                            self.scores[username] = self.scores.get(username, 0) + 1
                            self.broadcast(f"score:{username}:{self.scores[username]}")
                            self.broadcast(f"broadcast:✅ {username} answered correctly!")
                        else:
                            self.broadcast(f"broadcast:❌ {username} answered wrong.")
                time.sleep(0.1)

            # Show the correct answer after timeout
            self.broadcast(f"broadcast:⏰ Time's up! Correct answer: {q['correct']}")

            # Send updated leaderboard
            board = "|".join(
                [f"{u}:{p}" for u, p in sorted(self.scores.items(), key=lambda x: -x[1])]
            )
            self.broadcast(f"leaderboard:{board}")
            time.sleep(2)

        self.broadcast("broadcast:🏁 Quiz finished! Thanks for playing!")
    print("Quiz finished.")



if __name__ == "__main__":
    server = UDPQuizServer(HOST, PORT)
    threading.Thread(target=server.listen, daemon=True).start()
    server.game_loop()
