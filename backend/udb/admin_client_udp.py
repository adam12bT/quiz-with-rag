
import socket
import time

SERVER = ("127.0.0.1", 8888)

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

print("=== Admin Client ===")
print("Type 'start' to begin the quiz.")
print("Type 'quit' to exit.")

while True:
    cmd = input("> ").strip().lower()
    if cmd == "start":
        sock.sendto(b"start", SERVER)
        print("✅ Quiz started!")
    elif cmd in ("quit", "exit"):
        break
    else:
        print("Commands: start / quit")

sock.close()
