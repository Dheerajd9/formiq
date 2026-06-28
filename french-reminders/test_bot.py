#!/usr/bin/env python3
"""
Quick test: sends a test message to verify your bot token and chat ID work.
Run: python test_bot.py
"""

import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

if not BOT_TOKEN or BOT_TOKEN == "your_bot_token_here":
    print("ERROR: Set TELEGRAM_BOT_TOKEN in your .env file")
    sys.exit(1)

if not CHAT_ID or CHAT_ID == "your_chat_id_here":
    print("ERROR: Set TELEGRAM_CHAT_ID in your .env file")
    sys.exit(1)

url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
payload = {
    "chat_id": CHAT_ID,
    "text": (
        "✅ <b>Test message from French Class Reminder Bot!</b>\n\n"
        "If you see this, your bot is configured correctly. 🎉\n"
        "Run <code>python reminder.py</code> to start all reminders."
    ),
    "parse_mode": "HTML",
}

print(f"Sending test message to chat ID: {CHAT_ID} ...")
try:
    r = requests.post(url, json=payload, timeout=10)
    r.raise_for_status()
    print("✅ SUCCESS! Check your Telegram — you should have received a message.")
except requests.RequestException as e:
    print(f"❌ FAILED: {e}")
    if hasattr(e, "response") and e.response is not None:
        print(f"Response: {e.response.text}")
    sys.exit(1)
