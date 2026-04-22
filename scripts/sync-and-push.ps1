# sync-and-push.ps1
# Syncs Truth Social posts and pushes to GitHub so Vercel redeploys.
# Runs from YOUR machine (residential IP) - bypasses Cloudflare.
#
# TASK SCHEDULER SETUP (one-time):
#   Program:   powershell.exe
#   Arguments: -ExecutionPolicy Bypass -WindowStyle Hidden -File "C:\Users\Administrator\Desktop\RND projects\whattrumpsays-main\scripts\sync-and-push.ps1"
#   Start in:  C:\Users\Administrator\Desktop\RND projects\whattrumpsays-main
#   Repeat every 4 hours, Wake computer to run, Run as soon as possible after missed start.

$ErrorActionPreference = "Continue"
$ProjectDir = "C:\Users\Administrator\Desktop\RND projects\whattrumpsays-main"
$Python     = "C:\Users\Administrator\AppData\Local\Programs\Python\Python313\python.exe"
$Node       = "C:\Program Files\nodejs\node.exe"
$Git        = "C:\Program Files\Git\cmd\git.exe"
$LogFile    = "$ProjectDir\scripts\sync.log"

Set-Location $ProjectDir

function Log($msg) {
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg"
    Write-Host $line
    Add-Content -Path $LogFile -Value $line
}

# Keep log under 500 lines
if (Test-Path $LogFile) {
    $lines = Get-Content $LogFile
    if ($lines.Count -gt 500) { $lines[-400..-1] | Set-Content $LogFile }
}

Log ""
Log "=== Truth Social Sync ==="

try {
    # Pull latest
    Log "[1/4] git pull..."
    $pullOut = & $Git pull origin main --rebase --autostash 2>&1
    $pullOut | ForEach-Object { Log "      $_" }

    # API sync first (fast, no browser)
    Log "[2/4] Fetching posts via API..."
    & $Node scripts/fetch_api.mjs
    if ($LASTEXITCODE -ne 0) {
        Log "      API blocked - falling back to Playwright..."
        & $Python scripts/fetch_playwright.py
        if ($LASTEXITCODE -ne 0) { Log "ERROR: Both sync methods failed"; exit 1 }
    }

    # Stage changes
    Log "[3/4] Checking for changes..."
    & $Git add data/posts.json data/truthsocial-sync-status.json

    $staged = & $Git diff --staged --name-only
    if (-not $staged) {
        Log "      No new posts - nothing to commit."
        Log "=== Done (no changes) ==="
        exit 0
    }

    # Commit + push
    $count = (Get-Content data/posts.json -Raw | ConvertFrom-Json).Count
    Log "[4/4] Pushing $count posts to GitHub..."
    & $Git commit -m "chore: sync Truth Social data ($count posts) [skip ci]"
    & $Git push origin main

    Log "=== Done - $count posts live ==="

} catch {
    Log "ERROR: $_"
    exit 1
}
