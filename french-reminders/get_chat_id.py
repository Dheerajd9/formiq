#!/usr/bin/env python3
"""
Run this script AFTER sending /start to your bot in Telegram.
It will print your Chat ID so you can paste it into .env
"""

import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

if not BOT_TOKEN:
    print("ERROR: TELEGRAM_BOT_TOKEN not set in .env")
    sys.exit(1)

print(f"Fetching updates for bot token: {BOT_TOKEN[:20]}...")

url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"
try:
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    data = r.json()
except requests.RequestException as e:
    print(f"ERROR: {e}")
    sys.exit(1)

results = data.get("result", [])
if not results:
    print("\n⚠️  No messages found.")
    print("Please do this:")
    print("  1. Open Telegram")
    print("  2. Search for your bot")
    print("  3. Send it the message: /start")
    print("  4. Run this script again")
    sys.exit(1)

for update in results:
    msg = update.get("message") or update.get("channel_post")
    if msg and "chat" in msg:
        chat = msg["chat"]
        print(f"\n✅ Found your Chat ID!")
        print(f"   Chat ID  : {chat['id']}")
        print(f"   Name     : {chat.get('first_name', '')} {chat.get('last_name', '')}".strip())
        print(f"\nPaste this into your .env file:")
        print(f"   TELEGRAM_CHAT_ID={chat['id']}")
        break
