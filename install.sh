#!/bin/bash
set -e

INSTALL_DIR="$HOME/.crackniet"
REPO="https://github.com/yash113gadia/crackniet.git"

echo ""
echo "  ⚡ CrackNIET Installer"
echo "  ─────────────────────"
echo ""

# Clone or update
if [ -d "$INSTALL_DIR" ]; then
    echo "  → Updating existing installation..."
    cd "$INSTALL_DIR" && git pull --quiet
else
    echo "  → Downloading CrackNIET..."
    git clone --quiet "$REPO" "$INSTALL_DIR"
fi

echo "  ✓ Installed to $INSTALL_DIR"
echo ""

# Open Chrome extensions page
echo "  → Opening Chrome extensions page..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "chrome://extensions" 2>/dev/null || true
elif [[ "$OSTYPE" == "linux"* ]]; then
    xdg-open "chrome://extensions" 2>/dev/null || true
fi

echo ""
echo "  ┌──────────────────────────────────────────┐"
echo "  │  Almost done! In Chrome:                 │"
echo "  │                                          │"
echo "  │  1. Enable 'Developer mode' (top-right)  │"
echo "  │  2. Click 'Load unpacked'                │"
echo "  │  3. Select: $INSTALL_DIR"
echo "  │                                          │"
echo "  │  Then click the extension icon,           │"
echo "  │  paste your OpenRouter API key,           │"
echo "  │  and hit Activate!                        │"
echo "  └──────────────────────────────────────────┘"
echo ""
