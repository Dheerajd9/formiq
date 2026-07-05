#!/usr/bin/env python3
"""Daily Fitbit health summary -> Telegram, via the Google Health API (v4).

Runs unattended from GitHub Actions every morning (~7 AM IST):
  1. Refresh the Google OAuth access token (refresh token does not rotate).
  2. Fetch yesterday's sleep, steps, total calories, active minutes and
     daily resting heart rate.
  3. Format a Markdown message (with a "poor sleep" flag when warranted)
     and send it to Telegram.
  4. Append the day's numbers to data/health_log.csv for long-term trends.
  5. On Sundays, also send a 7-day rollup (averages/totals).
  6. Any failure sends a Telegram alert instead of dying silently.

Required environment variables:
  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
  TG_TOKEN, TG_CHAT_ID
"""

import csv
import logging
import os
import sys
import time
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import requests

API_BASE = "https://health.googleapis.com/v4"
TOKEN_URL = "https://oauth2.googleapis.com/token"
IST = timezone(timedelta(hours=5, minutes=30))
LOG_FILE = Path(__file__).resolve().parent / "data" / "health_log.csv"
CSV_FIELDS = [
    "date", "minutes_asleep", "minutes_awake", "sleep_efficiency_pct",
    "deep_min", "rem_min", "light_min", "resting_hr_bpm", "steps",
    "total_calories_kcal", "active_minutes",
]

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("fitbit-bot")


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def request_with_retries(method: str, url: str, *, attempts: int = 4, **kwargs) -> requests.Response:
    """HTTP with exponential backoff on network errors, 429 and 5xx."""
    kwargs.setdefault("timeout", 30)
    delay = 2
    for attempt in range(1, attempts + 1):
        try:
            resp = requests.request(method, url, **kwargs)
            if resp.status_code == 429 or resp.status_code >= 500:
                raise requests.HTTPError(f"HTTP {resp.status_code}: {resp.text[:300]}")
            return resp
        except (requests.ConnectionError, requests.Timeout, requests.HTTPError) as exc:
            if attempt == attempts:
                raise
            log.warning("Attempt %d/%d for %s failed (%s); retrying in %ds",
                        attempt, attempts, url, exc, delay)
            time.sleep(delay)
            delay *= 2
    raise RuntimeError("unreachable")


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

def get_access_token() -> str:
    """Exchange the long-lived refresh token for an access token.

    Unlike the legacy Fitbit OAuth, Google refresh tokens do NOT rotate on
    use, so there is nothing to persist back after this call.
    """
    resp = request_with_retries(
        "POST", TOKEN_URL,
        data={
            "client_id": require_env("GOOGLE_CLIENT_ID"),
            "client_secret": require_env("GOOGLE_CLIENT_SECRET"),
            "refresh_token": require_env("GOOGLE_REFRESH_TOKEN"),
            "grant_type": "refresh_token",
        },
    )
    if resp.status_code != 200:
        raise RuntimeError(f"Token refresh failed ({resp.status_code}): {resp.text[:300]}")
    return resp.json()["access_token"]


# ---------------------------------------------------------------------------
# Google Health API v4 fetchers
# ---------------------------------------------------------------------------

def _civil(d: date, end_of_day: bool = False) -> dict:
    t = {"hours": 23, "minutes": 59, "seconds": 59} if end_of_day else {}
    return {"date": {"year": d.year, "month": d.month, "day": d.day}, "time": t}


def daily_rollup(token: str, data_type: str, start: date, end: date) -> list:
    """POST users/me/dataTypes/{type}/dataPoints:dailyRollUp for [start, end].

    dailyRollUp attributes data to the calendar day in the *user's* local
    time, so passing civil dates gives correct IST days without any
    timezone math on our side.
    """
    url = f"{API_BASE}/users/me/dataTypes/{data_type}/dataPoints:dailyRollUp"
    body = {
        "civilStartTime": _civil(start),
        "civilEndTime": _civil(end, end_of_day=True),
        "windowSizeDays": 1,
    }
    resp = request_with_retries("POST", url, json=body,
                                headers={"Authorization": f"Bearer {token}"})
    if resp.status_code != 200:
        raise RuntimeError(
            f"{data_type} dailyRollUp failed ({resp.status_code}): {resp.text[:300]}")
    return resp.json().get("rollupDataPoints", [])


def list_sleep(token: str, day: date) -> list:
    """POST users/me/dataTypes/sleep/dataPoints:list for sessions ending on `day`.

    Sleep is a session data type; the list endpoint filters on the session's
    civil end time (the night of day-1 -> morning of `day`).
    """
    url = f"{API_BASE}/users/me/dataTypes/sleep/dataPoints:list"
    nxt = day + timedelta(days=1)
    body = {
        "filter": (
            f'sleep.interval.civil_end_time >= "{day.isoformat()}T00:00:00" AND '
            f'sleep.interval.civil_end_time < "{nxt.isoformat()}T00:00:00"'
        ),
    }
    resp = request_with_retries("POST", url, json=body,
                                headers={"Authorization": f"Bearer {token}"})
    if resp.status_code != 200:
        raise RuntimeError(f"sleep list failed ({resp.status_code}): {resp.text[:300]}")
    return resp.json().get("dataPoints", [])


def _first_number(obj):
    """Depth-first search for the first numeric leaf in a nested structure.

    Rollup payloads wrap the value differently per data type (e.g.
    steps.countSum, totalCalories energy sum). Known keys are tried first by
    the callers; this is the safety net so a field rename degrades to a
    still-correct number instead of a crash.
    """
    if isinstance(obj, bool):
        return None
    if isinstance(obj, (int, float)):
        return obj
    if isinstance(obj, str):
        try:
            return float(obj)
        except ValueError:
            return None
    if isinstance(obj, dict):
        for v in obj.values():
            n = _first_number(v)
            if n is not None:
                return n
    if isinstance(obj, list):
        for v in obj:
            n = _first_number(v)
            if n is not None:
                return n
    return None


def rollup_value(points: list, type_keys: tuple, value_keys: tuple):
    """Extract the numeric value from a single-day rollup response."""
    if not points:
        return None
    point = points[0]
    for tk in type_keys:
        payload = point.get(tk)
        if payload is None:
            continue
        for vk in value_keys:
            if vk in payload:
                return _first_number(payload[vk])
        return _first_number(payload)
    # Field name drifted from what we expect: scan everything except the
    # civil time envelope rather than failing the whole run.
    trimmed = {k: v for k, v in point.items()
               if k not in ("civilStartTime", "civilEndTime")}
    return _first_number(trimmed)


def fetch_day_metrics(token: str, day: date) -> dict:
    steps = rollup_value(daily_rollup(token, "steps", day, day),
                         ("steps",), ("countSum",))
    calories = rollup_value(daily_rollup(token, "total-calories", day, day),
                            ("totalCalories", "total_calories"),
                            ("energySum", "kcalSum", "caloriesSum"))
    active_min = rollup_value(daily_rollup(token, "active-minutes", day, day),
                              ("activeMinutes", "active_minutes"),
                              ("durationSum", "minutesSum", "activeMinutes"))
    resting_hr = rollup_value(daily_rollup(token, "daily-resting-heart-rate", day, day),
                              ("dailyRestingHeartRate", "restingHeartRate"),
                              ("bpmAverage", "bpm", "value"))

    sleep = {"minutes_asleep": None, "minutes_awake": None,
             "efficiency": None, "stages": {}}
    sessions = list_sleep(token, day)
    if sessions:
        asleep = awake = 0
        stages: dict = {}
        for point in sessions:
            payload = point.get("sleep", point)
            asleep += int(_first_number(payload.get("minutesAsleep")) or 0)
            awake += int(_first_number(payload.get("minutesAwake")) or 0)
            for stage, minutes in (payload.get("stageMinutes") or {}).items():
                mins = _first_number(minutes)
                if mins is not None:
                    stages[stage.upper()] = stages.get(stage.upper(), 0) + int(mins)
        total = asleep + awake
        sleep = {
            "minutes_asleep": asleep,
            "minutes_awake": awake,
            "efficiency": round(100 * asleep / total) if total else None,
            "stages": stages,
        }

    return {
        "date": day,
        "sleep": sleep,
        "resting_hr": resting_hr,
        "steps": steps,
        "calories": calories,
        "active_minutes": active_min,
    }


# ---------------------------------------------------------------------------
# Formatting
# ---------------------------------------------------------------------------

def _hm(minutes) -> str:
    if minutes is None:
        return "no data"
    minutes = int(minutes)
    return f"{minutes // 60}h {minutes % 60:02d}m"


def _num(value, suffix: str = "") -> str:
    if value is None:
        return "no data"
    return f"{int(round(value)):,}{suffix}"


def format_daily_message(m: dict) -> str:
    sleep = m["sleep"]
    poor_sleep = (
        sleep["minutes_asleep"] is not None
        and (sleep["minutes_asleep"] < 360
             or (sleep["efficiency"] is not None and sleep["efficiency"] < 80))
    )

    lines = []
    if poor_sleep:
        lines.append("⚠️ *Poor sleep last night*")
    lines.append(f"🩺 *Daily Health Summary — {m['date'].strftime('%a %d %b %Y')}*")
    lines.append("")

    eff = f" · {sleep['efficiency']}% efficiency" if sleep["efficiency"] is not None else ""
    lines.append(f"😴 *Sleep*: {_hm(sleep['minutes_asleep'])}{eff}")
    stages = sleep["stages"]
    if stages:
        order = [("DEEP", "Deep"), ("REM", "REM"), ("LIGHT", "Light"), ("AWAKE", "Awake")]
        parts = [f"{label} {_hm(stages[key])}" for key, label in order if key in stages]
        if parts:
            lines.append("      " + " · ".join(parts))

    lines.append(f"❤️ *Resting HR*: {_num(m['resting_hr'], ' bpm')}")
    lines.append(f"👟 *Steps*: {_num(m['steps'])}")
    lines.append(f"🔥 *Calories*: {_num(m['calories'], ' kcal')}")
    lines.append(f"⚡ *Active minutes*: {_num(m['active_minutes'])}")

    if all(m[k] is None for k in ("resting_hr", "steps", "calories")) \
            and sleep["minutes_asleep"] is None:
        lines.append("")
        lines.append("_No data for yesterday — check that the Fitbit app on your "
                     "phone has Background App Refresh + Bluetooth enabled so it "
                     "syncs without being opened._")
    return "\n".join(lines)


def format_weekly_message(token: str, today: date) -> str:
    """7-day trend (the week ending yesterday), sent on Sundays."""
    end = today - timedelta(days=1)
    start = end - timedelta(days=6)

    def series(data_type, type_keys, value_keys):
        points = daily_rollup(token, data_type, start, end)
        values = [rollup_value([p], type_keys, value_keys) for p in points]
        return [v for v in values if v is not None]

    steps = series("steps", ("steps",), ("countSum",))
    calories = series("total-calories", ("totalCalories", "total_calories"),
                      ("energySum", "kcalSum", "caloriesSum"))
    rhr = series("daily-resting-heart-rate",
                 ("dailyRestingHeartRate", "restingHeartRate"),
                 ("bpmAverage", "bpm", "value"))

    sleep_minutes = []
    for offset in range(7):
        day = start + timedelta(days=offset)
        try:
            sessions = list_sleep(token, day)
        except RuntimeError as exc:
            log.warning("weekly: sleep fetch for %s failed: %s", day, exc)
            continue
        total = sum(int(_first_number(p.get("sleep", p).get("minutesAsleep")) or 0)
                    for p in sessions)
        if total:
            sleep_minutes.append(total)

    def avg(values):
        return sum(values) / len(values) if values else None

    lines = [
        f"📈 *Weekly Trend — {start.strftime('%d %b')} to {end.strftime('%d %b')}*",
        "",
        f"😴 Avg sleep: {_hm(avg(sleep_minutes))} ({len(sleep_minutes)}/7 nights logged)",
        f"❤️ Avg resting HR: {_num(avg(rhr), ' bpm')}",
        f"👟 Avg steps: {_num(avg(steps))} /day",
        f"🔥 Total calories: {_num(sum(calories) if calories else None, ' kcal')}",
    ]
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Telegram + CSV log
# ---------------------------------------------------------------------------

def send_telegram(text: str) -> None:
    resp = request_with_retries(
        "POST",
        f"https://api.telegram.org/bot{require_env('TG_TOKEN')}/sendMessage",
        data={"chat_id": require_env("TG_CHAT_ID"), "text": text,
              "parse_mode": "Markdown"},
    )
    if resp.status_code != 200:
        raise RuntimeError(f"Telegram send failed ({resp.status_code}): {resp.text[:300]}")


def append_csv_log(m: dict) -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    is_new = not LOG_FILE.exists()
    sleep = m["sleep"]
    stages = sleep["stages"]
    row = {
        "date": m["date"].isoformat(),
        "minutes_asleep": sleep["minutes_asleep"],
        "minutes_awake": sleep["minutes_awake"],
        "sleep_efficiency_pct": sleep["efficiency"],
        "deep_min": stages.get("DEEP"),
        "rem_min": stages.get("REM"),
        "light_min": stages.get("LIGHT"),
        "resting_hr_bpm": m["resting_hr"],
        "steps": m["steps"],
        "total_calories_kcal": m["calories"],
        "active_minutes": m["active_minutes"],
    }
    with LOG_FILE.open("a", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=CSV_FIELDS)
        if is_new:
            writer.writeheader()
        writer.writerow(row)
    log.info("Appended %s to %s", row["date"], LOG_FILE)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    today = datetime.now(IST).date()
    yesterday = today - timedelta(days=1)
    log.info("Fetching health summary for %s (IST)", yesterday)

    token = get_access_token()
    metrics = fetch_day_metrics(token, yesterday)

    send_telegram(format_daily_message(metrics))
    append_csv_log(metrics)

    if today.weekday() == 6:  # Sunday: add the 7-day trend
        send_telegram(format_weekly_message(token, today))

    log.info("Done.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001 - alert instead of dying silently
        log.exception("Run failed")
        try:
            send_telegram(
                "🚨 *Fitbit daily summary failed*\n"
                f"`{type(exc).__name__}: {str(exc)[:500]}`\n"
                "Check the GitHub Actions run logs."
            )
        except Exception:  # noqa: BLE001
            log.exception("Could not send failure alert to Telegram either")
        sys.exit(1)
