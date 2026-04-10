#!/usr/bin/env python3
"""Fetch Truth Social posts using a real Chromium browser (bypasses Cloudflare)."""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OUT_PATH = DATA_DIR / "posts.json"
STATUS_PATH = DATA_DIR / "truthsocial-sync-status.json"
LOCAL_CREDENTIALS_PATH = ROOT / "scripts" / "truthsocial.credentials.local.json"

HANDLE = "realDonaldTrump"
PROFILE_URL = f"https://truthsocial.com/@{HANDLE}"
MAX_POSTS = 100
MAX_SCROLL_ROUNDS = 8


def log(msg: str) -> None:
    print(f"[playwright-sync] {msg}")


def _load_credentials() -> dict[str, str]:
    env = dict(os.environ)
    token = env.get("TRUTHSOCIAL_TOKEN", "").strip()
    username = env.get("TRUTHSOCIAL_USERNAME", "").strip()
    password = env.get("TRUTHSOCIAL_PASSWORD", "").strip()

    if token or (username and password):
        return {"token": token, "username": username, "password": password}

    if LOCAL_CREDENTIALS_PATH.exists():
        raw = json.loads(LOCAL_CREDENTIALS_PATH.read_text(encoding="utf-8"))
        return {
            "token": str(raw.get("TRUTHSOCIAL_TOKEN", "")).strip(),
            "username": str(raw.get("TRUTHSOCIAL_USERNAME", "")).strip(),
            "password": str(raw.get("TRUTHSOCIAL_PASSWORD", "")).strip(),
        }

    return {}


def _to_iso(value: Any) -> str:
    if isinstance(value, str) and value:
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return parsed.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
        except ValueError:
            return value
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(float(value), tz=timezone.utc).isoformat().replace("+00:00", "Z")
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _source_url(post: dict[str, Any]) -> str:
    post_id = post.get("id") or post.get("id_str") or ""
    if post.get("url"):
        return str(post["url"])
    if post.get("uri"):
        return str(post["uri"])
    if post_id:
        return f"https://truthsocial.com/@{HANDLE}/posts/{post_id}"
    return f"https://truthsocial.com/@{HANDLE}"


def _normalize(post: dict[str, Any]) -> dict[str, Any] | None:
    text = post.get("content") or post.get("text") or post.get("status") or ""
    # Strip HTML tags from content
    import re
    text = re.sub(r"<[^>]+>", "", str(text)).strip()
    # Decode common HTML entities
    text = text.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&#39;", "'").replace("&quot;", '"')
    text = text.strip()
    if not text:
        return None

    created = post.get("created_at") or post.get("createdAt") or post.get("timestamp")
    post_id = post.get("id") or post.get("id_str") or post.get("uri") or f"fallback-{hash(text)}"

    # Extract media attachments
    media = []
    for att in post.get("media_attachments") or []:
        att_type = att.get("type", "")
        url = att.get("url") or att.get("remote_url") or ""
        if url and att_type in ("image", "video", "gifv"):
            media.append({
                "type": "image" if att_type == "image" else "video",
                "url": url,
                "alt": att.get("description") or "",
            })

    return {
        "id": str(post_id),
        "text": text,
        "createdAt": _to_iso(created),
        "source": "Truth Social",
        "sourceUrl": _source_url(post),
        "authorName": "Donald J. Trump",
        "authorHandle": "@realDonaldTrump",
        "media": media,
        "isReply": bool(post.get("in_reply_to_id")),
        "isRepost": bool(post.get("reblog")),
        "sharesCount": int(post.get("reblogs_count") or 0),
        "favouritesCount": int(post.get("favourites_count") or 0),
    }


def _atomic_write(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as tmp:
        tmp.write(json.dumps(payload, indent=2))
        tmp.write("\n")
        temp_name = tmp.name
    Path(temp_name).replace(path)


def _write_status(status: str, error: str | None = None, count: int = 0) -> None:
    _atomic_write(
        STATUS_PATH,
        {
            "status": status,
            "error": error,
            "count": count,
            "updatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        },
    )


def fetch_with_playwright(debug: bool = False) -> list[dict[str, Any]]:
    from playwright.sync_api import sync_playwright, Response

    creds = _load_credentials()
    collected: dict[str, dict[str, Any]] = {}  # id -> post, deduped

    log("launching Chromium browser")

    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-setuid-sandbox",
            ],
        )

        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/146.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 900},
            locale="en-US",
        )

        # Hide automation signals
        context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            window.chrome = { runtime: {} };
        """)

        page = context.new_page()

        # Capture statuses API responses
        def on_response(response: Response) -> None:
            url = response.url
            if "/api/v1/accounts/" in url and "/statuses" in url:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        for p in data:
                            if isinstance(p, dict) and p.get("id"):
                                collected[p["id"]] = p
                        log(f"captured {len(data)} posts from {url.split('?')[0]}")
                except Exception:
                    pass
            # Also capture timeline endpoint
            elif "/api/v1/timelines/public" in url or "/api/v1/accounts/realDonaldTrump" in url:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        for p in data:
                            if isinstance(p, dict) and p.get("id"):
                                collected[p["id"]] = p
                except Exception:
                    pass

        page.on("response", on_response)

        # If we have a token, inject it as a cookie / local storage before navigating
        if creds.get("token"):
            log("injecting auth token into browser storage")
            # Navigate to origin first to set storage
            page.goto("https://truthsocial.com", wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(3000)
            page.evaluate(f"""
                localStorage.setItem('userToken', '{creds["token"]}');
                localStorage.setItem('access_token', '{creds["token"]}');
            """)

        log(f"navigating to {PROFILE_URL}")
        try:
            page.goto(PROFILE_URL, wait_until="domcontentloaded", timeout=45000)
        except Exception as e:
            log(f"navigation warning: {e}")

        # Wait for Cloudflare challenge or page content
        log("waiting for page to clear Cloudflare challenge...")
        try:
            # Wait up to 20s for either posts to appear or CF to clear
            page.wait_for_function(
                "() => !document.title.toLowerCase().includes('just a moment') && document.readyState === 'complete'",
                timeout=20000,
            )
        except Exception:
            log("timeout waiting for CF - continuing anyway")

        page.wait_for_timeout(4000)
        log(f"page title: {page.title()}")

        # Scroll to trigger lazy-loading of posts
        log("scrolling to load posts")
        for i in range(MAX_SCROLL_ROUNDS):
            before = len(collected)
            page.evaluate("window.scrollBy(0, window.innerHeight * 3)")
            page.wait_for_timeout(2000)
            after = len(collected)
            log(f"scroll {i+1}: collected={after} (+{after-before})")
            if after >= MAX_POSTS:
                break

        # If still no posts and we have credentials, try logging in
        if len(collected) == 0 and creds.get("username") and creds.get("password"):
            log("no posts captured, attempting login")
            try:
                page.goto("https://truthsocial.com/login", wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(3000)
                page.wait_for_function(
                    "() => !document.title.toLowerCase().includes('just a moment')",
                    timeout=15000,
                )
                # Fill login form
                page.fill('input[name="username"], input[type="email"], #user_email', creds["username"])
                page.wait_for_timeout(500)
                page.fill('input[name="password"], input[type="password"], #user_password', creds["password"])
                page.wait_for_timeout(500)
                page.keyboard.press("Enter")
                page.wait_for_timeout(5000)
                log(f"after login, page title: {page.title()}")

                # Navigate back to profile
                page.goto(PROFILE_URL, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(4000)

                for i in range(MAX_SCROLL_ROUNDS):
                    before = len(collected)
                    page.evaluate("window.scrollBy(0, window.innerHeight * 3)")
                    page.wait_for_timeout(2000)
                    after = len(collected)
                    log(f"scroll {i+1} (post-login): collected={after} (+{after-before})")
                    if after >= MAX_POSTS:
                        break
            except Exception as e:
                log(f"login attempt failed: {e}")

        if debug:
            page.screenshot(path=str(DATA_DIR / "playwright-debug.png"))
            log(f"screenshot saved to {DATA_DIR / 'playwright-debug.png'}")

        browser.close()

    return list(collected.values())


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--debug", action="store_true")
    args = parser.parse_args()

    DATA_DIR.mkdir(parents=True, exist_ok=True)

    try:
        raw_posts = fetch_with_playwright(debug=args.debug)
        log(f"total raw posts captured: {len(raw_posts)}")

        normalized = [_normalize(p) for p in raw_posts if isinstance(p, dict)]
        normalized = [p for p in normalized if p is not None]
        normalized.sort(key=lambda p: p["createdAt"], reverse=True)
        normalized = normalized[:MAX_POSTS]

        log(f"normalized posts: {len(normalized)}")
        if normalized:
            log(f"latest post: {normalized[0]['createdAt']}")

        _atomic_write(OUT_PATH, normalized)
        _write_status("success", None, len(normalized))
        print(json.dumps({"success": True, "count": len(normalized), "output": str(OUT_PATH)}))
        return 0

    except Exception as exc:
        import traceback
        _write_status("failed", str(exc), 0)
        traceback.print_exc()
        print(json.dumps({"success": False, "error": str(exc)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
