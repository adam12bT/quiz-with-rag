#!/usr/bin/env python3
# TCP Quiz Server
import socket
import threading
import time

HOST = "0.0.0.0"
PORT = 8888
QUESTION_TIMEOUT = 20  # seconds
QUESTIONS_FILE = "../questions.txt"  # adjust if needed


def load_questions(path):
    """Load questions from file."""
    questions = []
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
    return questions


class TCPQuizServer:
    def __init__(self, host, port):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.bind((host, port))
        self.sock.listen(5)
        self.clients = {}         # conn -> username
        self.scores = {}          # username -> points
        self.recent_answers = {}  # qid -> (username, choice, time)
        self.questions = load_questions(QUESTIONS_FILE)
        self.lock = threading.Lock()

    def send(self, conn, msg):
        try:
            conn.sendall((msg + "\n").encode("utf-8"))
        except:
            pass

    def broadcast(self, msg):
        for conn in list(self.clients.keys()):
            self.send(conn, msg)

    def handle_client(self, conn):
        buf = b""
        username = None
        while True:
            try:
                data = conn.recv(1024)
                if not data:
                    break
                buf += data
                while b"\n" in buf:
                    line, buf = buf.split(b"\n", 1)
                    msg = line.decode("utf-8").strip()
                    print(f"[RECV] {msg}")

                    if msg.startswith("join:"):
                        username = msg.split(":", 1)[1]
                        with self.lock:
                            self.clients[conn] = username
                            self.scores.setdefault(username, 0)
                        self.send(conn, f"joined:{username}")
                        self.broadcast(f"broadcast:{username} joined")

                    elif msg.startswith("answer:"):
                        # answer:<qid>:<option>
                        parts = msg.split(":")
                        if len(parts) >= 3:
                            qid, choice = parts[1], parts[2].strip().upper()
                            with self.lock:
                                if qid not in self.recent_answers:
                                    self.recent_answers[qid] = (
                                        username, choice, time.time()
                                    )
            except Exception as e:
                print(f"[ERROR] {e}")
                break

        with self.lock:
            if conn in self.clients:
                left = self.clients.pop(conn)
                print(f"{left} disconnected.")
        conn.close()

    def accept_loop(self):
        print(f"TCP server listening on {HOST}:{PORT}")
        while True:
            conn, addr = self.sock.accept()
            print(f"New connection from {addr}")
            threading.Thread(target=self.handle_client, args=(conn,), daemon=True).start()

    def game_loop(self):
        print("Waiting for at least one player to join...")
        while len(self.clients) == 0:
            time.sleep(1)

        print("Players joined. Starting quiz in 3 seconds...")
        time.sleep(3)

        for q in self.questions:
            with self.lock:
                self.recent_answers = {}
            qmsg = f"question:{q['id']}:{q['text']}|{'|'.join(q['options'])}"
            self.broadcast(qmsg)
            print(f"[QUESTION] {q['text']}")
            start = time.time()
            winner = None

            while time.time() - start < QUESTION_TIMEOUT:
                with self.lock:
                    if q["id"] in self.recent_answers and winner is None:
                        uname, choice, _ = self.recent_answers[q["id"]]
                        if choice == q["correct"]:
                            winner = uname
                            self.scores[uname] = self.scores.get(uname, 0) + 1
                            self.broadcast(f"score:{uname}:{self.scores[uname]}")
                            self.broadcast(f"broadcast:Correct! {uname} gets a point.")
                time.sleep(0.1)

            if not winner:
                self.broadcast(f"broadcast:Time's up! Correct: {q['correct']}")

            # Send leaderboard
            with self.lock:
                board = "|".join(
                    [f"{u}:{p}" for u, p in sorted(self.scores.items(), key=lambda x: -x[1])]
                )
            self.broadcast(f"leaderboard:{board}")
            time.sleep(2)

        self.broadcast("broadcast:Quiz finished. Thanks!")
        print("Quiz finished.")
        self.sock.close()


if __name__ == "__main__":
    server = TCPQuizServer(HOST, PORT)
    threading.Thread(target=server.accept_loop, daemon=True).start()
    server.game_loop()
