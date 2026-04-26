$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  ⚡ CrackNIET Installer" -ForegroundColor Red
Write-Host "  ─────────────────────"
Write-Host ""

$installDir = "$env:USERPROFILE\.crackniet"

# Check for git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "  ✗ Git is not installed. Get it from https://git-scm.com" -ForegroundColor Red
    exit 1
}

# Clone or update
if (Test-Path "$installDir\.git") {
    Write-Host "  → Updating existing installation..."
    Set-Location $installDir
    git pull --quiet
} else {
    if (Test-Path $installDir) { Remove-Item -Recurse -Force $installDir }
    Write-Host "  → Downloading CrackNIET..."
    git clone --quiet --depth 1 "https://github.com/yash113gadia/crackniet.git" $installDir
}

Write-Host "  ✓ Installed to $installDir" -ForegroundColor Green
Write-Host ""

# Try to open Chrome
try {
    Start-Process "chrome" "chrome://extensions" -ErrorAction SilentlyContinue
    Write-Host "  → Opened Chrome extensions page"
} catch {}

Write-Host ""
Write-Host "  ┌─────────────────────────────────────────────┐"
Write-Host "  │  Almost done! In Chrome:                    │"
Write-Host "  │                                             │"
Write-Host "  │  1. Go to chrome://extensions               │"
Write-Host "  │  2. Enable 'Developer mode' (top-right)     │"
Write-Host "  │  3. Click 'Load unpacked'                   │"
Write-Host "  │  4. Select: $installDir"
Write-Host "  │                                             │"
Write-Host "  │  Then click the extension icon,             │"
Write-Host "  │  paste your OpenRouter key, and Activate!   │"
Write-Host "  └─────────────────────────────────────────────┘"
Write-Host ""
