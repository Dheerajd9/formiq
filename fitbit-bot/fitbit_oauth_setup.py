#!/usr/bin/env python3
"""One-time OAuth2 setup for the Fitbit -> Telegram daily summary bot.

Fitbit's legacy Web API (api.fitbit.com + Fitbit OAuth) shuts down in
September 2026, so this bot targets its replacement: the Google Health API
(health.googleapis.com/v4) with standard Google OAuth 2.0.

This script runs the authorization-code flow once, on your own machine,
and prints the refresh token you then store as the GOOGLE_REFRESH_TOKEN
GitHub Actions secret. Google refresh tokens do NOT rotate on use, so the
daily job never needs to write the secret back.

Prerequisites (see fitbit-bot/README.md for the click-by-click version):
  1. A Google Cloud project with the Google Health API enabled.
  2. An OAuth consent screen published to "In production" (unverified is
     fine for personal use — testing mode expires refresh tokens in 7 days,
     which would silently kill the cron).
  3. A "Desktop app" OAuth client; export its ID/secret as
     GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET before running this.

Usage:
    GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... python fitbit_oauth_setup.py
"""

import http.server
import os
import sys
import threading
import urllib.parse
import webbrowser

import requests

AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"
REDIRECT_PORT = 8765
REDIRECT_URI = f"http://localhost:{REDIRECT_PORT}"

# Read-only scopes covering everything daily_summary.py fetches:
#   sleep                         -> sleep sessions + stage minutes
#   activity_and_fitness          -> steps, total calories, active minutes
#   health_metric_and_measurements-> daily resting heart rate
SCOPES = [
    "https://www.googleapis.com/auth/googlehealth.sleep.readonly",
    "https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly",
    "https://www.googleapis.com/auth/googlehealth.health_metric_and_measurements.readonly",
]


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        sys.exit(f"Missing required environment variable: {name}")
    return value


def build_auth_url(client_id: str) -> str:
    params = {
        "client_id": client_id,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        # access_type=offline + prompt=consent guarantees a refresh token is
        # issued even if you've authorized this client before.
        "access_type": "offline",
        "prompt": "consent",
    }
    return f"{AUTH_URL}?{urllib.parse.urlencode(params)}"


class _CodeCatcher(http.server.BaseHTTPRequestHandler):
    """Tiny localhost server that captures ?code=... from Google's redirect."""

    code = None
    error = None

    def do_GET(self):  # noqa: N802 - required name
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        _CodeCatcher.code = (query.get("code") or [None])[0]
        _CodeCatcher.error = (query.get("error") or [None])[0]
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        body = (
            "<h2>Authorization received — you can close this tab.</h2>"
            if _CodeCatcher.code
            else f"<h2>Authorization failed: {_CodeCatcher.error}</h2>"
        )
        self.wfile.write(body.encode())

    def log_message(self, *args):  # silence request logging
        pass


def wait_for_code() -> str:
    server = http.server.HTTPServer(("localhost", REDIRECT_PORT), _CodeCatcher)
    thread = threading.Thread(target=server.handle_request, daemon=True)
    thread.start()
    thread.join(timeout=300)
    server.server_close()
    if _CodeCatcher.error:
        sys.exit(f"Google returned an OAuth error: {_CodeCatcher.error}")
    if not _CodeCatcher.code:
        # Headless / browser-on-another-machine fallback.
        pasted = input(
            "\nNo redirect captured. Paste the full redirect URL "
            "(http://localhost:8765/?code=...) here: "
        ).strip()
        query = urllib.parse.parse_qs(urllib.parse.urlparse(pasted).query)
        code = (query.get("code") or [None])[0]
        if not code:
            sys.exit("Could not extract ?code= from that URL.")
        return code
    return _CodeCatcher.code


def exchange_code(client_id: str, client_secret: str, code: str) -> dict:
    resp = requests.post(
        TOKEN_URL,
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": REDIRECT_URI,
        },
        timeout=30,
    )
    if resp.status_code != 200:
        sys.exit(f"Token exchange failed ({resp.status_code}): {resp.text}")
    return resp.json()


def main() -> None:
    client_id = require_env("GOOGLE_CLIENT_ID")
    client_secret = require_env("GOOGLE_CLIENT_SECRET")

    url = build_auth_url(client_id)
    print("Opening Google consent screen in your browser...")
    print("If it doesn't open, visit this URL manually:\n")
    print(url + "\n")
    webbrowser.open(url)

    code = wait_for_code()
    tokens = exchange_code(client_id, client_secret, code)

    refresh_token = tokens.get("refresh_token")
    if not refresh_token:
        sys.exit(
            "No refresh_token in the response. Re-run this script — the "
            "prompt=consent parameter should force one. Response was:\n"
            f"{tokens}"
        )

    print("Success! Granted scopes:", tokens.get("scope", "(not reported)"))
    print("\nAdd these GitHub Actions repository secrets:")
    print(f"  GOOGLE_CLIENT_ID     = {client_id}")
    print("  GOOGLE_CLIENT_SECRET = (the client secret you used)")
    print(f"  GOOGLE_REFRESH_TOKEN = {refresh_token}")
    print(
        "\nGoogle refresh tokens do not rotate, so this is a one-time setup. "
        "The token only becomes invalid if you revoke access, or if it goes "
        "unused for ~6 months (the daily cron prevents that)."
    )


if __name__ == "__main__":
    main()
