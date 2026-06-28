#!/usr/bin/env python3
"""
French Class Telegram Reminder Bot
- Schedule: Rithika Maam French (A1 Level, Videos 2-14)
- All class times are in CST (Texas timezone)
- Sends Telegram reminder 20 minutes before each class
"""

import os
import sys
import logging
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz

from schedule_data import ALL_SESSIONS, DAY_MAP

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
REMINDER_MINUTES = int(os.getenv("REMINDER_MINUTES_BEFORE", "20"))

CST = pytz.timezone("America/Chicago")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger(__name__)


def send_telegram_message(text: str) -> bool:
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": text,
        "parse_mode": "HTML",
    }
    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        log.info("Telegram message sent successfully.")
        return True
    except requests.RequestException as e:
        log.error(f"Failed to send Telegram message: {e}")
        return False


def make_reminder_callback(day: str, hour: int, minute: int, videos: str):
    session_type = "Morning" if hour < 12 else "Evening"
    class_time_str = datetime.now(CST).replace(
        hour=hour, minute=minute, second=0, microsecond=0
    ).strftime("%I:%M %p")

    def callback():
        now = datetime.now(CST)
        class_dt = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        if class_dt <= now:
            class_dt += timedelta(days=1)

        message = (
            f"🇫🇷 <b>French Class Reminder!</b>\n\n"
            f"⏰ Class starts in <b>{REMINDER_MINUTES} minutes</b>\n"
            f"📅 <b>{day.capitalize()}</b> - {session_type} Session\n"
            f"🕐 Class time: <b>{class_time_str} CST</b>\n"
            f"🎥 Videos to watch: <b>{videos}</b>\n\n"
            f"Get ready! Ouvrez vos cahiers! 📚"
        )
        log.info(f"Sending reminder for {day} {class_time_str} - {videos}")
        send_telegram_message(message)

    return callback


def subtract_minutes(hour: int, minute: int, mins: int):
    total = hour * 60 + minute - mins
    if total < 0:
        total += 24 * 60
    return total // 60, total % 60


def main():
    if not BOT_TOKEN or BOT_TOKEN == "your_bot_token_here":
        log.error("TELEGRAM_BOT_TOKEN is not set. Please configure your .env file.")
        sys.exit(1)
    if not CHAT_ID or CHAT_ID == "your_chat_id_here":
        log.error("TELEGRAM_CHAT_ID is not set. Please configure your .env file.")
        sys.exit(1)

    scheduler = BlockingScheduler(timezone=CST)

    for day, hour, minute, videos in ALL_SESSIONS:
        remind_hour, remind_minute = subtract_minutes(hour, minute, REMINDER_MINUTES)
        day_of_week = DAY_MAP[day]

        trigger = CronTrigger(
            day_of_week=day_of_week,
            hour=remind_hour,
            minute=remind_minute,
            second=0,
            timezone=CST,
        )

        scheduler.add_job(
            make_reminder_callback(day, hour, minute, videos),
            trigger=trigger,
            id=f"{day}_{hour:02d}{minute:02d}_{videos.replace(' ', '')}",
            name=f"{day.capitalize()} {hour:02d}:{minute:02d} - {videos}",
            replace_existing=True,
        )

        session_type = "AM" if hour < 12 else "PM"
        log.info(
            f"Scheduled: {day.capitalize()} reminder at "
            f"{remind_hour:02d}:{remind_minute:02d} CST "
            f"(class at {hour:02d}:{minute:02d} {session_type} CST) - {videos}"
        )

    log.info(f"\nTotal reminders scheduled: {len(ALL_SESSIONS)}")
    log.info(f"Reminders fire {REMINDER_MINUTES} minutes before each class (CST)")
    log.info("Bot is running... Press Ctrl+C to stop.\n")

    # Send startup confirmation
    send_telegram_message(
        "✅ <b>French Class Reminder Bot is now active!</b>\n\n"
        f"I will remind you <b>{REMINDER_MINUTES} minutes</b> before each class.\n"
        "📚 Schedule: Rithika Maam French - A1 Level (Videos 2-14)\n"
        "🌎 All times are in <b>CST (Texas)</b>"
    )

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        log.info("Bot stopped.")


if __name__ == "__main__":
    main()
