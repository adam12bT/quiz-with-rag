#!/usr/bin/env python3
# TCP Quiz Server (UDP-compatible version, improved message separation)
import socket
import threading
import time

HOST = "0.0.0.0"
PORT = 8888
QUESTION_TIMEOUT = 20
QUESTIONS_FILE = "../questions.txt"


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


class TCPQuizServer:
    def __init__(self, host, port):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.bind((host, port))
        self.sock.listen(5)

        self.clients = {}        # username -> conn
        self.scores = {}         # username -> score
        self.recent_answers = {} # username -> (qid, choice)
        self.questions = load_questions(QUESTIONS_FILE)
        self.quiz_started = False
        self.lock = threading.Lock()

    def send(self, conn, msg):
        """Send a message with delimiter and flush delay to ensure separation."""
        try:
            conn.sendall((msg + "\n\n").encode("utf-8"))  # double newline separator
            time.sleep(0.05)  # short delay to avoid merging
        except Exception as e:
            print(f"[ERROR] Send failed: {e}")

    def broadcast(self, msg, exclude_user=None):
        for username, conn in list(self.clients.items()):
            if username == exclude_user:
                continue
            self.send(conn, msg)

    def send_player_list(self):
        if not self.clients:
            return
        all_players = ",".join(self.clients.keys())
        for conn in self.clients.values():
            self.send(conn, f"players:{all_players}")
        print(f"[INFO] Sent player list: {all_players}")

    def handle_client(self, conn, addr):
        username = None
        buf = b""
        print(f"[NEW CONNECTION] {addr}")

        while True:
            try:
                data = conn.recv(1024)
                if not data:
                    break
                buf += data

                while b"\n" in buf:
                    line, buf = buf.split(b"\n", 1)
                    msg = line.decode("utf-8").strip()
                    if not msg:
                        continue
                    print(f"[RECV] {addr} -> {msg}")

                    # Player joins
                    if msg.startswith("join:"):
                        username = msg.split(":", 1)[1].strip()
                        with self.lock:
                            if username in self.clients:
                                self.send(conn, "error:Username already taken")
                                continue
                            self.clients[username] = conn
                            self.scores.setdefault(username, 0)
                        print(f"[INFO] {username} joined.")
                        self.broadcast(f"broadcast:{username} joined the game", exclude_user=username)
                        self.send_player_list()
                        continue

                    # Admin starts quiz
                    if msg == "start":
                        if not self.quiz_started:
                            print("🟢 Admin started the quiz.")
                            self.broadcast("start")
                            self.quiz_started = True
                            threading.Thread(target=self.game_loop, daemon=True).start()
                        continue

                    # Player answers
                    if msg.startswith("answer:"):
                        parts = msg.split(":")
                        if len(parts) >= 4:
                            uname = parts[1]
                            qid = parts[2]
                            choice = parts[3].strip().upper()
                            with self.lock:
                                self.recent_answers[uname] = (qid, choice)
                        continue

                    # Player requests list
                    if msg == "players":
                        all_players = ",".join(self.clients.keys())
                        self.send(conn, f"players:{all_players}")
                        continue

            except Exception as e:
                print(f"[ERROR] Client error: {e}")
                break

        with self.lock:
            if username and username in self.clients:
                del self.clients[username]
                self.broadcast(f"broadcast:{username} left the game.")
                self.send_player_list()
        conn.close()

    def accept_loop(self):
        print(f"🖥️ TCP Server running on {HOST}:{PORT}")
        while True:
            conn, addr = self.sock.accept()
            threading.Thread(target=self.handle_client, args=(conn, addr), daemon=True).start()

    def game_loop(self):
        print("Starting quiz in 3 seconds...")
        time.sleep(3)

        if not self.questions:
            print("⚠️ No questions found.")
            return

        for q in self.questions:
            with self.lock:
                self.recent_answers = {}

            qmsg = f"question:{q['id']}:{q['text']}|{'|'.join(q['options'])}"
            self.broadcast(qmsg)
            print(f"[QUESTION] {q['text']}")
            start = time.time()
            answered_players = set()

            while time.time() - start < QUESTION_TIMEOUT:
                with self.lock:
                    for uname, (qid, choice) in list(self.recent_answers.items()):
                        if uname in answered_players:
                            continue
                        if qid == q["id"]:
                            answered_players.add(uname)
                            if choice == q["correct"]:
                                self.scores[uname] = self.scores.get(uname, 0) + 1
                                self.broadcast(f"score:{uname}:{self.scores[uname]}")
                                self.broadcast(f"broadcast:✅ {uname} answered correctly!")
                            else:
                                self.broadcast(f"broadcast:❌ {uname} answered wrong.")
                time.sleep(0.1)

            # Show correct answer
            self.broadcast(f"broadcast:⏰ Time's up! Correct answer: {q['correct']}")

            with self.lock:
                board = "|".join(
                    [f"{u}:{p}" for u, p in sorted(self.scores.items(), key=lambda x: -x[1])]
                )
            self.broadcast(f"leaderboard:{board}")
            time.sleep(4)
            print(f"[INFO] Leaderboard sent: {board}")

        # Delay before final broadcast to ensure leaderboard is seen
        time.sleep(0.5)
        self.broadcast("broadcast:🏁 Quiz finished! Thanks for playing!")
        print("🏁 Quiz finished.")


if __name__ == "__main__":
    server = TCPQuizServer(HOST, PORT)
    threading.Thread(target=server.accept_loop, daemon=True).start()

    print("Waiting for admin to start the quiz...")
    while True:
        time.sleep(1)
