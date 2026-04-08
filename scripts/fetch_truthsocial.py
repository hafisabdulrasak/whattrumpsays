#!/usr/bin/env python3
"""Fetch recent Truth Social posts and persist normalized JSON cache."""

from __future__ import annotations

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

HANDLE = "realDonaldTrump"
MAX_POSTS = 100
ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "data" / "posts.json"


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


def normalize(post: dict[str, Any]) -> dict[str, Any]:
    text = post.get("content") or post.get("text") or post.get("status") or ""
    text = str(text).strip()

    created = (
        post.get("created_at")
        or post.get("createdAt")
        or post.get("timestamp")
        or post.get("published_at")
    )

    post_id = post.get("id") or post.get("id_str") or post.get("uri") or f"fallback-{hash(text)}"

    return {
        "id": str(post_id),
        "text": text,
        "createdAt": _to_iso(created),
        "source": "Truth Social",
        "sourceUrl": _source_url(post),
        "authorName": "Donald J. Trump",
        "authorHandle": "@realDonaldTrump",
        "media": [],
        "isReply": False,
        "isRepost": False,
    }


def _extract_statuses(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [p for p in payload if isinstance(p, dict)]
    if isinstance(payload, dict):
        statuses = payload.get("statuses") or payload.get("posts") or payload.get("data") or []
        if isinstance(statuses, list):
            return [p for p in statuses if isinstance(p, dict)]
    return []


def fetch_truthbrush_cli() -> list[dict[str, Any]]:
    cmd = ["truthbrush", "statuses", HANDLE, "--include_reblogs"]
    result = subprocess.run(cmd, capture_output=True, text=True, check=False)

    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "truthbrush command failed")

    raw = result.stdout.strip()
    if not raw:
        return []

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        parsed = []
        for line in raw.splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                parsed.append(json.loads(line))
            except json.JSONDecodeError:
                continue

    return _extract_statuses(parsed)


def main() -> int:
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    try:
        statuses = fetch_truthbrush_cli()
        normalized = [normalize(post) for post in statuses if isinstance(post, dict)]
        normalized = [p for p in normalized if p["text"]]
        normalized.sort(key=lambda p: p["createdAt"], reverse=True)
        normalized = normalized[:MAX_POSTS]

        OUT_PATH.write_text(json.dumps(normalized, indent=2), encoding="utf-8")
        print(json.dumps({"success": True, "count": len(normalized), "output": str(OUT_PATH)}))
        return 0
    except Exception as exc:
        # Preserve last cached file on failure.
        if not OUT_PATH.exists():
            OUT_PATH.write_text("[]\n", encoding="utf-8")
        print(json.dumps({"success": False, "error": str(exc), "output": str(OUT_PATH)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
