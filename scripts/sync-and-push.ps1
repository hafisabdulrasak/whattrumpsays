# sync-and-push.ps1
# ─────────────────────────────────────────────────────────────────────────────
# Fetches new Truth Social posts on your local machine (bypasses Cloudflare)
# and pushes data/posts.json to GitHub so Vercel redeploys automatically.
#
# SETUP (one-time):
#   1. Open Task Scheduler → Create Basic Task
#   2. Trigger: Daily, repeat every 2 hours
#   3. Action: Start a program
#      Program:   powershell.exe
#      Arguments: -ExecutionPolicy Bypass -File "C:\Users\Administrator\Desktop\RND projects\whattrumpsays-main\scripts\sync-and-push.ps1"
#      Start in:  C:\Users\Administrator\Desktop\RND projects\whattrumpsays-main
# ─────────────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectDir

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host ""
Write-Host "═══════════════════════════════════════════════"
Write-Host "  Truth Social Sync — $timestamp"
Write-Host "═══════════════════════════════════════════════"

try {
    # 1. Pull latest (handles any remote changes from manual edits)
    Write-Host ""
    Write-Host "[1/4] Pulling latest from GitHub..."
    git pull origin main --rebase --autostash 2>&1 | Write-Host

    # 2. Run Playwright sync (works here because your home IP isn't blocked)
    Write-Host ""
    Write-Host "[2/4] Fetching posts via Playwright..."
    python scripts/fetch_playwright.py
    if ($LASTEXITCODE -ne 0) {
        throw "Playwright sync exited with code $LASTEXITCODE"
    }

    # 3. Stage changes
    Write-Host ""
    Write-Host "[3/4] Checking for new posts..."
    git add data/posts.json data/truthsocial-sync-status.json

    $staged = git diff --staged --name-only
    if (-not $staged) {
        Write-Host "      No new posts — nothing to commit."
        Write-Host ""
        Write-Host "Done."
        exit 0
    }

    # 4. Commit + push
    $count = (Get-Content data/posts.json -Raw | ConvertFrom-Json).Count
    Write-Host ""
    Write-Host "[4/4] Pushing $count posts to GitHub..."
    git commit -m "chore: sync Truth Social data ($count posts) [skip ci]"
    git push origin main

    Write-Host ""
    Write-Host "✓ Done — $count posts pushed. Vercel will redeploy in ~30 seconds."

} catch {
    Write-Host ""
    Write-Host "✗ Sync failed: $_"
    exit 1
}
