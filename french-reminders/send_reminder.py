#!/usr/bin/env python3
"""
GitHub Actions entry point.
Checks if a French class starts in ~20 minutes (CST/CDT) and sends a Telegram reminder.
"""

import os
import sys
import requests
from datetime import datetime, timedelta
import pytz

from schedule_data import ALL_SESSIONS, DAY_MAP

BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")
REMINDER_MINUTES = 20
WINDOW_MINUTES = 8  # ±8 min window to absorb GitHub Actions scheduling delays

CST = pytz.timezone("America/Chicago")


def send_message(text: str):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    r = requests.post(
        url,
        json={"chat_id": CHAT_ID, "text": text, "parse_mode": "HTML"},
        timeout=10,
    )
    r.raise_for_status()


def main():
    if not BOT_TOKEN or not CHAT_ID:
        print("ERROR: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set as GitHub Secrets.")
        sys.exit(1)

    now = datetime.now(CST)
    target = now + timedelta(minutes=REMINDER_MINUTES)

    print(f"Current time (CST/CDT): {now.strftime('%A %I:%M %p %Z')}")
    print(f"Looking for class at:   {target.strftime('%A %I:%M %p %Z')}")

    for day, hour, minute, videos in ALL_SESSIONS:
        if DAY_MAP[day] != target.weekday():
            continue

        class_dt = target.replace(hour=hour, minute=minute, second=0, microsecond=0)
        diff = abs((class_dt - target).total_seconds() / 60)

        if diff <= WINDOW_MINUTES:
            session_type = "Morning" if hour < 12 else "Evening"
            class_time_str = class_dt.strftime("%I:%M %p")

            message = (
                f"🇫🇷 <b>French Class Reminder!</b>\n\n"
                f"⏰ Class starts in <b>{REMINDER_MINUTES} minutes</b>\n"
                f"📅 <b>{day.capitalize()}</b> — {session_type} Session\n"
                f"🕐 Class time: <b>{class_time_str} CST</b>\n"
                f"🎥 Videos to watch: <b>{videos}</b>\n\n"
                f"Get ready! Ouvrez vos cahiers! 📚"
            )

            print(f"✅ Match found: {day.capitalize()} {class_time_str} — {videos}")
            send_message(message)
            print("✅ Telegram reminder sent!")
            return

    print("ℹ️  No class in the next ~20 minutes. Nothing to send.")


if __name__ == "__main__":
    main()
