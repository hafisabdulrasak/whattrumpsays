# sync-and-push.ps1
# ─────────────────────────────────────────────────────────────────────────────
# Syncs Truth Social posts and pushes to GitHub so Vercel redeploys.
# Runs from YOUR machine (residential IP) — bypasses Cloudflare.
#
# Your computer does NOT need to stay on. Use "Wake the computer to run
# this task" in Task Scheduler and Windows will wake from sleep, sync,
# then go back to sleep automatically.
#
# ── TASK SCHEDULER SETUP (one-time, ~3 minutes) ─────────────────────────────
#
#  1. Press Win+S → search "Task Scheduler" → Open
#  2. Click "Create Task" (right panel, NOT "Create Basic Task")
#  3. General tab:
#       Name: WhatTrumpSays Sync
#       ✓ Run whether user is logged on or not
#       ✓ Run with highest privileges
#  4. Triggers tab → New:
#       Begin the task: On a schedule → Daily
#       Repeat task every: 4 hours  for a duration of: Indefinitely
#       ✓ Enabled
#  5. Actions tab → New:
#       Program:   powershell.exe
#       Arguments: -ExecutionPolicy Bypass -WindowStyle Hidden -File "C:\Users\Administrator\Desktop\RND projects\whattrumpsays-main\scripts\sync-and-push.ps1"
#       Start in:  C:\Users\Administrator\Desktop\RND projects\whattrumpsays-main
#  6. Conditions tab:
#       ✓ Wake the computer to run this task    ← KEY SETTING
#       (uncheck "Start only if on AC power" if on a laptop)
#  7. Settings tab:
#       ✓ Run task as soon as possible after a scheduled start is missed
#  8. Click OK → enter your Windows password if prompted
#
# To test immediately: right-click the task → Run
# ─────────────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"
$ProjectDir = "C:\Users\Administrator\Desktop\RND projects\whattrumpsays-main"
Set-Location $ProjectDir

$ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host ""
Write-Host "=== Truth Social Sync  $ts ==="

try {
    # Pull latest (handles any remote-only changes)
    Write-Host "[1/4] git pull..."
    git pull origin main --rebase --autostash 2>&1 | ForEach-Object { Write-Host "      $_" }

    # Fast API sync — no browser needed, works from home IP
    Write-Host "[2/4] Fetching posts via API..."
    node scripts/fetch_api.mjs
    if ($LASTEXITCODE -ne 0) {
        # Fallback: full Playwright browser sync
        Write-Host "      API sync failed — falling back to Playwright..."
        python scripts/fetch_playwright.py
        if ($LASTEXITCODE -ne 0) { throw "Both sync methods failed" }
    }

    # Stage changes
    Write-Host "[3/4] Checking for changes..."
    git add data/posts.json data/truthsocial-sync-status.json

    $staged = git diff --staged --name-only
    if (-not $staged) {
        Write-Host "      No new posts — nothing to commit."
        Write-Host "=== Done (no changes) ==="
        exit 0
    }

    # Commit + push
    $count = (Get-Content data/posts.json -Raw | ConvertFrom-Json).Count
    Write-Host "[4/4] Pushing $count posts to GitHub..."
    git commit -m "chore: sync Truth Social data ($count posts) [skip ci]"
    git push origin main

    Write-Host "=== Done — $count posts live. Vercel redeploys in ~30s ==="

} catch {
    Write-Host "ERROR: $_"
    exit 1
}
