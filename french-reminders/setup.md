# French Class Reminder Bot - Setup Guide

## 1. Create Your Telegram Bot

1. Open Telegram → search for **@BotFather**
2. Send `/newbot`
3. Choose a name: e.g. `French Class Reminder`
4. Choose a username: e.g. `FrenchClassReminderBot` (must end in "bot")
5. Copy the **Bot Token** it gives you (looks like `7123456789:AAHxxx...`)

## 2. Get Your Chat ID

1. Search for your new bot in Telegram and send it `/start`
2. Open this URL in your browser (replace YOUR_TOKEN):
   ```
   https://api.telegram.org/botYOUR_TOKEN/getUpdates
   ```
3. Find `"chat":{"id":XXXXXXXXX}` — that number is your **Chat ID**

## 3. Configure the Bot

```bash
cd french-reminders
cp .env.example .env
```

Edit `.env` and fill in your values:
```
TELEGRAM_BOT_TOKEN=7123456789:AAHxxx...
TELEGRAM_CHAT_ID=123456789
REMINDER_MINUTES_BEFORE=20
```

## 4. Install Dependencies

```bash
pip install -r requirements.txt
```

## 5. Test Your Setup

```bash
python test_bot.py
```

You should receive a test message in Telegram.

## 6. Run the Bot

```bash
python reminder.py
```

The bot will:
- Send a confirmation message when it starts
- Send you a reminder **20 minutes before** every French class
- Tell you which videos to watch (V1-V5, V6-V10, or V11-V14)
- All times are in **CST (Texas timezone)**

## Schedule Overview (CST Times)

### Morning Sessions (First Trainer)
| Day | 7:30 AM | 8:30 AM | 9:30 AM | 10:30 AM |
|-----|---------|---------|---------|----------|
| Mon | V1-V5 | V1-V5 | V11-V14 | V11-V14 |
| Tue | V1-V5 | V1-V5 | V11-V14 | V11-V14 |
| Wed | V6-V10 | V6-V10 | V1-V5 | V1-V5 |
| Thu | V6-V10 | V6-V10 | V1-V5 | V1-V5 |
| Fri | V11-V14 | V11-V14 | V6-V10 | V6-V10 |
| Sat | V11-V14 | V11-V14 | V6-V10 | V6-V10 |

### Evening Sessions (Jasleen)
| Day | 7:30 PM | 8:30 PM | 9:30 PM | 10:30 PM |
|-----|---------|---------|---------|----------|
| Sun | V1-V5 | V1-V5 | V11-V14 | V11-V14 |
| Mon | V1-V5 | V1-V5 | V11-V14 | V11-V14 |
| Tue | V6-V10 | V6-V10 | V1-V5 | V1-V5 |
| Wed | V6-V10 | V6-V10 | V1-V5 | V1-V5 |
| Thu | V11-V14 | V11-V14 | V6-V10 | V6-V10 |
| Fri | V11-V14 | V11-V14 | V6-V10 | V6-V10 |

*(Original EST times - 1 hour = CST)*

## Keep the Bot Running 24/7

### On Linux/Mac (using screen):
```bash
screen -S french-bot
python reminder.py
# Press Ctrl+A then D to detach
```

### On a Server (systemd service):
```bash
sudo nano /etc/systemd/system/french-reminder.service
```
```ini
[Unit]
Description=French Class Reminder Bot

[Service]
ExecStart=/usr/bin/python3 /path/to/french-reminders/reminder.py
WorkingDirectory=/path/to/french-reminders
Restart=always
EnvironmentFile=/path/to/french-reminders/.env

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl enable french-reminder
sudo systemctl start french-reminder
```
