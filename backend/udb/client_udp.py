#!/usr/bin/env python3
# UDP Quiz Client
import socket
import threading

SERVER = ("127.0.0.1", 8888)  # change IP if server runs on another PC


def listen(sock):
    """Receive and display server messages."""
    while True:
        try:
            data, _ = sock.recvfrom(4096)
            print(">>", data.decode("utf-8"))
        except Exception:
            break


def main():
    print("=== UDP Quiz Client ===")
    username = input("Enter your username: ").strip()
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    # Join the game
    sock.sendto(f"join:{username}".encode("utf-8"), SERVER)
    threading.Thread(target=listen, args=(sock,), daemon=True).start()

    print("Type 'answer <question_id> <option>' to answer (e.g. answer 1 A)")
    print("Type 'quit' to exit.")

    while True:
        msg = input("> ").strip()
        if msg.lower() in ("quit", "exit"):
            break

        if msg.startswith("answer"):
            parts = msg.split()
            if len(parts) == 3:
                qid, opt = parts[1], parts[2].upper()
                sock.sendto(f"answer:{qid}:{opt}".encode("utf-8"), SERVER)
            else:
                print("Usage: answer <question_id> <option>")
        else:
            print("Unknown command. Example: answer 1 A")

    sock.close()
    print("Disconnected.")


if __name__ == "__main__":
    main()
