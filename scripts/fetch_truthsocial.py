#!/usr/bin/env python3
"""Fetch recent Truth Social posts via truthbrush and persist normalized JSON cache."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any

HANDLE = "realDonaldTrump"
MAX_POSTS = 100
ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OUT_PATH = DATA_DIR / "posts.json"
DEBUG_PATH = DATA_DIR / "truthbrush-debug.json"
STATUS_PATH = DATA_DIR / "truthsocial-sync-status.json"


def log(message: str) -> None:
    print(f"[truthsocial-sync] {message}")


def _load_dotenv(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values

    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        values[key] = value
    return values


def _load_credentials() -> tuple[dict[str, str], bool]:
    env = dict(os.environ)
    dotenv = _load_dotenv(ROOT / ".env")

    for key, value in dotenv.items():
        env.setdefault(key, value)

    token = env.get("TRUTHSOCIAL_TOKEN", "").strip()
    username = env.get("TRUTHSOCIAL_USERNAME", "").strip()
    password = env.get("TRUTHSOCIAL_PASSWORD", "").strip()

    log(f"found env TRUTHSOCIAL_TOKEN={bool(token)} TRUTHSOCIAL_USERNAME={bool(username)} TRUTHSOCIAL_PASSWORD={bool(password)}")

    if token:
        return {"TRUTHSOCIAL_TOKEN": token}, True

    if username and password:
        return {
            "TRUTHSOCIAL_USERNAME": username,
            "TRUTHSOCIAL_PASSWORD": password,
        }, False

    raise RuntimeError(
        "Missing Truth Social credentials. Set TRUTHSOCIAL_TOKEN or both "
        "TRUTHSOCIAL_USERNAME and TRUTHSOCIAL_PASSWORD in environment or .env"
    )


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

    created = post.get("created_at") or post.get("createdAt") or post.get("timestamp") or post.get("published_at")
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
        "raw": post,
    }


def _extract_statuses(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [p for p in payload if isinstance(p, dict)]
    if isinstance(payload, dict):
        statuses = payload.get("statuses") or payload.get("posts") or payload.get("data") or []
        if isinstance(statuses, list):
            return [p for p in statuses if isinstance(p, dict)]
    return []


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


def fetch_truthbrush_cli(debug: bool = False) -> tuple[list[dict[str, Any]], str, str]:
    truthbrush_cmd = shutil.which("truthbrush")
    log(f"truthbrush command found={bool(truthbrush_cmd)}")
    if not truthbrush_cmd:
        raise RuntimeError("truthbrush is not installed or not on PATH")

    if sys.version_info < (3, 10):
        raise RuntimeError(f"Python 3.10+ required, got {sys.version.split()[0]}")

    creds, using_token = _load_credentials()
    cmd = [truthbrush_cmd, "statuses", HANDLE, "--include_reblogs"]
    log(f"python version={sys.version.split()[0]}")
    log(f"cwd={Path.cwd()}")
    log(f"resolved output path={OUT_PATH}")
    log(f"using token auth={using_token}")
    log(f"exact command={' '.join(cmd)}")

    env = dict(os.environ)
    env.update(creds)

    result = subprocess.run(cmd, capture_output=True, text=True, check=False, env=env, cwd=ROOT)
    stdout = result.stdout or ""
    stderr = result.stderr or ""
    log(f"exit code={result.returncode}")
    log(f"stdout preview={stdout[:500]!r}")
    log(f"stderr preview={stderr[:500]!r}")

    if result.returncode != 0:
        raise RuntimeError(f"truthbrush command failed with exit code {result.returncode}")

    raw = stdout.strip()
    if not raw:
        return [], stdout, stderr

    parsed: Any
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

    statuses = _extract_statuses(parsed)
    if not statuses and raw:
        _atomic_write(DEBUG_PATH, {"raw": raw, "stderr": stderr, "note": "Parsing produced zero statuses"})
        if debug:
            log(f"wrote debug raw output to {DEBUG_PATH}")

    return statuses, stdout, stderr


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--debug", action="store_true")
    args = parser.parse_args()

    DATA_DIR.mkdir(parents=True, exist_ok=True)

    try:
        statuses, stdout, stderr = fetch_truthbrush_cli(debug=args.debug)
        normalized = [normalize(post) for post in statuses if isinstance(post, dict)]
        normalized = [p for p in normalized if p["text"]]
        normalized.sort(key=lambda p: p["createdAt"], reverse=True)
        normalized = normalized[:MAX_POSTS]

        log(f"number of posts parsed={len(normalized)}")
        if normalized:
            log(f"first post timestamp={normalized[0]['createdAt']}")

        _atomic_write(OUT_PATH, normalized)
        _write_status("success", None, len(normalized))
        print(json.dumps({"success": True, "count": len(normalized), "output": str(OUT_PATH), "stdout": stdout[:5000], "stderr": stderr[:5000]}))
        return 0
    except Exception as exc:
        _write_status("failed", str(exc), 0)
        print(
            json.dumps(
                {
                    "success": False,
                    "error": str(exc),
                    "output": str(OUT_PATH),
                    "debug": str(DEBUG_PATH),
                }
            ),
            file=sys.stderr,
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
