# Fitbit → Telegram Daily Health Summary Bot

Every morning (~7 AM IST) a GitHub Actions cron fetches the previous
day/night's health data — sleep duration and stages, resting heart rate,
steps, total calories, active minutes — and pushes a formatted summary to
Telegram. On Sundays it adds a 7-day trend. Each day's numbers are also
appended to `data/health_log.csv` for long-term charting.

## Why this targets the Google Health API, not `api.fitbit.com`

Fitbit's legacy Web API (`api.fitbit.com` + Fitbit OAuth) **shuts down in
September 2026**. Its replacement, the **Google Health API**
(`https://health.googleapis.com/v4`, standard Google OAuth 2.0), has been
generally available since May 2026. Building on the legacy API in July 2026
would mean redoing the OAuth setup and all endpoints within two months, so
this bot targets the Google Health API directly. Two practical wins:

- **Refresh tokens don't rotate.** Fitbit invalidated the refresh token on
  every use, which forced hacks to write the new token back to the secrets
  store each run. Google refresh tokens are stable — one-time setup, no
  write-back, no PAT with secrets scope.
- **Uniform endpoints.** One `dataPoints:dailyRollUp` / `dataPoints:list`
  shape for every data type, and daily rollups are attributed to calendar
  days in *your* local time, so IST day boundaries are handled server-side.

Reference: [Google Health API overview](https://developers.google.com/health/about) ·
[migration guide](https://developers.google.com/health/migration) ·
[data types](https://developers.google.com/health/data-types) ·
[scopes](https://developers.google.com/health/scopes)

## One-time device setting (no code involved)

Server-side scripts cannot force the watch to sync — BLE sync to the cloud
goes through the Fitbit iOS app. Enable **Settings → Fitbit → Background App
Refresh** and keep **Bluetooth** on so the app syncs passively overnight
without being opened. If the morning message says "no data", this is the
first thing to check.

## Setup

### 1. Google Cloud project + OAuth client

1. Create a project at <https://console.cloud.google.com> and enable the
   **Google Health API** (APIs & Services → Library).
2. Configure the OAuth consent screen:
   - User type: **External**.
   - **Publish it to "In production"** and leave it unverified. This matters:
     apps left in *Testing* status get refresh tokens that expire after
     **7 days**, which silently kills the cron. As the only user of your own
     app you don't need Google's restricted-scope verification — you'll just
     click through an "unverified app" warning once during authorization.
3. Create credentials → OAuth client ID → **Desktop app**. Note the client
   ID and client secret.

The bot requests these read-only scopes:

| Scope | Used for |
|---|---|
| `googlehealth.sleep.readonly` | sleep sessions, stage minutes |
| `googlehealth.activity_and_fitness.readonly` | steps, total calories, active minutes |
| `googlehealth.health_metric_and_measurements.readonly` | daily resting heart rate |

(Full form: `https://www.googleapis.com/auth/googlehealth.<scope>`.)

### 2. Get the refresh token

On your own machine (needs a browser):

```bash
pip install requests
GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy python fitbit-bot/fitbit_oauth_setup.py
```

It opens the Google consent screen, catches the redirect on
`localhost:8765`, exchanges the code, and prints the refresh token. Because
Google refresh tokens don't rotate, this is genuinely one-time (the token
only dies if revoked or unused for ~6 months — the daily cron keeps it warm).

### 3. GitHub Actions secrets

Repo → Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | from step 1 |
| `GOOGLE_CLIENT_SECRET` | from step 1 |
| `GOOGLE_REFRESH_TOKEN` | printed by step 2 |
| `TELEGRAM_BOT_TOKEN` | already set (shared with the French reminders bot) |
| `TELEGRAM_CHAT_ID` | already set |

### 4. Test locally before trusting the cron

```bash
export GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... GOOGLE_REFRESH_TOKEN=...
export TG_TOKEN=<telegram bot token> TG_CHAT_ID=<your chat id>
python fitbit-bot/daily_summary.py
```

You should get the summary message in Telegram within a few seconds, and a
new row in `fitbit-bot/data/health_log.csv`. Then trigger the workflow once
by hand (Actions → *Fitbit Daily Health Summary* → Run workflow) to confirm
the secrets are wired up.

## How it behaves

- **Schedule**: `30 1 * * *` UTC = 7:00 AM IST (IST has no DST). The script
  always reports on "yesterday in IST", so late cron starts are harmless.
- **Poor-sleep flag**: the message is prefixed with ⚠️ when sleep < 6 h or
  efficiency < 80 % (efficiency = asleep / time-in-bed).
- **Weekly rollup**: Sundays get a second message with 7-day averages
  (sleep, resting HR, steps) and total calories.
- **Failure alerting**: any error — token refresh, API, parsing — sends a
  🚨 Telegram message with the exception instead of failing silently.
- **Missing data**: if yesterday has no synced data the summary says so and
  reminds you about Background App Refresh.
- **History**: `data/health_log.csv` is committed back by the workflow
  (`[skip ci]`), ready for pandas/Streamlit later.

## Field-name caveat

The Google Health API is new (GA May 2026) and some rollup payload field
names may still shift. `daily_summary.py` tries the documented field names
first (`steps.countSum`, etc.) and falls back to scanning the data point for
its numeric value, so minor renames degrade gracefully. If a metric ever
shows "no data" while the Fitbit app clearly has it, dump the raw response
for that data type and update the key lists in `fetch_day_metrics()`.
